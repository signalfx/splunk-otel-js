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

function fixture(t, archive, stagingEnv = {}) {
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
      'globalThis.splunkLoaded = (globalThis.splunkLoaded || 0) + 1; globalThis.splunkStartupEnv = { ...process.env };'
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
  const supplied = spawnSync(
    'bash',
    [join(buildpack, 'bin/supply'), app, join(work, 'cache'), deps, '2'],
    { env: { ...process.env, ...stagingEnv }, encoding: 'utf8' }
  );
  assert.equal(supplied.error, undefined);
  assert.equal(supplied.status, 0, supplied.stderr);
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
    stagingStderr: supplied.stderr,
  };
}

function launch(f, code, env = {}, command = 'exec "$2" -e "$3"') {
  return execFileSync(
    'bash',
    [
      '-c',
      `source "$1"; source "$1"; ${command}`,
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
            ([key]) =>
              !/^(OTEL_|SPLUNK_|VCAP_SERVICES(?:_FILE_PATH)?$|SERVICE_BINDING_ROOT$)/.test(
                key
              )
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

function services(credentials, names = { name: 'test-splunk-o11y' }) {
  return JSON.stringify({
    'user-provided': [{ ...names, credentials }],
    database: [
      { name: 'unrelated', credentials: { 'splunk.realm': 'ignored' } },
    ],
  });
}

function assertBindingEnvironment(f, env, expected) {
  return launch(
    f,
    [
      'const assert = require("node:assert/strict");',
      'assert.equal(globalThis.splunkLoaded, 1);',
      'const expected = ' + JSON.stringify(expected) + ';',
      'for (const [key, value] of Object.entries(expected)) {',
      '  assert.equal(globalThis.splunkStartupEnv[key] ?? null, value, key);',
      '}',
    ].join('\n'),
    env,
    'exec "$2" -e "$3" 2>&1'
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

test('reads runtime splunk-o11y credentials before starting instrumentation', (t) => {
  const stagingToken = 'staging-token-must-not-be-baked-in';
  const f = fixture(t, undefined, {
    VCAP_SERVICES: services({ 'splunk.access.token': stagingToken }),
  });
  const token = 'runtime-token-with-"quotes"-and-$()-characters';
  const output = assertBindingEnvironment(
    f,
    {
      VCAP_SERVICES: services({
        'splunk.realm': 'eu0',
        'splunk.access.token': token,
        'otel.service.name': 'bound-app',
        'otel.resource.attributes': 'deployment.environment=cf-test',
        'otel.exporter.otlp.endpoint': 'https://collector.example.com',
        'otel.instrumentation.http.capture_headers.server.request':
          'x-request-id',
        'splunk.metrics.enabled': false,
        'otel.metric.export.interval': 1234,
        'splunk.invalid': { nested: 'ignored' },
        'otel.invalid': ['ignored'],
        'splunk.empty': null,
        'splunk.invalid.value': 'invalid\0value',
        'otel.bad-key': 'ignored',
        NODE_OPTIONS: '--invalid-option',
        UNRELATED_SECRET: 'ignored',
      }),
    },
    {
      SPLUNK_REALM: 'eu0',
      SPLUNK_ACCESS_TOKEN: token,
      OTEL_SERVICE_NAME: 'bound-app',
      OTEL_RESOURCE_ATTRIBUTES: 'deployment.environment=cf-test',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'https://collector.example.com',
      OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST: 'x-request-id',
      SPLUNK_METRICS_ENABLED: 'false',
      OTEL_METRIC_EXPORT_INTERVAL: '1234',
      SPLUNK_INVALID: null,
      OTEL_INVALID: null,
      SPLUNK_EMPTY: null,
      SPLUNK_INVALID_VALUE: null,
      OTEL_BAD_KEY: null,
      UNRELATED_SECRET: null,
    }
  );
  assert.ok(!readFileSync(f.profile, 'utf8').includes(stagingToken));
  assert.ok(!output.includes(token));
  assert.ok(!output.includes('WARNING'));
});

test('supports every Java credential key alias', (t) => {
  const f = fixture(t);
  for (const [key, envKey] of [
    ['realm', 'SPLUNK_REALM'],
    ['access_token', 'SPLUNK_ACCESS_TOKEN'],
    ['accessToken', 'SPLUNK_ACCESS_TOKEN'],
    ['token', 'SPLUNK_ACCESS_TOKEN'],
    ['otlp_endpoint', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
    ['otlpEndpoint', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
    ['endpoint', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
  ]) {
    const output = assertBindingEnvironment(
      f,
      { VCAP_SERVICES: services({ [key]: 'alias-value' }) },
      { [envKey]: 'alias-value' }
    );
    assert.equal(output, '');
  }
});

test('dotted credentials take precedence over aliases regardless of input order, including empty values', (t) => {
  const f = fixture(t);
  const entries = Object.entries({
    realm: 'alias-realm',
    token: 'alias-token',
    endpoint: 'https://alias.example.com',
    'splunk.realm': 'dotted-realm',
    'splunk.access.token': 'dotted-token',
    'otel.exporter.otlp.endpoint': '',
  });
  for (const ordered of [entries, [...entries].reverse()]) {
    assertBindingEnvironment(
      f,
      { VCAP_SERVICES: services(Object.fromEntries(ordered)) },
      {
        SPLUNK_REALM: 'dotted-realm',
        SPLUNK_ACCESS_TOKEN: 'dotted-token',
        OTEL_EXPORTER_OTLP_ENDPOINT: '',
      }
    );
  }
});

test('uses Java alias preference order and skips invalid credential values', (t) => {
  const f = fixture(t);
  for (const [credentials, expected] of [
    [
      {
        token: 'third-token',
        accessToken: 'second-token',
        access_token: 'first-token',
        endpoint: 'https://third.example.com',
        otlpEndpoint: 'https://second.example.com',
        otlp_endpoint: 'https://first.example.com',
      },
      {
        SPLUNK_ACCESS_TOKEN: 'first-token',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://first.example.com',
      },
    ],
    [
      {
        access_token: null,
        accessToken: 'second-token',
        token: 'third-token',
        otlp_endpoint: {},
        otlpEndpoint: 'https://second.example.com',
        endpoint: 'https://third.example.com',
      },
      {
        SPLUNK_ACCESS_TOKEN: 'second-token',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://second.example.com',
      },
    ],
    [
      {
        'splunk.access.token': [],
        realm: {},
        access_token: 'invalid\0token',
        accessToken: null,
        token: 'fallback-token',
        otlp_endpoint: [],
        otlpEndpoint: 'invalid\0endpoint',
        endpoint: 'https://fallback.example.com',
      },
      {
        SPLUNK_REALM: null,
        SPLUNK_ACCESS_TOKEN: 'fallback-token',
        OTEL_EXPORTER_OTLP_ENDPOINT: 'https://fallback.example.com',
      },
    ],
    [
      {
        access_token: '',
        accessToken: 'unused-token',
        otlp_endpoint: '',
        otlpEndpoint: 'https://unused.example.com',
      },
      { SPLUNK_ACCESS_TOKEN: '', OTEL_EXPORTER_OTLP_ENDPOINT: '' },
    ],
  ]) {
    const output = assertBindingEnvironment(
      f,
      { VCAP_SERVICES: services(credentials) },
      expected
    );
    assert.equal(output, '');
  }
});

test('explicit agent environment variables override binding credentials, including empty values', (t) => {
  const f = fixture(t);
  assertBindingEnvironment(
    f,
    {
      VCAP_SERVICES: services({
        'splunk.realm': 'binding-realm',
        'splunk.access.token': 'binding-token',
        'otel.service.name': 'binding-name',
        'splunk.metrics.enabled': true,
        realm: 'alias-realm',
        access_token: 'alias-token',
        otlp_endpoint: 'https://alias.example.com',
      }),
      SPLUNK_REALM: 'explicit-realm',
      SPLUNK_ACCESS_TOKEN: 'explicit-token',
      OTEL_SERVICE_NAME: '',
      SPLUNK_METRICS_ENABLED: 'false',
      OTEL_EXPORTER_OTLP_ENDPOINT: '',
    },
    {
      SPLUNK_REALM: 'explicit-realm',
      SPLUNK_ACCESS_TOKEN: 'explicit-token',
      OTEL_SERVICE_NAME: '',
      SPLUNK_METRICS_ENABLED: 'false',
      OTEL_EXPORTER_OTLP_ENDPOINT: '',
    }
  );
});

test('matches service instance names and binding aliases', (t) => {
  const f = fixture(t);
  for (const names of [
    { name: 'alias', instance_name: 'production-splunk-o11y' },
    { name: 'alias', binding_name: 'splunk-o11y-binding' },
  ]) {
    assertBindingEnvironment(
      f,
      {
        VCAP_SERVICES: services({ 'splunk.realm': 'us0' }, names),
      },
      { SPLUNK_REALM: 'us0' }
    );
  }
});

test('leaves configuration unchanged without a matching bound service', (t) => {
  const f = fixture(t);
  for (const env of [
    {},
    { VCAP_SERVICES: '{}' },
    {
      VCAP_SERVICES: services({ 'splunk.realm': 'ignored' }, { name: 'other' }),
    },
  ]) {
    const output = assertBindingEnvironment(f, env, { SPLUNK_REALM: null });
    assert.equal(output, '');
  }
});

test('loads credentials from file-based VCAP_SERVICES', (t) => {
  const f = fixture(t);
  const file = join(f.work, 'vcap-services.json');
  writeFileSync(
    file,
    services({ 'splunk.realm': 'eu0', 'splunk.access.token': 'file-token' })
  );
  assertBindingEnvironment(
    f,
    { VCAP_SERVICES_FILE_PATH: file },
    {
      SPLUNK_REALM: 'eu0',
      SPLUNK_ACCESS_TOKEN: 'file-token',
    }
  );
});

test('loads credentials from SERVICE_BINDING_ROOT using CF metadata', (t) => {
  const f = fixture(t);
  const root = join(f.work, 'service-bindings');
  const matching = join(root, 'binding-id');
  const unrelated = join(root, 'database');
  mkdirSync(matching, { recursive: true });
  mkdirSync(unrelated);
  writeFileSync(join(matching, 'instance-name'), 'production-splunk-o11y');
  writeFileSync(join(matching, 'splunk.realm'), 'us0');
  writeFileSync(join(matching, 'splunk.access.token'), 'mounted-token');
  writeFileSync(
    join(matching, 'otel.resource.attributes'),
    'deployment.environment=mounted'
  );
  writeFileSync(join(matching, 'NODE_OPTIONS'), '--invalid-option');
  writeFileSync(join(unrelated, 'splunk.realm'), 'ignored');
  assertBindingEnvironment(
    f,
    { SERVICE_BINDING_ROOT: root },
    {
      SPLUNK_REALM: 'us0',
      SPLUNK_ACCESS_TOKEN: 'mounted-token',
      OTEL_RESOURCE_ATTRIBUTES: 'deployment.environment=mounted',
    }
  );
});

test('loads aliases from both file-based binding formats', (t) => {
  const f = fixture(t);
  const credentials = {
    realm: 'eu0',
    accessToken: 'file-alias-token',
    otlpEndpoint: 'https://collector.example.com',
  };
  const file = join(f.work, 'vcap-services.json');
  writeFileSync(file, services(credentials));
  const root = join(f.work, 'service-bindings');
  const directory = join(root, 'splunk-o11y');
  mkdirSync(directory, { recursive: true });
  for (const [key, value] of Object.entries(credentials)) {
    writeFileSync(join(directory, key), value);
  }
  for (const env of [
    { VCAP_SERVICES_FILE_PATH: file },
    { SERVICE_BINDING_ROOT: root },
  ]) {
    assertBindingEnvironment(f, env, {
      SPLUNK_REALM: 'eu0',
      SPLUNK_ACCESS_TOKEN: 'file-alias-token',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'https://collector.example.com',
    });
  }
});

test('skips malformed or unreadable bindings without logging their contents', (t) => {
  const f = fixture(t);
  const secret = 'synthetic-secret-must-not-be-logged';
  for (const env of [
    { VCAP_SERVICES: '{"' + secret + '":' },
    { VCAP_SERVICES: 'null' },
    { VCAP_SERVICES: '[]' },
    { VCAP_SERVICES: services([secret]) },
    { VCAP_SERVICES: services(null) },
    { VCAP_SERVICES_FILE_PATH: join(f.work, 'missing-file') },
    { SERVICE_BINDING_ROOT: join(f.work, 'missing-directory') },
  ]) {
    const output = assertBindingEnvironment(f, env, { SPLUNK_REALM: null });
    assert.match(output, /Unable to read splunk-o11y service credentials/);
    assert.ok(!output.includes(secret));
  }
});

test('does not choose arbitrarily between multiple splunk-o11y services', (t) => {
  const f = fixture(t);
  const secret = 'synthetic-token-must-not-be-logged';
  const output = assertBindingEnvironment(
    f,
    {
      VCAP_SERVICES: JSON.stringify({
        'user-provided': [
          {
            name: 'splunk-o11y-one',
            credentials: {
              'splunk.realm': 'us0',
              'splunk.access.token': secret,
            },
          },
          {
            name: 'splunk-o11y-two',
            credentials: {
              'splunk.realm': 'eu0',
              'splunk.access.token': secret,
            },
          },
        ],
      }),
    },
    { SPLUNK_REALM: null, SPLUNK_ACCESS_TOKEN: null }
  );
  assert.match(output, /Multiple splunk-o11y services/);
  assert.ok(!output.includes(secret));
});

test('honors the preload disable switch supplied by a binding or the environment', (t) => {
  const f = fixture(t);
  launch(
    f,
    'require("node:assert/strict").equal(globalThis.splunkLoaded, undefined);',
    {
      VCAP_SERVICES: services({ 'splunk.otel.nodejs.enabled': false }),
    }
  );
  assertBindingEnvironment(
    f,
    {
      VCAP_SERVICES: services({ 'splunk.otel.nodejs.enabled': false }),
      SPLUNK_OTEL_NODEJS_ENABLED: 'true',
    },
    { SPLUNK_OTEL_NODEJS_ENABLED: 'true' }
  );
});

test('warns about automatic memory optimization only when instrumentation is enabled', (t) => {
  for (const [env, warned] of [
    [{ OPTIMIZE_MEMORY: 'true', SPLUNK_OTEL_NODEJS_ENABLED: 'true' }, true],
    [{ OPTIMIZE_MEMORY: 'false', SPLUNK_OTEL_NODEJS_ENABLED: 'true' }, false],
    [{ OPTIMIZE_MEMORY: 'true', SPLUNK_OTEL_NODEJS_ENABLED: 'false' }, false],
  ]) {
    const f = fixture(t, undefined, env);
    assert.equal(
      f.stagingStderr.includes('WARNING: OPTIMIZE_MEMORY=true'),
      warned
    );
    if (warned) {
      assert.match(f.stagingStderr, /OPTIMIZE_MEMORY=false/);
      assert.match(f.stagingStderr, /heap limit in NODE_OPTIONS/);
      assert.match(f.stagingStderr, /restage/);
    }
  }
});

test('manual heap configuration preserves instrumentation through npm start', (t) => {
  const f = fixture(t, undefined, { OPTIMIZE_MEMORY: 'false' });
  const app = join(f.runtime, 'app');
  writeFileSync(
    join(app, 'package.json'),
    JSON.stringify({
      name: 'cf-test',
      private: true,
      scripts: { start: 'node index.js' },
    })
  );
  writeFileSync(
    join(app, 'index.js'),
    `
    const assert = require('node:assert/strict');
    assert.equal(globalThis.splunkLoaded, 1);
    assert.ok(process.env.NODE_OPTIONS.includes('--max-old-space-size=384'));
    assert.ok(process.env.NODE_OPTIONS.includes('--max-semi-space-size=4'));
    assert.ok(require('node:v8').getHeapStatistics().heap_size_limit < 512 * 1024 * 1024);
    console.log('Agent loaded with the configured heap limit');
  `
  );
  const output = launch(
    f,
    '',
    {
      OPTIMIZE_MEMORY: 'false',
      // Bound the young generation too, independently of the host's RAM.
      NODE_OPTIONS: '--max-old-space-size=384 --max-semi-space-size=4',
    },
    'exec npm start --silent'
  );
  assert.match(output, /Agent loaded with the configured heap limit/);
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
    assert.equal(span.resource.attributes['deployment.environment'], 'cf-binding-test');
    assert.equal(process.env.OTEL_EXPORTER_OTLP_ENDPOINT, 'http://127.0.0.1:4318');
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
        VCAP_SERVICES: services({
          'otel.service.name': 'cf-test',
          'otel.resource.attributes': 'deployment.environment=cf-binding-test',
          endpoint: 'http://127.0.0.1:4318',
        }),
        SPLUNK_METRICS_ENABLED: 'false',
        SPLUNK_PROFILER_ENABLED: 'false',
        OTEL_TRACES_EXPORTER: 'console',
      }
    );
    assert.match(output, /Cloud Foundry agent started/);
  }
);
