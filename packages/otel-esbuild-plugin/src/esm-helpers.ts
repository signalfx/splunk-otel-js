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
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import * as path from 'node:path';

export function getDirname(): string {
  //@ts-ignore
  return path.dirname(fileURLToPath(import.meta.url));
}

export function requireResolve(
  specifier: string,
  options?: { paths?: string[] }
): string {
  //@ts-ignore
  const req = createRequire(import.meta.url);
  return options ? req.resolve(specifier, options) : req.resolve(specifier);
}
