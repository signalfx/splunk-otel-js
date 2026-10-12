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

import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { it } from 'node:test';

const shouldRunTest =
  process.platform === 'linux' &&
  (process.arch === 'x64' || process.arch === 'arm64') &&
  process.versions.node.split('.')[0] === '24';

it(
  'preserves and reuses arena pages across consecutive resets',
  {
    skip: shouldRunTest ? false : 'Linux x64/arm64 with Node 24 only',
  },
  () => {
    const root = resolve(process.cwd());
    const outputDir = mkdtempSync(join(tmpdir(), 'splunk-arena-test-'));
    const executable = join(outputDir, 'arena-reuse');
    try {
      execFileSync(process.env.CXX || 'g++', [
        '-std=c++17',
        '-I',
        root,
        join(root, 'test/native_ext/arena_reuse.cpp'),
        join(root, 'src/native_ext/util/arena.cpp'),
        '-o',
        executable,
      ]);
      execFileSync(executable);
    } finally {
      rmSync(outputDir, { recursive: true, force: true });
    }
  }
);
