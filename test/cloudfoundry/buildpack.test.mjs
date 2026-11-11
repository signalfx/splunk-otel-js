/*
 * Copyright Splunk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const source = join(root, 'buildpacks/cloudfoundry');

function fixture(t, archive) {
  const work = mkdtempSync(join(tmpdir(), 'splunk-cf-test-'));
  t.after(() => rmSync(work, { recursive: true, force: true }));
  const buildpack = join(work, 'buildpack');
  if (archive) {
    execFileSync('unzip', ['-q', resolve(archive), '-d', buildpack]);
  } else {
    cpSync(source, buildpack, { recursive: true });
    mkdirSync(join(buildpack, 'splunk-otel/node_modules'), { recursive: true });
    writeFileSync(
      join(buildpack, 'splunk-otel/instrument.js'),
      'globalThis.splunkLoaded = (globalThis.splunkLoaded || 0) + 1;'
    );
    writeFileSync(join(buildpack, 'VERSION'), 'test');
    writeFileSync(
      join(buildpack, 'config.yml'),
      'name: splunk-otel-nodejs\nversion: test\n'
    );
  }
  const staging = join(work, 'staging');
  const app = join(staging, 'app');
  const deps = join(staging, 'deps');
  mkdirSync(app, { recursive: true });
  writeFileSync(join(app, 'package.json'), '{"name":"cf-test"}');
  execFileSync('bash', [
    join(buildpack, 'bin/supply'),
    app,
    join(work, 'cache'),
    deps,
    '2',
  ]);
  assert.deepEqual(
    readdirSync(app),
    ['package.json'],
    'Supply must leave app files untouched'
  );
  assert.deepEqual(
    readdirSync(deps),
    ['2'],
    'Supply must write only its own dependency directory'
  );
  // libbuildpack copies dependency profiles to the root profile.d at finalize.
  const profiles = join(staging, 'profile.d');
  mkdirSync(profiles);
  cpSync(
    join(deps, '2/profile.d/splunk-otel.sh'),
    join(profiles, '2_splunk-otel.sh')
  );
  const runtime = join(work, 'running droplet');
  renameSync(staging, runtime);
  return {
    work,
    buildpack,
    runtime,
    profile: join(runtime, 'profile.d/2_splunk-otel.sh'),
  };
}

function launch(f, code, env = {}) {
  return execFileSync(
    'bash',
    [
      '-c',
      'source "$1"; source "$1"; exec "$2" -e "$3"',
      'launch',
      f.profile,
      process.execPath,
      code,
    ],
    {
      cwd: join(f.runtime, 'app'),
      env: {
        ...Object.fromEntries(
          Object.entries(process.env).filter(
            ([key]) => !/^(OTEL_|SPLUNK_)/.test(key)
          )
        ),
        NODE_OPTIONS: '',
        DEPS_DIR: join(f.runtime, 'deps'),
        ...env,
      },
      encoding: 'utf8',
      timeout: 30000,
    }
  );
}

test('supplies an isolated agent and preloads it after droplet relocation, preserving existing Node options', (t) => {
  const f = fixture(t);
  launch(
    f,
    'require("node:assert/strict").equal(globalThis.splunkLoaded, 1); require("node:assert/strict").equal(Error.stackTraceLimit, 75);',
    {
      NODE_OPTIONS: '--stack-trace-limit=75',
    }
  );
});

test('allows instrumentation to be disabled at launch', (t) => {
  const f = fixture(t);
  launch(
    f,
    'require("node:assert/strict").equal(globalThis.splunkLoaded, undefined);',
    {
      SPLUNK_OTEL_NODEJS_ENABLED: 'false',
    }
  );
});

test('declines automatic detection and explains incorrect buildpack ordering', () => {
  assert.equal(spawnSync('bash', [join(source, 'bin/detect')]).status, 100);
  const final = spawnSync('bash', [join(source, 'bin/finalize')], {
    encoding: 'utf8',
  });
  assert.equal(final.status, 1);
  assert.match(final.stderr, /before nodejs_buildpack/);
});

test('rejects invalid supply arguments and unbundled source checkouts', () => {
  for (const args of [
    [],
    ['app', 'cache', 'deps', '../outside'],
    ['app', 'cache', 'deps', '0'],
  ]) {
    const result = spawnSync('bash', [join(source, 'bin/supply'), ...args], {
      encoding: 'utf8',
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Usage:|Missing bundled agent/);
  }
});

test(
  'released ZIP starts the real agent without application dependencies',
  { skip: !process.env.CF_BUILDPACK_ZIP },
  (t) => {
    const f = fixture(t, process.env.CF_BUILDPACK_ZIP);
    for (const script of ['detect', 'supply', 'finalize']) {
      // Calling the extracted entry point directly also verifies ZIP permissions.
      const result = spawnSync(join(f.buildpack, 'bin', script), [], {
        encoding: 'utf8',
      });
      assert.equal(result.error, undefined);
    }
    const agent = join(f.runtime, 'deps/2/splunk-otel');
    assert.ok(existsSync(join(agent, 'node_modules/@opentelemetry/api')));
    for (const file of readdirSync(agent, { recursive: true })) {
      const path = join(agent, file);
      if (lstatSync(path).isSymbolicLink()) {
        assert.ok(
          existsSync(path),
          `Bundled symlink must survive relocation: ${file}`
        );
      }
    }
    const pkg = JSON.parse(readFileSync(join(agent, 'package.json'), 'utf8'));
    assert.equal(
      readFileSync(join(f.buildpack, 'VERSION'), 'utf8').trim(),
      pkg.version
    );
    const output = launch(
      f,
      `
    const assert = require('node:assert/strict');
    const { createRequire } = require('node:module');
    const fromAgent = createRequire(process.env.CF_TEST_AGENT + '/instrument.js');
    assert.equal(typeof fromAgent('./lib/native_ext').profiling.start, 'function');
    const api = fromAgent('@opentelemetry/api');
    const span = api.trace.getTracer('cloudfoundry-smoke').startSpan('test');
    assert.equal(span.isRecording(), true);
    assert.match(span.spanContext().traceId, /^[a-f0-9]{32}$/);
    assert.equal(span.resource.attributes['service.name'], 'cf-test');
    span.end();
    const http = require('node:http');
    const server = http.createServer((_req, res) => {
      assert.ok(api.trace.getActiveSpan()?.isRecording(), 'HTTP requests must be automatically instrumented');
      res.end('ok');
    });
    server.listen(0, '127.0.0.1', () => {
      http.get('http://127.0.0.1:' + server.address().port, (response) => {
        response.resume();
        response.on('end', () => server.close(async () => {
          await fromAgent('./lib').stop();
          console.log('Cloud Foundry agent started');
        }));
      });
    });
  `,
      {
        CF_TEST_AGENT: agent,
        OTEL_SERVICE_NAME: 'cf-test',
        SPLUNK_METRICS_ENABLED: 'false',
        SPLUNK_PROFILER_ENABLED: 'false',
        OTEL_TRACES_EXPORTER: 'console',
      }
    );
    assert.match(output, /Cloud Foundry agent started/);
  }
);
