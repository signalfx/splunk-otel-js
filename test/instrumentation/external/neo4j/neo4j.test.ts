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
import {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  suite,
} from 'node:test';
import {
  context,
  ROOT_CONTEXT,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import { Neo4jInstrumentation } from '../../../../src/instrumentations/external/neo4j';
import {
  ATTR_DB_OPERATION,
  ATTR_DB_STATEMENT,
} from '../../../../src/instrumentations/external/neo4j/semconv';
import { map, mergeMap } from 'rxjs/operators';
// eslint-disable-next-line n/no-extraneous-import
import { concat } from 'rxjs';
import { setInstrumentation, getTestSpans, provider, exporter } from '../setup';
import { startContainer, stopContainer } from '../../../utils';

const instrumentation = new Neo4jInstrumentation();
provider.register();

import neo4j, { Driver } from 'neo4j-driver';
import { normalizeResponse, assertSpan } from './utils';

const testWithDocker = process.env.NEO4J_TEST_WITH_DOCKER !== undefined;
const testWithLocalNeo4j = process.env.NEO4J_TEST_WITH_LOCAL !== undefined;
const shouldTest = testWithDocker || testWithLocalNeo4j;

describe('neo4j instrumentation', { skip: !shouldTest }, () => {
  let driver: Driver;

  const getSingleSpan = () => {
    const spans = getTestSpans();
    assert.equal(spans.length, 1);
    return spans[0];
  };

  before(async () => {
    if (!shouldTest) {
      suite.skip();
      return;
    }

    if (testWithDocker) {
      startContainer(
        'docker run --rm -d --name splunk-otel-neo4j -p 11011:7687 -e NEO4J_AUTH=neo4j/test_pw neo4j:4.4.42'
      );
    }

    setInstrumentation(instrumentation);
    driver = neo4j.driver(
      'bolt://localhost:11011',
      neo4j.auth.basic('neo4j', 'test_pw'),
      {
        disableLosslessIntegers: true,
      }
    );

    let keepChecking = true;
    const timeoutId = setTimeout(() => {
      keepChecking = false;
    }, 8000);
    while (keepChecking) {
      try {
        await driver.verifyConnectivity();
        clearTimeout(timeoutId);
        return;
      } catch (err) {
        await new Promise((res) => setTimeout(res, 1000));
      }
    }
    throw new Error('Could not connect to neo4j in allowed time frame');
  });

  after(async () => {
    if (testWithDocker) {
      stopContainer('splunk-otel-neo4j');
    }

    await driver.close();
  });

  beforeEach(async () => {
    await driver.session().run('MATCH (n) DETACH DELETE n');
    exporter.reset();
  });

  afterEach(async () => {
    instrumentation.setConfig({});
  });

  describe('session', () => {
    it('instruments "run" with promise', async () => {
      const res = await driver.session().run('CREATE (n:MyLabel) RETURN n');

      assert.equal(res.records.length, 1);
      assert.deepStrictEqual((res.records[0].toObject() as any).n.labels, [
        'MyLabel',
      ]);

      const span = getSingleSpan();
      assertSpan(span);
      assert.strictEqual(span.name, 'CREATE neo4j');
      assert.strictEqual(span.attributes[ATTR_DB_OPERATION], 'CREATE');
      assert.strictEqual(
        span.attributes[ATTR_DB_STATEMENT],
        'CREATE (n:MyLabel) RETURN n'
      );
    });

    it('instruments "run" with subscribe', (_ctx, done) => {
      driver
        .session()
        .run('CREATE (n:MyLabel) RETURN n')
        .subscribe({
          onCompleted: () => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.strictEqual(span.attributes[ATTR_DB_OPERATION], 'CREATE');
            assert.strictEqual(
              span.attributes[ATTR_DB_STATEMENT],
              'CREATE (n:MyLabel) RETURN n'
            );
            done();
          },
        });
    });

    it('handles "run" exceptions with promise', async () => {
      try {
        await driver.session().run('NOT_EXISTS_OPERATION');
      } catch (err) {
        const span = getSingleSpan();
        assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
        assert.strictEqual(span.status.message, err.message);
        return;
      }
      throw Error('should not be here');
    });

    it('handles "run" exceptions with subscribe', (_ctx, done) => {
      driver
        .session()
        .run('NOT_EXISTS_OPERATION')
        .subscribe({
          onError: (err) => {
            const span = getSingleSpan();
            assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
            assert.strictEqual(span.status.message, err.message);
            done();
          },
        });
    });

    it('closes span when on "onKeys" event', (_ctx, done) => {
      driver
        .session()
        .run('MATCH (n) RETURN n')
        .subscribe({
          onKeys: (keys) => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.deepStrictEqual(keys, ['n']);
            done();
          },
        });
    });

    it('when passing "onKeys" and onCompleted, span is closed in onCompleted, and response hook is called', (_ctx, done) => {
      instrumentation.setConfig({
        responseHook: (span) => span.setAttribute('test', 'cool'),
      });

      driver
        .session()
        .run('MATCH (n) RETURN n')
        .subscribe({
          onKeys: () => {
            const spans = getTestSpans();
            assert.strictEqual(spans.length, 0);
          },
          onCompleted: () => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.strictEqual(span.attributes['test'], 'cool');
            done();
          },
        });
    });

    it('handles multiple promises', async () => {
      await Promise.all([
        driver.session().run('MATCH (n) RETURN n'),
        driver.session().run('MATCH (k) RETURN k'),
        driver.session().run('MATCH (d) RETURN d'),
      ]);
      const spans = getTestSpans();
      assert.strictEqual(spans.length, 3);
      for (const span of spans) {
        assertSpan(span);
        assert.strictEqual(span.attributes[ATTR_DB_OPERATION], 'MATCH');
      }
    });

    it('captures operation with trailing white spaces', async () => {
      await driver.session().run('  MATCH (k) RETURN k ');
      const span = getSingleSpan();
      assert.strictEqual(span.attributes[ATTR_DB_OPERATION], 'MATCH');
    });

    it('does not capture any span when ignoreOrphanedSpans is set to true', async () => {
      instrumentation.setConfig({ ignoreOrphanedSpans: true });
      await context.with(ROOT_CONTEXT, async () => {
        await driver.session().run('CREATE (n:MyLabel) RETURN n');
      });

      const spans = getTestSpans();
      assert.strictEqual(spans.length, 0);
    });

    it('does capture span when ignoreOrphanedSpans is set to true and has parent span', async () => {
      instrumentation.setConfig({ ignoreOrphanedSpans: true });
      const parent = trace
        .getTracerProvider()
        .getTracer('test-tracer')
        .startSpan('main');
      await context.with(trace.setSpan(context.active(), parent), () => {
        return driver.session().run('CREATE (n:MyLabel) RETURN n');
      });

      const spans = getTestSpans();
      assert.strictEqual(spans.length, 1);
    });

    it('responseHook works with promise', async () => {
      instrumentation.setConfig({
        responseHook: (span, response) => {
          span.setAttribute('db.response', normalizeResponse(response));
        },
      });

      const res = await driver
        .session()
        .run(
          'CREATE (n:Rick), (b:Meeseeks { purpose: "help"}), (c:Morty) RETURN *'
        );
      assert.strictEqual(res.records.length, 1);

      const span = getSingleSpan();
      assertSpan(span);
      assert.deepStrictEqual(
        JSON.parse(span.attributes['db.response'] as string),
        [
          {
            b: { labels: ['Meeseeks'], properties: { purpose: 'help' } },
            c: { labels: ['Morty'], properties: {} },
            n: { labels: ['Rick'], properties: {} },
          },
        ]
      );
    });

    it('responseHook works with subscribe', (_ctx, done) => {
      instrumentation.setConfig({
        responseHook: (span, response) => {
          span.setAttribute('db.response', normalizeResponse(response));
        },
      });

      driver
        .session()
        .run(
          'CREATE (n:Rick), (b:Meeseeks { purpose: "help"}), (c:Morty) RETURN *'
        )
        .subscribe({
          onCompleted: () => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.deepStrictEqual(
              JSON.parse(span.attributes['db.response'] as string),
              [
                {
                  b: { labels: ['Meeseeks'], properties: { purpose: 'help' } },
                  c: { labels: ['Morty'], properties: {} },
                  n: { labels: ['Rick'], properties: {} },
                },
              ]
            );
            done();
          },
        });
    });

    it('does not fail when responseHook throws', async () => {
      instrumentation.setConfig({
        responseHook: () => {
          throw new Error('I throw..');
        },
      });
      await driver.session().run('CREATE (n:MyLabel) RETURN n');
      const span = getSingleSpan();
      assertSpan(span);
    });
  });

  describe('transaction', async () => {
    it('instruments session readTransaction', async () => {
      await driver.session().readTransaction((txc) => {
        return txc.run('MATCH (person:Person) RETURN person.name AS name');
      });
      const span = getSingleSpan();
      assertSpan(span);
      assert.strictEqual(span.attributes[ATTR_DB_OPERATION], 'MATCH');
      assert.strictEqual(
        span.attributes[ATTR_DB_STATEMENT],
        'MATCH (person:Person) RETURN person.name AS name'
      );
    });

    it('instruments session writeTransaction', async () => {
      await driver.session().writeTransaction((txc) => {
        return txc.run('MATCH (person:Person) RETURN person.name AS name');
      });
      const span = getSingleSpan();
      assertSpan(span);
      assert.strictEqual(span.attributes[ATTR_DB_OPERATION], 'MATCH');
      assert.strictEqual(
        span.attributes[ATTR_DB_STATEMENT],
        'MATCH (person:Person) RETURN person.name AS name'
      );
    });

    it('instruments explicit transactions', async () => {
      const txc = driver.session().beginTransaction();
      await txc.run('MERGE (bob:Person {name: "Bob"}) RETURN bob.name AS name');
      await txc.run(
        'MERGE (adam:Person {name: "Adam"}) RETURN adam.name AS name'
      );
      await txc.commit();

      const spans = getTestSpans();
      assert.strictEqual(spans.length, 2);
    });
  });

  describe('rxSession', () => {
    it('instruments "run"', (_ctx, done) => {
      driver
        .rxSession()
        .run('MERGE (n:MyLabel) RETURN n')
        .records()
        .subscribe({
          complete: () => {
            const span = getSingleSpan();
            assertSpan(span);
            done();
          },
        });
    });

    it('works when piping response', (_ctx, done) => {
      const rxSession = driver.rxSession();
      rxSession
        .run(
          'MERGE (james:Person {name: $nameParam}) RETURN james.name AS name',
          {
            nameParam: 'Bob',
          }
        )
        .records()
        .pipe(map((record) => record.get('name')))
        .subscribe({
          next: () => {},
          complete: () => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.strictEqual(
              span.attributes[ATTR_DB_STATEMENT],
              'MERGE (james:Person {name: $nameParam}) RETURN james.name AS name'
            );
            done();
          },
          error: () => {},
        });
    });

    it('works with response hook', (_ctx, done) => {
      instrumentation.setConfig({
        responseHook: (span, response) => {
          span.setAttribute('db.response', normalizeResponse(response));
        },
      });

      driver
        .rxSession()
        .run('MERGE (n:MyLabel) RETURN n')
        .records()
        .subscribe({
          complete: () => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.strictEqual(
              span.attributes['db.response'],
              `[{"n":{"labels":["MyLabel"],"properties":{}}}]`
            );
            done();
          },
        });
    });
  });

  describe('reactive transaction', () => {
    it('instruments rx session readTransaction', (_ctx, done) => {
      driver
        .rxSession()
        .readTransaction((txc) =>
          txc
            .run('MATCH (person:Person) RETURN person.name AS name')
            .records()
            .pipe(map((record) => record.get('name')))
        )
        .subscribe({
          next: () => {},
          complete: () => {
            const span = getSingleSpan();
            assert.strictEqual(
              span.attributes[ATTR_DB_STATEMENT],
              'MATCH (person:Person) RETURN person.name AS name'
            );
            done();
          },
          error: () => {},
        });
    });

    it('instruments rx session writeTransaction', (_ctx, done) => {
      driver
        .rxSession()
        .writeTransaction((txc) =>
          txc
            .run('MATCH (person:Person) RETURN person.name AS name')
            .records()
            .pipe(map((record) => record.get('name')))
        )
        .subscribe({
          next: () => {},
          complete: () => {
            const span = getSingleSpan();
            assertSpan(span);
            assert.strictEqual(
              span.attributes[ATTR_DB_STATEMENT],
              'MATCH (person:Person) RETURN person.name AS name'
            );
            done();
          },
          error: () => {},
        });
    });

    it('instruments rx explicit transactions', (_ctx, done) => {
      driver
        .rxSession()
        .beginTransaction()
        .pipe(
          mergeMap((txc) =>
            concat(
              txc
                .run(
                  'MERGE (bob:Person {name: $nameParam}) RETURN bob.name AS name',
                  {
                    nameParam: 'Bob',
                  }
                )
                .records()
                .pipe(map((r: any) => r.get('name'))),
              txc
                .run(
                  'MERGE (adam:Person {name: $nameParam}) RETURN adam.name AS name',
                  {
                    nameParam: 'Adam',
                  }
                )
                .records()
                .pipe(map((r: any) => r.get('name'))),
              txc.commit()
            )
          )
        )
        .subscribe({
          next: () => {},
          complete: () => {
            const spans = getTestSpans();
            assert.strictEqual(spans.length, 2);
            done();
          },
          error: () => {},
        });
    });
  });

  describe('routing mode', () => {
    // When the connection string starts with "neo4j" routing mode is used
    let routingDriver: Driver;
    const version = require('neo4j-driver/package.json').version;
    const shouldCheck = !['4.0.0', '4.0.1', '4.0.2'].includes(version);

    before(() => {
      if (shouldCheck) {
        routingDriver = neo4j.driver(
          'neo4j://localhost:11011',
          neo4j.auth.basic('neo4j', 'test_pw')
        );
      }
    });

    after(async () => {
      if (shouldCheck) {
        await routingDriver.close();
      }
    });

    it('instruments as expected in routing mode', async () => {
      if (!shouldCheck) {
        // Versions 4.0.0, 4.0.1 and 4.0.2 of neo4j-driver don't allow connection to local neo4j in routing mode.
        console.log(`Skipping unsupported test for version ${version}`);
        return;
      }

      await routingDriver.session().run('CREATE (n:MyLabel) RETURN n');

      const span = getSingleSpan();
      assertSpan(span);
    });
  });
});
