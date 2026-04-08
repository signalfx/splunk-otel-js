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
import {
  loadConfiguration,
  setGlobalConfiguration,
} from '../../src/configuration';
import * as path from 'node:path';
import { readFileSync } from 'node:fs';

export function readFileUtf8(path: string): string {
  return readFileSync(path, { encoding: 'utf-8' });
}

export function exampleConfigPath(): string {
  return path.join(__dirname, 'example-config.yaml');
}

export function loadAndSetConfig(path: string) {
  const content = readFileUtf8(path);
  setGlobalConfiguration(loadConfiguration(content));
}

export function loadAndSetExampleConfig() {
  loadAndSetConfig(exampleConfigPath());
}
