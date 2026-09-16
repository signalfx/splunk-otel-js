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
import { EventEmitter } from 'events';
import { dirname, join } from 'path';
import { describe, it } from 'node:test';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { InstrumentationNodeModuleDefinition } from '@opentelemetry/instrumentation';
import { ATTR_DB_QUERY_TEXT } from '@opentelemetry/semantic-conventions';
import { MySQL2Instrumentation } from '../../../../src/instrumentations/external/mysql2';

type CommandCallback = (
  err: Error | null,
  results?: unknown,
  fields?: unknown
) => void;

class FakeCommand extends EventEmitter {}

class FakeConnection {
  config = { host: 'localhost', port: 3306, database: 'test' };
  events: string[] = [];
  private queue: Array<{
    label: string;
    callback?: CommandCallback;
    command: FakeCommand;
  }> = [];
  private active = false;

  query(
    sql: string,
    valuesOrCallback?: unknown | CommandCallback,
    callback?: CommandCallback
  ) {
    const queryCallback =
      typeof valuesOrCallback === 'function'
        ? (valuesOrCallback as CommandCallback)
        : callback;
    return this.enqueue(`query:${sql}`, queryCallback);
  }

  execute(
    sql: string,
    valuesOrCallback?: unknown | CommandCallback,
    callback?: CommandCallback
  ) {
    const executeCallback =
      typeof valuesOrCallback === 'function'
        ? (valuesOrCallback as CommandCallback)
        : callback;
    return this.enqueue(`execute:${sql}`, executeCallback);
  }

  prepare(
    options: string | { sql: string },
    callback?: (err: Error | null, statement: FakePreparedStatement) => void
  ) {
    const sql = typeof options === 'string' ? options : options.sql;
    const statement = new FakePreparedStatement(this, sql);
    return this.enqueue(
      `prepare:${sql}`,
      callback && ((err) => callback(err, statement))
    );
  }

  enqueue(label: string, callback?: CommandCallback) {
    const command = new FakeCommand();
    this.events.push(`queued:${label}`);
    this.queue.push({ label, callback, command });
    this.drain();
    return command;
  }

  private drain() {
    if (this.active) {
      return;
    }

    const entry = this.queue.shift();
    if (!entry) {
      return;
    }

    this.active = true;
    this.events.push(`started:${entry.label}`);
    setImmediate(() => {
      this.events.push(`completed:${entry.label}`);
      entry.callback?.(null, [], []);
      entry.command.emit('result', []);
      entry.command.emit('end');
      this.active = false;
      this.drain();
    });
  }
}

class FakePreparedStatement {
  constructor(
    private readonly connection: FakeConnection,
    public readonly query: string
  ) {}

  execute(
    parametersOrCallback?: unknown | CommandCallback,
    callback?: CommandCallback
  ) {
    const executeCallback =
      typeof parametersOrCallback === 'function'
        ? (parametersOrCallback as CommandCallback)
        : callback;
    return this.connection.enqueue(`prepared:${this.query}`, executeCallback);
  }
}

function createPatchedConnection() {
  const exporter = new InMemorySpanExporter();
  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });
  const instrumentation = new MySQL2Instrumentation({ enabled: false });
  instrumentation.setTracerProvider(provider);
  const [definition] =
    instrumentation.getModuleDefinitions() as InstrumentationNodeModuleDefinition[];
  const connectionFile = definition.files.find(
    (file) => file.name === 'mysql2/lib/connection.js'
  );
  assert.ok(connectionFile);
  connectionFile.patch(FakeConnection, '3.15.3');

  return { connectionFile, exporter };
}

function prepareStatement(
  connection: FakeConnection,
  options: string | { sql: string }
) {
  return new Promise<FakePreparedStatement>((resolve, reject) => {
    connection.prepare(options, (err, statement) => {
      if (err) {
        reject(err);
      } else {
        resolve(statement);
      }
    });
  });
}

function executeStatement(
  statement: FakePreparedStatement,
  parameters?: unknown
) {
  return new Promise<void>((resolve, reject) => {
    const callback = (err: Error | null) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    };

    if (parameters === undefined) {
      statement.execute(callback);
    } else {
      statement.execute(parameters, callback);
    }
  });
}

describe('mysql2 prepared statements', () => {
  it('creates a span when an explicit prepared statement is executed', async () => {
    const { connectionFile, exporter } = createPatchedConnection();
    const connection = new FakeConnection();

    try {
      const statement = await prepareStatement(connection, 'SELECT ?');
      assert.equal(exporter.getFinishedSpans().length, 0);

      await executeStatement(statement, [1]);

      const [span] = exporter.getFinishedSpans();
      assert.ok(span);
      assert.equal(span.name, 'SELECT');
      assert.equal(span.attributes[ATTR_DB_QUERY_TEXT], 'SELECT ?');
      assert.deepEqual(connection.events, [
        'queued:prepare:SELECT ?',
        'started:prepare:SELECT ?',
        'completed:prepare:SELECT ?',
        'queued:prepared:SELECT ?',
        'started:prepared:SELECT ?',
        'completed:prepared:SELECT ?',
      ]);
    } finally {
      connectionFile.unpatch(FakeConnection, '3.15.3');
    }
  });

  it('supports scalar and named parameter values', async () => {
    const { connectionFile, exporter } = createPatchedConnection();
    const connection = new FakeConnection();

    try {
      const statement = await prepareStatement(connection, {
        sql: 'SELECT :value',
      });
      await executeStatement(statement, { value: 1 });
      await executeStatement(statement, 1);

      assert.equal(exporter.getFinishedSpans().length, 2);
    } finally {
      connectionFile.unpatch(FakeConnection, '3.15.3');
    }
  });

  it('supports mysql2 promise prepared-statement delegation', async () => {
    const { connectionFile, exporter } = createPatchedConnection();
    const connection = new FakeConnection();

    try {
      const statement = await prepareStatement(connection, 'SELECT ?');
      const PromisePreparedStatementInfo = require(
        join(
          dirname(require.resolve('mysql2')),
          'lib/promise/prepared_statement_info.js'
        )
      );
      const promiseStatement = new PromisePreparedStatementInfo(
        statement,
        Promise
      );

      await promiseStatement.execute([1]);

      assert.equal(exporter.getFinishedSpans().length, 1);
    } finally {
      connectionFile.unpatch(FakeConnection, '3.15.3');
    }
  });

  it('restores connection and prepared-statement methods on unpatch', async () => {
    const originalQuery = FakeConnection.prototype.query;
    const originalExecute = FakeConnection.prototype.execute;
    const originalPrepare = FakeConnection.prototype.prepare;
    const { connectionFile } = createPatchedConnection();
    const connection = new FakeConnection();
    const statement = await prepareStatement(connection, 'SELECT ?');
    const originalStatementExecute = FakePreparedStatement.prototype.execute;

    connectionFile.unpatch(FakeConnection, '3.15.3');

    assert.strictEqual(FakeConnection.prototype.query, originalQuery);
    assert.strictEqual(FakeConnection.prototype.execute, originalExecute);
    assert.strictEqual(FakeConnection.prototype.prepare, originalPrepare);
    assert.strictEqual(statement.execute, originalStatementExecute);
  });
});
