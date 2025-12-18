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
import { test } from 'node:test';
import { detectResource } from '../utils';
import { loadAndSetExampleConfig } from './utils';
import { strict as assert } from 'assert';
import {
  ATTR_HOST_NAME,
  ATTR_PROCESS_RUNTIME_NAME,
  ATTR_SERVICE_INSTANCE_ID,
} from '@opentelemetry/semantic-conventions/incubating';

test('resource detection from file configuration', async () => {
  loadAndSetExampleConfig();
  const resource = detectResource();
  await resource.waitForAsyncAttributes?.();

  // service detector
  const instanceId = resource.attributes[ATTR_SERVICE_INSTANCE_ID];
  assert.strictEqual(typeof instanceId, 'string');

  // process detector
  assert.deepStrictEqual(
    resource.attributes[ATTR_PROCESS_RUNTIME_NAME],
    'nodejs'
  );

  // host detector
  const hostName = resource.attributes[ATTR_HOST_NAME];
  assert.strictEqual(typeof hostName, 'string');
});
