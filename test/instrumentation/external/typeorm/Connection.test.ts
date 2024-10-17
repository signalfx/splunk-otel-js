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
import { SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { strict as assert } from 'assert';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { TypeormInstrumentation } from '../../../../src/instrumentations/external/typeorm';
import { exporter, getTestSpans, provider, setInstrumentation } from '../setup';

const instrumentation = new TypeormInstrumentation();
provider.register();
import * as typeorm from 'typeorm';
import { rawQueryOptions } from './utils';

describe('Connection', () => {
  before(() => {
    setInstrumentation(instrumentation);
  });

  after(() => {
    instrumentation.enable();
  });
  beforeEach(() => {
    exporter.reset();
    instrumentation.enable();
  });
  afterEach(() => {
    instrumentation.disable();
  });

  describe('single connection', () => {
    it('raw query', async () => {
      const options = rawQueryOptions;
      const connection = await typeorm.createConnection(rawQueryOptions);
      const query = 'select * from user';
      await connection.query(query);
      const typeOrmSpans = getTestSpans();

      assert.strictEqual(typeOrmSpans.length, 1);
      assert.strictEqual(typeOrmSpans[0].status.code, SpanStatusCode.UNSET);
      const attributes = typeOrmSpans[0].attributes;
      assert.strictEqual(
        attributes[SemanticAttributes.DB_SYSTEM],
        options.type
      );
      assert.strictEqual(
        attributes[SemanticAttributes.DB_NAME],
        options.database
      );
      assert.strictEqual(attributes[SemanticAttributes.DB_OPERATION], 'SELECT');
      assert.strictEqual(attributes[SemanticAttributes.DB_STATEMENT], query);
      await connection.close();
    });
  });
});
