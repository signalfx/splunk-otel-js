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

// TODO: use assert.strict once we deprecate node@8
import * as assert from 'assert';

export const defaultServiceName = 'unnamed-node-service';

export function parseEnvBooleanString(value?: string) {
  if (typeof value !== 'string') {
    return value;
  }

  value = value.trim().toLowerCase();

  if (!value || ['false', 'no', 'n', '0'].indexOf(value) >= 0) {
    return false;
  }

  if (['true', 'yes', 'y', '1'].indexOf(value) >= 0) {
    return true;
  }

  throw new Error(`Invalid string representing boolean: ${value}`);
}

export function getEnvBoolean(key: string, defaultValue = true) {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  if (['false', 'no', '0'].indexOf(value.trim().toLowerCase()) >= 0) {
    return false;
  }

  return true;
}

export function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  const numberValue = parseInt(value);

  if (isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}

export function deduplicate(arr: string[]) {
  return [...new Set(arr)];
}

const formatStringSet = (set: Set<string> | string[]) => {
  return [...set.values()].map((item) => `"${item}"`).join(', ');
};

export function assertNoExtraneousProperties(
  obj: Record<string, any>,
  expectedProps: string[]
) {
  const keys = new Set(Object.keys(obj));
  for (const p of expectedProps) {
    keys.delete(p);
  }

  assert.equal(
    keys.size,
    0,
    `Unexpected configuration options: ${formatStringSet(
      keys
    )}. Allowed: ${formatStringSet(expectedProps)}`
  );
}
