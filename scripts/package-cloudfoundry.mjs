import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [packageFile, outputDir = 'dist'] = process.argv.slice(2);
if (!packageFile) {
  throw new Error(
    'Usage: node scripts/package-cloudfoundry.mjs PACKAGE.tgz [OUTPUT_DIR]'
  );
}
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const output = resolve(
  outputDir,
  `splunk-otel-js-cloudfoundry-${pkg.version}.zip`
);
const work = mkdtempSync(join(tmpdir(), 'splunk-otel-cf-'));
try {
  const extracted = join(work, 'extracted');
  const dependencies = join(work, 'dependencies');
  const buildpack = join(work, 'buildpack');
  mkdirSync(extracted);
  mkdirSync(dependencies);
  execFileSync('tar', ['-xzf', resolve(packageFile), '-C', extracted]);
  const agent = join(extracted, 'package');
  const packed = JSON.parse(readFileSync(join(agent, 'package.json'), 'utf8'));
  assert.equal(
    packed.name,
    pkg.name,
    'Agent package name must match the checkout'
  );
  assert.equal(
    packed.version,
    pkg.version,
    'Agent version must match the checkout'
  );
  assert.deepEqual(
    packed.dependencies,
    pkg.dependencies,
    'Agent dependencies must match the checkout'
  );
  assert.ok(
    existsSync(join(agent, 'lib/instrument.js')),
    'Agent must be compiled'
  );

  for (const file of ['package.json', 'package-lock.json']) {
    cpSync(join(root, file), join(dependencies, file));
  }
  execFileSync(
    'npm',
    [
      'ci',
      '--omit=dev',
      '--ignore-scripts',
      '--workspaces=false',
      '--no-audit',
      '--no-fund',
    ],
    {
      cwd: dependencies,
      stdio: 'inherit',
    }
  );
  cpSync(join(root, 'buildpacks/cloudfoundry'), buildpack, {
    recursive: true,
  });
  cpSync(agent, join(buildpack, 'splunk-otel'), { recursive: true });
  cpSync(
    join(dependencies, 'node_modules'),
    join(buildpack, 'splunk-otel/node_modules'),
    { recursive: true, verbatimSymlinks: true }
  );
  writeFileSync(join(buildpack, 'VERSION'), `${pkg.version}\n`);
  writeFileSync(
    join(buildpack, 'config.yml'),
    `name: splunk-otel-nodejs\nversion: ${pkg.version}\n`
  );
  for (const script of ['detect', 'supply', 'finalize']) {
    chmodSync(join(buildpack, 'bin', script), 0o755);
  }
  mkdirSync(dirname(output), { recursive: true });
  rmSync(output, { force: true });
  execFileSync('zip', ['-q', '-r', '-y', output, '.'], { cwd: buildpack });
  console.log(output);
} finally {
  rmSync(work, { recursive: true, force: true });
}
