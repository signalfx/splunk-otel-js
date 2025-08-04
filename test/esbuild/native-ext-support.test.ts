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
import { nativeExtSupportPlugin } from '../../src/esbuild-plugin/plugin';
import { SDK_ROOT } from '../../src/esbuild-plugin/constants';

describe('nativeExtSupportPlugin', () => {
  let workDir: string;
  let outFile: string;
  let nativeExtPath: string;
  let fakePrebuildsDir: string;

  before(async () => {
    workDir = await mkdtemp(path.join(tmpdir(), 'native-ext-test-'));
    outFile = path.join(workDir, 'bundle.js');
    nativeExtPath = path.join(workDir, 'native_ext', 'index.js');

    const mockGyp = path.join(workDir, 'node_modules', 'node-gyp-build');
    await mkdir(mockGyp, { recursive: true });
    await writeFile(path.join(mockGyp, 'index.js'), 'module.exports = () => {};');

    fakePrebuildsDir = path.join(SDK_ROOT, 'prebuilds', 'dummy-platform');
    await mkdir(fakePrebuildsDir, { recursive: true });
    await writeFile(
      path.join(fakePrebuildsDir, 'addon.node'),
      '// fake binary content'
    );
  });

  after(async () => {
    await rm(workDir, { recursive: true, force: true });
    await rm(fakePrebuildsDir, { recursive: true, force: true });
  });

  it('rewrites native_ext/index.js and copies prebuilds', async () => {
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
      plugins: [nativeExtSupportPlugin()],
      absWorkingDir: workDir,
    });

    const outputCode = await readFile(outFile, 'utf8');

    assert.match(
      outputCode,
      /path\.join\(path\.dirname\(process\.argv\[1\]\), ['"]splunk-profiling['"]\)/,
      'expected rewritten require path'
    );

    const prebuildsPath = path.join(workDir, 'splunk-profiling', 'prebuilds');

    const prebuildsStat = await stat(prebuildsPath);
    assert.ok(prebuildsStat.isDirectory(), 'prebuilds directory exists');

    const copiedFiles = await readdir(prebuildsPath);
    assert.ok(copiedFiles.length > 0, 'prebuilds were copied');
  });
});
