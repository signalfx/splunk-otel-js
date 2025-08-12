import { writeFile } from 'node:fs/promises';
import path from 'node:path';

const target = process.argv[2];

if (!['esm', 'cjs'].includes(target)) {
  console.error('Usage: node scripts/write-pkg-json.mjs <esm|cjs>');
  process.exit(1);
}

const outDir = path.join('dist', target);
const type = target === 'esm' ? 'module' : 'commonjs';

await writeFile(
  path.join(outDir, 'package.json'),
  JSON.stringify({ type }, null, 2)
);
