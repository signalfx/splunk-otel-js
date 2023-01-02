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

import * as assert from 'assert';
import { startTracing, stopTracing } from '../../src/tracing';
import { defaultSpanProcessorFactory } from '../../src/tracing/options';
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import * as utils from '../utils';
import * as net from 'net';
import type * as Redis from 'redis';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';

describe('Redis instrumentation', () => {
  let redisServer;
  let exporter;
  let spanProcessor: SpanProcessor;

  before(() => {
    redisServer = net.createServer((socket) => {
      let data = '';
      socket.on('data', (d) => {
        data += d;

        if (data.endsWith('bar\r\n')) {
          socket.write('$2\r\nok\r\n');
          data = '';
        }
      });
    });
    redisServer.listen(6379);
  });

  after(() => {
    redisServer.close();
  });

  beforeEach(() => {
    utils.cleanEnvironment();
    exporter = new InMemorySpanExporter();
  });

  afterEach(() => {
    utils.cleanEnvironment();
    stopTracing();
  });

  const testOpts = () => ({
    serviceName: 'test-service',
    instrumentations: [new RedisInstrumentation()],
    spanExporterFactory: () => exporter,
    spanProcessorFactory: (options) => {
      return ([spanProcessor] = defaultSpanProcessorFactory(options));
    },
  });

  it('db statement is not added when SPLUNK_REDIS_INCLUDE_COMMAND_ARGS is false', (done) => {
    process.env.SPLUNK_REDIS_INCLUDE_COMMAND_ARGS = 'false';
    startTracing(testOpts());
    const client = require('redis').createClient({
      no_ready_check: true,
    });
    client.hget('foo', 'bar', async () => {
      await spanProcessor.forceFlush();
      const [span] = await exporter.getFinishedSpans();
      client.end(false);
      assert.deepStrictEqual(
        span.attributes['db.statement'],
        'hget [2 other arguments]'
      );
      done();
    });
  });

  it('db statement is fully added when setting SPLUNK_REDIS_INCLUDE_COMMAND_ARGS env var', (done) => {
    process.env.SPLUNK_REDIS_INCLUDE_COMMAND_ARGS = 'true';
    startTracing(testOpts());
    const client = require('redis').createClient({
      no_ready_check: true,
    });
    client.hget('foo', 'bar', async () => {
      await spanProcessor.forceFlush();
      const [span] = await exporter.getFinishedSpans();
      client.end(false);
      assert.deepStrictEqual(span.attributes['db.statement'], 'hget foo bar');
      done();
    });
  });
});
