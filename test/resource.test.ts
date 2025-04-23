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
import { cleanEnvironment, detectResource } from './utils';

describe('resource detector', () => {
  beforeEach(() => {
    cleanEnvironment();
  });

  describe('resource.detect', () => {
    it('catches resource attributes from the env', () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k=v,service.name=node-svc,x=a%20b';

      const resource = detectResource();
      assert.strictEqual(resource.attributes?.['k'], 'v');
      assert.strictEqual(resource.attributes?.['x'], 'a b');
      assert.strictEqual(resource.attributes?.['service.name'], 'node-svc');
    });

    it('catches service name from the env', () => {
      process.env.OTEL_SERVICE_NAME = 'node-svc';
      const resource = detectResource();

      assert.strictEqual(resource.attributes?.['service.name'], 'node-svc');
    });

    it('catches process attributes', () => {
      const resource = detectResource();
      assert.strictEqual(typeof resource.attributes?.['process.pid'], 'number');

      for (const attributeName of [
        'process.executable.name',
        'process.executable.path',
        'process.runtime.version',
        'process.runtime.name',
      ]) {
        assert.strictEqual(
          typeof resource.attributes?.[attributeName],
          'string'
        );
      }
    });

    it('detects OS attributes', () => {
      const resource = detectResource();
      assert.strictEqual(typeof resource.attributes?.['os.type'], 'string');
      assert.strictEqual(typeof resource.attributes?.['os.version'], 'string');
    });

    it('catches host attributes', () => {
      const resource = detectResource();
      assert.strictEqual(typeof resource.attributes?.['host.name'], 'string');
      assert.strictEqual(typeof resource.attributes?.['host.arch'], 'string');
    });
  });
});
