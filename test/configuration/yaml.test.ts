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
import { describe, test } from 'node:test';
import { strict as assert } from 'assert';

import { loadFile } from '../../src/configuration/YamlLoader';
import { join } from 'path';

describe('YAML config file', () => {
  test('missing file', () => {
    try {
      const _res = loadFile(join(__dirname, 'missing-no.yml'));
      assert(false, "loadFile didn't throw an error");
    } catch (e) {
      assert(e.message.includes('does not exist'));
    }
  });

  test('valid file', () => {
    const config = loadFile(join(__dirname, 'example-config.yaml'));

    assert.ok(config);
    // Some basic sanity checks
    assert.equal(config.file_format, '1.0-rc.1');
    assert.equal(config.attribute_limits?.attribute_value_length_limit, null);
    assert.deepEqual(
      config['instrumentation/development']?.general?.http?.client
        ?.request_captured_headers,
      ['Content-Type', 'Accept']
    );
  });
});
