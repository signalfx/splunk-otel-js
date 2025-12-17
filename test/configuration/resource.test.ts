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
import { cleanEnvironment } from '../utils';
import { loadAndSetExampleConfig } from './utils';
import {
  configGetResource,
  setGlobalConfiguration,
} from '../../src/configuration';

describe('resource configuration', () => {
  beforeEach(() => {
    cleanEnvironment();
  });

  it('returns resource attributes', () => {
    loadAndSetExampleConfig();

    const resource = configGetResource();

    assert.deepStrictEqual(resource.attributes, {
      'service.name': 'test_service',
      string_key: 'test_value',
      bool_key: true,
      int_key: 1,
      double_key: 1.1,
      string_array_key: ['value1', 'value2'],
      bool_array_key: [true, false],
      int_array_key: [1, 2],
      double_array_key: [1.1, 2.2],
      'service.namespace': 'my-namespace',
      'service.version': '1.0.0',
    });
  });

  it('returns empty resource when no resource is set', () => {
    setGlobalConfiguration({ file_format: '' });

    const resource = configGetResource();

    assert.deepStrictEqual(resource.attributes, {});
  });

  it('uses attribute_list when no resource is given', () => {
    setGlobalConfiguration({
      file_format: '',
      resource: { attributes_list: 'a=1,b=2' },
    });
    const resource = configGetResource();

    assert.deepStrictEqual(resource.attributes, { a: '1', b: '2' });
  });
});
