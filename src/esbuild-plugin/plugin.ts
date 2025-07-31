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
import { promises as fs, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import type { Plugin, PluginBuild } from 'esbuild';
import { tmpdir } from 'node:os';

function distroRoot(): string {
  return path.resolve(__dirname, '..', '..');
}

export function nativeExtSupportPlugin(): Plugin {
  let shouldCopyPrebuilds = false; // if we use autoInstrumentation, then copying prebuilds is not needed
  const SUBDIR = 'splunk-profiling';
  return {
    name: 'native-ext-support',
    setup(build: PluginBuild) {
      build.onLoad({ filter: /native_ext[\\/]+index\.js$/ }, async (args) => {
        let code = await fs.readFile(args.path, 'utf8');
        code = code.replace(
          /require\('node-gyp-build'\)\([\s\S]*?\);/,
          `require('node-gyp-build')(path.join(path.dirname(process.argv[1]), '${SUBDIR}'));`
        );
        shouldCopyPrebuilds = true;
        return { contents: code, loader: 'js' };
      });

      build.onEnd(async () => {
        // copy prebuilds from splunk distro to <outDir> after build is done
        if (!shouldCopyPrebuilds) return;
        shouldCopyPrebuilds = false;
        const outDir =
          build.initialOptions.outdir ??
          path.dirname(build.initialOptions.outfile!);

        const srcPrebuilds = path.join(distroRoot(), 'prebuilds');
        const destPrebuilds = path.join(outDir, SUBDIR, 'prebuilds');

        const copyDir = async (src: string, dest: string): Promise<void> => {
          return fs.mkdir(dest, { recursive: true }).then(async () => {
            const entries = await fs.readdir(src, { withFileTypes: true });
            await Promise.all(
              entries.map((entry) => {
                const s = path.join(src, entry.name);
                const d = path.join(dest, entry.name);
                return entry.isDirectory() ? copyDir(s, d) : fs.copyFile(s, d);
              })
            );
          });
        };

        await copyDir(srcPrebuilds, destPrebuilds);
      });
    },
  };
}

/**
 * Makes CommonJS "require" available in ESM bundles.
 *
 * By default, Node.js ESM doesn't include `require`:
 * https://nodejs.org/api/esm.html#no-require-exports-or-moduleexports
 *
 * We use "createRequire()" to define it globally:
 * https://nodejs.org/api/module.html#modulecreaterequirefilename
 */
export function esmRequireShimPlugin(): Plugin {
  return {
    name: 'esm-require-shim',
    setup(build) {
      if (!isEsmOutput(build)) return;
      const shimFile = path.join(tmpdir(), 'esbuild-require-shim.js');
      writeFileSync(
        shimFile,
        `import { createRequire } from 'node:module';
globalThis.require = globalThis.require || createRequire(import.meta.url);
export const require = globalThis.require;
`
      );
      build.initialOptions.inject = [
        ...(build.initialOptions.inject ?? []),
        shimFile,
      ];
    },
  };
}

// When you need an ES-module bundle, pass format: "esm" in your esbuild config. Otherwise esbuild defaults to CommonJS
const isEsmOutput = (build: PluginBuild): boolean =>
  build.initialOptions?.format === 'esm';
