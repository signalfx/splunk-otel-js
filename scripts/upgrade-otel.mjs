#!/usr/bin/env node
/*
 * Upgrades all @opentelemetry/* packages in package.json to their latest
 * published versions, runs `npm install`, and verifies that no @opentelemetry/*
 * package ends up installed at more than one version in package-lock.json
 * (multiple copies of e.g. @opentelemetry/instrumentation cause real bugs).
 *
 * Usage:
 *   node scripts/upgrade-otel.mjs            # upgrade + install + verify
 *   node scripts/upgrade-otel.mjs --dry-run  # show what would change
 *   node scripts/upgrade-otel.mjs --check    # only run the lockfile check
 */

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');
const PACKAGE_LOCK = path.join(REPO_ROOT, 'package-lock.json');
const OTEL_PREFIX = '@opentelemetry/';
const FETCH_CONCURRENCY = 8;

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const checkOnly = args.has('--check');

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { cwd: REPO_ROOT, stdio: 'inherit', ...opts });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${cmdArgs.join(' ')} exited with ${code}`));
    });
  });
}

function capture(cmd, cmdArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, { cwd: REPO_ROOT });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (b) => (stdout += b));
    child.stderr.on('data', (b) => (stderr += b));
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(`${cmd} ${cmdArgs.join(' ')} failed: ${stderr.trim()}`));
    });
  });
}

async function fetchLatest(pkg) {
  return capture('npm', ['view', pkg, 'version']);
}

async function mapLimit(items, limit, fn) {
  const out = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const idx = i++;
      if (idx >= items.length) return;
      out[idx] = await fn(items[idx], idx);
    }
  });
  await Promise.all(workers);
  return out;
}

// Splits "^1.9.0" into { prefix: "^", version: "1.9.0" }, "0.215.0" into { prefix: "", version: "0.215.0" }.
// Leaves anything that isn't a plain semver range untouched (returned as null).
function parseRange(spec) {
  const m = /^([\^~]?)(\d[\d.]*)$/.exec(spec);
  if (!m) return null;
  return { prefix: m[1], version: m[2] };
}

function collectOtelDeps(pkgJson) {
  const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
  const found = [];
  for (const section of sections) {
    const deps = pkgJson[section];
    if (!deps) continue;
    for (const name of Object.keys(deps)) {
      if (!name.startsWith(OTEL_PREFIX)) continue;
      found.push({ section, name, current: deps[name] });
    }
  }
  return found;
}

async function upgrade() {
  const raw = await readFile(PACKAGE_JSON, 'utf8');
  const pkg = JSON.parse(raw);
  const deps = collectOtelDeps(pkg);

  console.log(`Found ${deps.length} @opentelemetry/* packages. Fetching latest versions...`);
  const latest = await mapLimit(deps, FETCH_CONCURRENCY, async (d) => {
    const version = await fetchLatest(d.name);
    return { ...d, latest: version };
  });

  let changed = 0;
  let skipped = 0;
  for (const d of latest) {
    const parsed = parseRange(d.current);
    if (!parsed) {
      console.warn(`  skip ${d.name}: cannot parse range "${d.current}"`);
      skipped++;
      continue;
    }
    const next = `${parsed.prefix}${d.latest}`;
    if (next === d.current) continue;
    pkg[d.section][d.name] = next;
    console.log(`  ${d.name}: ${d.current} -> ${next}`);
    changed++;
  }

  if (changed === 0) {
    console.log('All @opentelemetry/* packages are already at the latest version.');
    return false;
  }

  if (dryRun) {
    console.log(`\n[dry-run] ${changed} package(s) would be updated, ${skipped} skipped.`);
    return false;
  }

  // Preserve trailing newline if the original file had one.
  const trailing = raw.endsWith('\n') ? '\n' : '';
  await writeFile(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + trailing);
  console.log(`\nUpdated ${changed} package(s) in package.json (${skipped} skipped).`);
  return true;
}

// Resolves `depName` from the importer at `importerPath` using npm's nearest-ancestor
// node_modules lookup, returning the matching key in lock.packages (or null).
function resolveDep(importerPath, depName, lock) {
  let p = importerPath;
  while (true) {
    const base = p === '' ? '' : p + '/';
    const candidate = base + 'node_modules/' + depName;
    if (lock.packages[candidate]) return candidate;
    if (p === '') return null;
    const idx = p.lastIndexOf('/node_modules/');
    p = idx < 0 ? '' : p.slice(0, idx);
  }
}

// BFS the install tree starting at the root importer (""), following declared
// dependencies/devDependencies/optionalDependencies/peerDependencies. This visits
// every package that the main @splunk/otel install actually pulls in, and skips
// subtrees only reachable through workspace packages (e.g. packages/otel-esbuild-plugin).
function walkInstallFromRoot(lock) {
  const visited = new Set(['']);
  const queue = [''];
  while (queue.length > 0) {
    const importer = queue.shift();
    let entry = lock.packages[importer];
    if (!entry) continue;
    if (entry.link && entry.resolved) {
      const target = entry.resolved;
      if (!visited.has(target)) {
        visited.add(target);
        queue.push(target);
      }
      continue;
    }
    const depSets = [
      entry.dependencies,
      entry.devDependencies,
      entry.optionalDependencies,
      entry.peerDependencies,
    ];
    for (const deps of depSets) {
      if (!deps) continue;
      for (const depName of Object.keys(deps)) {
        const resolved = resolveDep(importer, depName, lock);
        if (resolved && !visited.has(resolved)) {
          visited.add(resolved);
          queue.push(resolved);
        }
      }
    }
  }
  return visited;
}

async function verifyLockfile() {
  const lock = JSON.parse(await readFile(PACKAGE_LOCK, 'utf8'));
  if (!lock.packages) {
    throw new Error('package-lock.json has no "packages" section (lockfile v1?). Re-run npm install.');
  }

  const reachable = walkInstallFromRoot(lock);

  // Group every reachable node_modules entry whose final path segment is
  // @opentelemetry/<name> by package name. Anything not reachable from the root
  // (e.g. nested under packages/otel-esbuild-plugin's own deps) is ignored.
  const byName = new Map();
  for (const key of reachable) {
    if (!key.includes(`node_modules/${OTEL_PREFIX}`)) continue;
    const idx = key.lastIndexOf('node_modules/');
    const name = key.slice(idx + 'node_modules/'.length);
    if (!name.startsWith(OTEL_PREFIX)) continue;
    const value = lock.packages[key];
    if (!value || value.link) continue;
    const list = byName.get(name) ?? [];
    list.push({ key, version: value.version });
    byName.set(name, list);
  }

  const duplicates = [];
  for (const [name, installs] of byName) {
    const versions = new Set(installs.map((i) => i.version));
    if (versions.size > 1) duplicates.push({ name, installs });
  }

  if (duplicates.length === 0) {
    console.log(`\nLockfile check OK: ${byName.size} @opentelemetry/* package(s), no duplicates.`);
    return;
  }

  console.error(`\nLockfile check FAILED: ${duplicates.length} @opentelemetry/* package(s) installed at multiple versions:`);
  for (const dup of duplicates) {
    console.error(`  ${dup.name}:`);
    for (const i of dup.installs) console.error(`    ${i.version}  (${i.key})`);
  }
  console.error('\nRun `npm ls <package>` to see who pulls in each version, then bump or override as needed.');
  process.exit(1);
}

async function main() {
  if (checkOnly) {
    await verifyLockfile();
    return;
  }

  const didChange = await upgrade();
  if (dryRun) return;

  if (didChange) {
    console.log('\nRunning npm install...');
    await run('npm', ['install']);
  } else {
    console.log('\nSkipping npm install (no changes). Verifying existing lockfile.');
  }

  await verifyLockfile();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
