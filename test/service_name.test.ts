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
import { beforeEach, describe, it } from 'node:test';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import { defaultServiceName, findServiceName } from '../src/utils';

describe('findServiceName', () => {
  const TMP_PREFIX = 'splunk-otel-service-name-test-';
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), TMP_PREFIX));
    process.chdir(tempDir);
  });

  it('can find package name from working directory', () => {
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'test-service-42' })
    );
    assert.deepStrictEqual(findServiceName(new Map()), 'test-service-42');
  });

  it('returns undefined when package.json does not contain a name', () => {
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 42 })
    );
    assert.deepStrictEqual(findServiceName(new Map()), undefined);
  });

  it('returns undefined when package name is not a string', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({}));
    assert.deepStrictEqual(findServiceName(new Map()), undefined);
  });

  it('returns undefined when package.json is not json', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), 'abc');
    assert.deepStrictEqual(findServiceName(new Map()), undefined);
  });

  it('returns undefined when package.json is not a file', () => {
    fs.mkdirSync(path.join(tempDir, 'package.json'));
    assert.deepStrictEqual(findServiceName(new Map()), undefined);
  });

  it('reads the name from cache', () => {
    assert.deepStrictEqual(
      findServiceName(new Map([['package.name', 'foo']])),
      'foo'
    );
  });

  it('caches the package name value', () => {
    fs.writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ name: 'xyz' })
    );
    const cache = new Map();
    assert.deepStrictEqual(findServiceName(cache), 'xyz');
    assert.deepStrictEqual(cache.get('package.name'), 'xyz');
  });

  it('returns the hardcoded name when service name can not be read', () => {
    fs.writeFileSync(path.join(tempDir, 'package.json'), 'abc');
    assert.deepStrictEqual(
      defaultServiceName(new Map()),
      'unnamed-node-service'
    );
  });
});
