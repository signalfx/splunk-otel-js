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
import { mkdtemp, writeFile, rm, readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { esmRequireShimPlugin } from '../../src/esbuild-plugin/plugin';

describe('esmRequireShimPlugin', () => {
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

  it('injects createRequire shim when format === "esm"', async () => {
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

  it('does NOT inject shim for CommonJS bundles', async () => {
    const code = await bundle('cjs');

    assert.doesNotMatch(
      code,
      /createRequire\(import\.meta\.url\)/,
      'shim did not appear in the CJS bundle'
    );
  });
});
