#!/usr/bin/env node
/*
 * Upgrades all @opentelemetry/* packages in package.json to their latest
 * published versions, then verifies that the declared versions plus every
 * transitive @opentelemetry/* requirement (peer/regular/optional, fetched
 * from the npm registry) can be satisfied by a single installed version.
 * If they can't, an end user `npm install`-ing @splunk/otel would end up
 * with multiple copies of e.g. @opentelemetry/instrumentation, which causes
 * real bugs (separate singleton state per copy).
 *
 * Only package.json is consulted — the lockfile is irrelevant to consumers.
 *
 * Usage:
 *   node scripts/upgrade-otel.mjs            # upgrade + verify + npm install
 *   node scripts/upgrade-otel.mjs --dry-run  # show what would change
 *   node scripts/upgrade-otel.mjs --check    # only run the package.json check
 */

import { spawn } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import semver from 'semver';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');
const OTEL_PREFIX = '@opentelemetry/';
const FETCH_CONCURRENCY = 8;

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const checkOnly = args.has('--check');

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, cmdArgs, {
      cwd: REPO_ROOT,
      stdio: 'inherit',
      ...opts,
    });
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
      else
        reject(
          new Error(`${cmd} ${cmdArgs.join(' ')} failed: ${stderr.trim()}`)
        );
    });
  });
}

async function fetchLatest(pkg) {
  return capture('npm', ['view', pkg, 'version']);
}

async function mapLimit(items, limit, fn) {
  const out = Array.from({ length: items.length });
  let i = 0;
  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    async () => {
      while (true) {
        const idx = i++;
        if (idx >= items.length) return;
        out[idx] = await fn(items[idx], idx);
      }
    }
  );
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
  const sections = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ];
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

  console.log(
    `Found ${deps.length} @opentelemetry/* packages. Fetching latest versions...`
  );
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
    console.log(
      'All @opentelemetry/* packages are already at the latest version.'
    );
    return false;
  }

  if (dryRun) {
    console.log(
      `\n[dry-run] ${changed} package(s) would be updated, ${skipped} skipped.`
    );
    return false;
  }

  // Preserve trailing newline if the original file had one.
  const trailing = raw.endsWith('\n') ? '\n' : '';
  await writeFile(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + trailing);
  console.log(
    `\nUpdated ${changed} package(s) in package.json (${skipped} skipped).`
  );
  return true;
}

// Fetches version + dependency manifests for the highest published version of
// <name> matching <range>. `npm view <name>@<range>` returns one object when
// the range pins a single version and an array when multiple match — we take
// the highest by semver order.
async function fetchManifest(name, range) {
  const spec = `${name}@${range}`;
  const raw = await capture('npm', [
    'view',
    spec,
    '--json',
    'version',
    'dependencies',
    'peerDependencies',
    'optionalDependencies',
  ]);
  if (!raw) throw new Error(`npm view returned nothing for ${spec}`);
  const data = JSON.parse(raw);
  if (Array.isArray(data)) {
    data.sort((a, b) => semver.compare(a.version, b.version));
    return data[data.length - 1];
  }
  return data;
}

async function fetchAllVersions(name) {
  const raw = await capture('npm', ['view', name, 'versions', '--json']);
  return JSON.parse(raw);
}

async function verifyPackageJson() {
  const pkg = JSON.parse(await readFile(PACKAGE_JSON, 'utf8'));

  // devDependencies aren't installed by end users, so they can't cause
  // duplicates in a consumer's tree — only consider what we ship.
  const consumerSections = [
    'dependencies',
    'optionalDependencies',
    'peerDependencies',
  ];
  const declared = new Map(); // name -> { name, range }
  for (const section of consumerSections) {
    const deps = pkg[section];
    if (!deps) continue;
    for (const [name, range] of Object.entries(deps)) {
      if (!name.startsWith(OTEL_PREFIX)) continue;
      if (!declared.has(name)) declared.set(name, { name, range });
    }
  }

  console.log(
    `Analyzing ${declared.size} declared @opentelemetry/* package(s) for transitive version conflicts...`
  );

  // requirements: name -> [{ source, range }]
  const requirements = new Map();
  const addReq = (name, source, range) => {
    if (!requirements.has(name)) requirements.set(name, []);
    requirements.get(name).push({ source, range });
  };

  for (const { name, range } of declared.values()) {
    addReq(name, 'package.json', range);
  }

  const declaredList = [...declared.values()];
  const manifests = await mapLimit(declaredList, FETCH_CONCURRENCY, (d) =>
    fetchManifest(d.name, d.range)
  );

  for (const [i, d] of declaredList.entries()) {
    const m = manifests[i];
    const sourceLabel = `${d.name}@${m.version}`;
    const groups = [
      ['deps', m.dependencies],
      ['peer', m.peerDependencies],
      ['optional', m.optionalDependencies],
    ];
    for (const [kind, deps] of groups) {
      if (!deps) continue;
      for (const [depName, depRange] of Object.entries(deps)) {
        if (!depName.startsWith(OTEL_PREFIX)) continue;
        addReq(depName, `${sourceLabel} (${kind})`, depRange);
      }
    }
  }

  // For each name with requirements, check that some published version
  // satisfies every range. If none does, npm will install duplicates.
  const names = [...requirements.keys()];
  const versionLists = await mapLimit(names, FETCH_CONCURRENCY, (n) =>
    fetchAllVersions(n)
  );

  const conflicts = [];
  for (const [i, name] of names.entries()) {
    const reqs = requirements.get(name);
    const versions = versionLists[i];
    const ok = versions.some((v) =>
      reqs.every((r) => semver.satisfies(v, r.range))
    );
    if (!ok) conflicts.push({ name, reqs });
  }

  if (conflicts.length === 0) {
    console.log(
      `\nCheck OK: ${requirements.size} @opentelemetry/* package(s), all version requirements are mutually satisfiable.`
    );
    return;
  }

  console.error(
    `\nCheck FAILED: ${conflicts.length} @opentelemetry/* package(s) have incompatible version requirements (consumers would install duplicates):`
  );
  for (const c of conflicts) {
    console.error(`  ${c.name}:`);
    for (const r of c.reqs) console.error(`    ${r.range}  (${r.source})`);
  }
  console.error(
    '\nFix by aligning versions in package.json, or wait for upstream packages to release a compatible release.'
  );
  process.exit(1);
}

async function main() {
  if (checkOnly) {
    await verifyPackageJson();
    return;
  }

  const didChange = await upgrade();
  if (dryRun) return;

  await verifyPackageJson();

  if (didChange) {
    console.log('\nRunning npm install...');
    await run('npm', ['install']);
  } else {
    console.log('\nNo changes — skipping npm install.');
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
