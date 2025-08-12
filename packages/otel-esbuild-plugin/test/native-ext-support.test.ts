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
import { describe, it, before, after } from 'node:test';
import { strict as assert } from 'assert';
import { build } from 'esbuild';
import { tmpdir } from 'node:os';
import {
  mkdtemp,
  writeFile,
  rm,
  readFile,
  stat,
  readdir,
  mkdir,
} from 'node:fs/promises';
import * as path from 'node:path';
import { nativeExtSupportPlugin } from '../src/plugin';


describe('nativeExtSupportPlugin', () => {
  let workDir: string;
  let outFile: string;
  let nativeExtPath: string;
  let fakePrebuildsDir: string;

  before(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), 'native-ext-test-'));
    outFile = path.join(workDir, 'bundle.js');
    nativeExtPath = path.join(workDir, 'native_ext', 'index.js');

    // fake node-gyp-build
    const mockGyp = path.join(workDir, 'node_modules', 'node-gyp-build');
    await mkdir(mockGyp, { recursive: true });
    await writeFile(path.join(mockGyp, 'index.js'), 'module.exports = () => {};');

    // fake @splunk/otel with prebuilds/addon.node
    fakePrebuildsDir = path.join(workDir, 'node_modules', '@splunk', 'otel');
    const fakePrebuilds = path.join(fakePrebuildsDir, 'prebuilds', 'dummy-platform');
    await mkdir(fakePrebuilds, { recursive: true });
    await writeFile(path.join(fakePrebuilds, 'addon.node'), '// fake binary content');
  });

  after(async () => {
    await rm(workDir, { recursive: true, force: true });
    await rm(fakePrebuildsDir, { recursive: true, force: true });
  });

  it('rewrites node-gyp-build path and copies prebuilds from @splunk/otel', async () => {
    const inputCode = `
      const path = require('path');
      const x = require('node-gyp-build')(path.join(__dirname, '../..'));
    `;

    await mkdir(path.dirname(nativeExtPath), { recursive: true });
    console.log(`Writing native_ext/index.js to: ${nativeExtPath}`);
    await writeFile(nativeExtPath, inputCode);

    await build({
      entryPoints: [nativeExtPath],
      bundle: true,
      outfile: outFile,
      platform: 'node',
      logLevel: 'silent',
      absWorkingDir: workDir,
      plugins: [nativeExtSupportPlugin({ splunkOtelRoot: fakePrebuildsDir })],
    });

    const outputCode = await readFile(outFile, 'utf8');

    assert.match(
      outputCode,
      /path\.join\(path\.dirname\(process\.argv\[1\]\), ['"]splunk-profiling['"]\)/,
      'require path should be rewritten to use splunk-profiling'
    );
    const prebuildsPath = path.join(workDir, 'splunk-profiling', 'prebuilds');
    const prebuildsStat = await stat(prebuildsPath);
    assert.ok(prebuildsStat.isDirectory(), 'prebuilds directory should exist');
    const copiedFiles = await readdir(path.join(prebuildsPath, 'dummy-platform'));
    assert.ok(copiedFiles.includes('addon.node'), 'addon.node should be copied');
  });
});
