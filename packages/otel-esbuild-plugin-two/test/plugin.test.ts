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
import { esmRequireShimPlugin, nativeExtSupportPlugin } from '../src/plugin';

void describe('nativeExtSupportPlugin', () => {
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
    await writeFile(
      path.join(mockGyp, 'index.js'),
      'module.exports = () => {};'
    );

    // fake @splunk/otel with prebuilds/addon.node
    fakePrebuildsDir = path.join(workDir, 'node_modules', '@splunk', 'otel');
    const fakePrebuilds = path.join(
      fakePrebuildsDir,
      'prebuilds',
      'dummy-platform'
    );
    await mkdir(fakePrebuilds, { recursive: true });
    await writeFile(
      path.join(fakePrebuilds, 'addon.node'),
      '// fake binary content'
    );
  });

  after(async () => {
    await rm(workDir, { recursive: true, force: true });
    await rm(fakePrebuildsDir, { recursive: true, force: true });
  });

  void it('rewrites node-gyp-build path and copies prebuilds from @splunk/otel', async () => {
    const inputCode = `
      const path = require('path');
      const x = require('node-gyp-build')(path.join(__dirname, '../..'));
    `;

    await mkdir(path.dirname(nativeExtPath), { recursive: true });
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
    const copiedFiles = await readdir(
      path.join(prebuildsPath, 'dummy-platform')
    );
    assert.ok(
      copiedFiles.includes('addon.node'),
      'addon.node should be copied'
    );
  });
});

void describe('esmRequireShimPlugin', () => {
  let workDir: string;
  let entryCjs: string;
  let entryEsm: string;

  before(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), 'esm-shim-test-'));
    const testCode = `const os = require('node:os'); console.log(os.platform());`;

    entryCjs = path.join(workDir, 'index.js');
    entryEsm = path.join(workDir, 'index.mjs');

    await Promise.all([
      writeFile(entryCjs, testCode),
      writeFile(entryEsm, testCode),
    ]);
  });

  after(async () => {
    await rm(workDir, { recursive: true, force: true });
  });

  const bundle = async (fmt: 'esm' | 'cjs'): Promise<string> => {
    const outfile = path.join(workDir, `out-${fmt}.js`);
    const entry = fmt === 'esm' ? entryEsm : entryCjs;

    await build({
      entryPoints: [entry],
      bundle: true,
      outfile,
      platform: 'node',
      format: fmt,
      logLevel: 'silent',
      plugins: [esmRequireShimPlugin()],
    });

    return readFile(outfile, 'utf8');
  };

  void it('injects createRequire shim when format === "esm"', async () => {
    const code = await bundle('esm');

    assert.match(
      code,
      /createRequire\(import\.meta\.url\)/,
      'createRequire shim did not appear in the bundle'
    );
    assert.match(
      code,
      /globalThis\.require\s*=/,
      'shim did not set globalThis.require'
    );
  });

  void it('does NOT inject shim for CommonJS bundles', async () => {
    const code = await bundle('cjs');

    assert.doesNotMatch(
      code,
      /createRequire\(import\.meta\.url\)/,
      'shim did not appear in the CJS bundle'
    );
  });
});
