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
import { _setDefaultOptions } from '../../src/profiling';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { strict as assert } from 'assert';
import { describe, it } from 'node:test';
import { loadAndSetExampleConfig } from './utils';

describe('profiling via config file', () => {
  it('sets up profiling options', () => {
    loadAndSetExampleConfig();
    const { profilingOptions } = parseOptionsAndConfigureInstrumentations();

    assert.deepStrictEqual(
      profilingOptions.resource.attributes['string_key'],
      'test_value'
    );
    assert.deepStrictEqual(profilingOptions.serviceName, 'test_service');
    assert.deepStrictEqual(profilingOptions.endpoint, 'collector:4318/v1/logs');

    assert.deepStrictEqual(profilingOptions.memoryProfilingEnabled, true);
    assert.deepStrictEqual(profilingOptions.callstackInterval, 5);
  });
});
