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
import { Span } from '@opentelemetry/sdk-trace-base';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { strict as assert } from 'assert';
import { before, beforeEach, describe, it } from 'node:test';
import {
  ExtendedDatabaseAttribute,
  TypeormInstrumentation,
  TypeormInstrumentationConfig,
} from '../../../../src/instrumentations/external/typeorm';
import { getTestSpans, setInstrumentation, provider, exporter } from '../setup';

const instrumentation = new TypeormInstrumentation();
provider.register();
import { SpanStatusCode } from '@opentelemetry/api';
import * as typeorm from 'typeorm';
import { defaultOptions, User } from './utils';

describe('TypeormInstrumentationConfig', () => {
  before(() => {
    setInstrumentation(instrumentation);
  });

  beforeEach(() => {
    exporter.reset();
    instrumentation.setConfig({});
  });

  it('responseHook', async () => {
    await new Promise((resolve) => setTimeout(resolve, 3_000));
    instrumentation.disable();
    const config: TypeormInstrumentationConfig = {
      responseHook: (span: Span, response: any) => {
        span.setAttribute('test', JSON.stringify(response));
      },
    };
    instrumentation.setConfig(config);
    instrumentation.enable();

    const connection = await typeorm.createConnection(defaultOptions);
    const user = new User(1, 'aspecto', 'io');
    await connection.manager.save(user);
    const typeOrmSpans = getTestSpans();
    assert.strictEqual(typeOrmSpans.length, 1);
    const attributes = typeOrmSpans[0].attributes;

    assert.strictEqual(attributes['test'], JSON.stringify(user));
    assert.strictEqual(attributes[SemanticAttributes.DB_OPERATION], 'save');
    assert.strictEqual(
      attributes[SemanticAttributes.DB_SYSTEM],
      defaultOptions.type
    );
    await connection.close();
  });

  it('moduleVersionAttributeName works', async () => {
    instrumentation.disable();
    const config: TypeormInstrumentationConfig = {
      moduleVersionAttributeName: 'module.version',
    };
    instrumentation.setConfig(config);
    instrumentation.enable();

    const connection = await typeorm.createConnection(defaultOptions);
    const user = new User(1, 'aspecto', 'io');
    await connection.manager.save(user);
    const typeOrmSpans = getTestSpans();

    assert.strictEqual(typeOrmSpans.length, 1);
    const attributes = typeOrmSpans[0].attributes;
    assert.strictEqual(attributes[SemanticAttributes.DB_SQL_TABLE], 'user');
    assert.match(
      attributes['module.version'] as string,
      /\d{1,4}\.\d{1,4}\.\d{1,5}.*/
    );
    await connection.close();
  });

  it('enableInternalInstrumentation:true', async () => {
    const config: TypeormInstrumentationConfig = {
      enableInternalInstrumentation: true,
    };
    instrumentation.setConfig(config);
    const connection = await typeorm.createConnection(defaultOptions);
    const [users, count] = await connection.manager.findAndCount(User);
    const spans = getTestSpans();
    assert.strictEqual(spans.length, 2);

    const findAndCountSpan = spans.find(
      (s) => s.name.indexOf('findAndCount') !== -1
    );
    assert.notStrictEqual(findAndCountSpan, undefined);
    assert.strictEqual(
      findAndCountSpan.attributes[SemanticAttributes.DB_OPERATION],
      'findAndCount'
    );
    assert.strictEqual(
      findAndCountSpan.attributes[SemanticAttributes.DB_SQL_TABLE],
      'user'
    );

    const selectSpan = spans.find((s) => s.name.indexOf('select') !== -1);
    assert.notStrictEqual(selectSpan, undefined);
    assert.strictEqual(
      selectSpan.attributes[SemanticAttributes.DB_OPERATION],
      'select'
    );
    assert.strictEqual(
      selectSpan.attributes[SemanticAttributes.DB_SQL_TABLE],
      'user'
    );
    await connection.close();
  });

  it('enableInternalInstrumentation:false', async () => {
    const config: TypeormInstrumentationConfig = {
      enableInternalInstrumentation: false,
    };
    instrumentation.setConfig(config);
    const connection = await typeorm.createConnection(defaultOptions);
    const [users, count] = await connection.manager.findAndCount(User);
    const spans = getTestSpans();
    assert.strictEqual(spans.length, 1);
    const attributes = spans[0].attributes;
    assert.strictEqual(
      attributes[SemanticAttributes.DB_OPERATION],
      'findAndCount'
    );
    assert.strictEqual(
      attributes[SemanticAttributes.DB_SYSTEM],
      defaultOptions.type
    );
    assert.strictEqual(attributes[SemanticAttributes.DB_SQL_TABLE], 'user');
    await connection.close();
  });

  it('collectParameters:true', async () => {
    const config: TypeormInstrumentationConfig = {
      collectParameters: true,
    };
    instrumentation.setConfig(config);
    const connectionOptions = defaultOptions as any;
    const connection = await typeorm.createConnection(connectionOptions);
    await connection
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.id = :userId', { userId: '1' })
      .andWhere('user.firstName = :firstName', { firstName: 'bob' })
      .andWhere('user.lastName = :lastName', { lastName: 'dow' })
      .getMany();
    const typeOrmSpans = getTestSpans();
    assert.strictEqual(typeOrmSpans.length, 1);
    assert.strictEqual(typeOrmSpans[0].status.code, SpanStatusCode.UNSET);
    const attributes = typeOrmSpans[0].attributes;
    assert.strictEqual(
      attributes[SemanticAttributes.DB_SYSTEM],
      connectionOptions.type
    );
    assert.strictEqual(
      attributes[SemanticAttributes.DB_USER],
      connectionOptions.username
    );
    assert.strictEqual(
      attributes[SemanticAttributes.NET_PEER_NAME],
      connectionOptions.host
    );
    assert.strictEqual(
      attributes[SemanticAttributes.NET_PEER_PORT],
      connectionOptions.port
    );
    assert.strictEqual(
      attributes[SemanticAttributes.DB_NAME],
      connectionOptions.database
    );
    assert.strictEqual(attributes[SemanticAttributes.DB_SQL_TABLE], 'user');
    assert.strictEqual(
      attributes[SemanticAttributes.DB_STATEMENT],
      'SELECT "user"."id" AS "user_id", "user"."firstName" AS "user_firstName", "user"."lastName" AS "user_lastName" FROM "user" "user" WHERE "user"."id" = :userId AND "user"."firstName" = :firstName AND "user"."lastName" = :lastName'
    );
    assert.strictEqual(
      attributes[ExtendedDatabaseAttribute.DB_STATEMENT_PARAMETERS],
      JSON.stringify({ userId: '1', firstName: 'bob', lastName: 'dow' })
    );
    await connection.close();
  });
});
