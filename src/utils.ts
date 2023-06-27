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

import { strict as assert } from 'assert';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import type { EnvVarKey, LogLevel } from './types';
import { resolve } from 'path';
import * as fs from 'fs';

export type ConfigCache = Map<string, string>;

const configCache: ConfigCache = new Map();

export function findServiceName(
  cache: ConfigCache = configCache
): string | undefined {
  const cacheKey = 'package.name';

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const pkgPath = resolve(process.cwd(), 'package.json');

  try {
    const content = fs.readFileSync(pkgPath, { encoding: 'utf8' });
    const pkg = JSON.parse(content);
    const name = pkg['name'];
    if (typeof name === 'string') {
      cache.set(cacheKey, name);
      return name;
    }
  } catch (e) {
    diag.debug(`Error reading ${pkgPath}`, e);
  }

  return undefined;
}

export function defaultServiceName(cache: ConfigCache = configCache): string {
  return findServiceName(cache) || 'unnamed-node-service';
}

export function getNonEmptyEnvVar(key: EnvVarKey): string | undefined {
  const value = process.env[key];

  if (value !== undefined) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      diag.warn(
        `Defined, but empty environment variable: '${key}'. The value will be considered as undefined.`
      );
      return undefined;
    }

    return trimmed;
  }

  return value;
}

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

export function getEnvBoolean(key: EnvVarKey, defaultValue = true) {
  const value = getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  if (['false', 'no', '0'].indexOf(value.trim().toLowerCase()) >= 0) {
    return false;
  }

  return true;
}

export function getEnvNumber(key: EnvVarKey, defaultValue: number): number {
  const value = getNonEmptyEnvVar(key);

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

export function getEnvArray(key: EnvVarKey, defaultValue: string[]): string[] {
  const value = getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  return deduplicate(value.split(',')).map((v) => v.trim());
}

export function getEnvValueByPrecedence(
  keys: EnvVarKey[],
  defaultValue?: string
): string | undefined {
  for (const key of keys) {
    const value = getNonEmptyEnvVar(key);

    if (value !== undefined) {
      return value;
    }
  }

  return defaultValue;
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

function validLogLevel(level: string): level is LogLevel {
  return ['verbose', 'debug', 'info', 'warn', 'error'].includes(level);
}

export function toDiagLogLevel(level: LogLevel): DiagLogLevel {
  switch (level) {
    case 'verbose':
      return DiagLogLevel.VERBOSE;
    case 'debug':
      return DiagLogLevel.DEBUG;
    case 'info':
      return DiagLogLevel.INFO;
    case 'warn':
      return DiagLogLevel.WARN;
    case 'error':
      return DiagLogLevel.ERROR;
  }

  return DiagLogLevel.NONE;
}

export function parseLogLevel(value: string | undefined): DiagLogLevel {
  if (value === undefined) {
    return DiagLogLevel.NONE;
  }

  const v = value.trim().toLowerCase();

  if (validLogLevel(v)) {
    return toDiagLogLevel(v);
  }

  return DiagLogLevel.NONE;
}

export function pick<T extends Record<string, any>, K extends string>(
  obj: T,
  keys: readonly K[]
): { [P in keyof T as P extends K ? P : never]: T[P] } {
  const result = {} as any;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}
