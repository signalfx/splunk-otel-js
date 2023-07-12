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
import * as nock from 'nock';
import * as assert from 'assert';
import { ElasticsearchInstrumentation } from '../../../../src/instrumentations/external/elasticsearch';

import {
  NodeTracerProvider,
  NodeTracerConfig,
} from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { setInstrumentation, getTestSpans } from '../setup';

const instrumentation = new ElasticsearchInstrumentation();

import { Client } from '@elastic/elasticsearch';
const esMockUrl = 'http://localhost:9200';
const esNock = nock(esMockUrl);
const client = new Client({ node: esMockUrl });

describe('elasticsearch instrumentation', () => {
  before(() => {
    setInstrumentation(instrumentation);
    instrumentation.enable();

    // Handle Elasticsearch product check
    esNock
      .get('/')
      .reply(
        200,
        { version: { number: '7.14.0' } },
        { 'x-elastic-product': 'Elasticsearch' }
      );
  });

  after(() => {
    instrumentation.disable();
  });

  it('should create valid span', async () => {
    esNock.get('/the-simpsons/_search').reply(200, {});
    esNock.post('/the-simpsons/_doc').reply(200, {});

    await client.index({
      index: 'the-simpsons',
      type: '_doc',
      body: {
        character: 'Homer Simpson',
        quote: 'Doh!',
      },
    });

    await client.search({
      index: 'the-simpsons',
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    const spans = getTestSpans();
    assert.strictEqual(spans?.length, 2);
    assert.deepStrictEqual(spans[0].attributes, {
      'db.system': 'elasticsearch',
      'elasticsearch.request.indices': 'the-simpsons',
      'db.operation': 'client.index',
      'db.statement':
        '{"params":{"index":"the-simpsons","type":"_doc","body":{"character":"Homer Simpson","quote":"Doh!"}}}',
      'net.transport': 'IP.TCP',
      'net.peer.name': 'localhost',
      'net.peer.port': '9200',
    });
    assert.deepStrictEqual(spans[1].attributes, {
      'db.system': 'elasticsearch',
      'elasticsearch.request.indices': 'the-simpsons',
      'db.operation': 'client.search',
      'db.statement': '{"params":{"index":"the-simpsons"}}',
      'net.transport': 'IP.TCP',
      'net.peer.name': 'localhost',
      'net.peer.port': '9200',
    });
  });

  it('should create another valid span', async () => {
    esNock.get('/_cluster/settings').reply(200, {});

    await client.cluster.getSettings();
    await new Promise(resolve => setTimeout(resolve, 5000));
    const spans = getTestSpans();

    assert.strictEqual(spans?.length, 1);
    assert.deepStrictEqual(spans[0].attributes, {
      'db.system': 'elasticsearch',
      'db.operation': 'cluster.getSettings',
      'db.statement': '{"params":{},"options":{}}',
      'net.transport': 'IP.TCP',
      'net.peer.name': 'localhost',
      'net.peer.port': '9200',
    });
  });

  it('should not create spans when instrument disabled', async () => {
    esNock.get('/_cluster/settings').reply(200, {});

    instrumentation.disable();
    await client.cluster.getSettings();
    instrumentation.enable();
    const spans = getTestSpans();
    assert.strictEqual(spans?.length, 0);
  });
});
