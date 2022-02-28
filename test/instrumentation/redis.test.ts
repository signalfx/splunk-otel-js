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
import { startTracing } from '../../src/tracing';
import * as utils from '../utils';
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { defaultSpanProcessorFactory } from '../../src/options';
import * as net from 'net';
import type * as Redis from 'redis';

describe('Redis instrumentation', () => {
  let redisServer;
  let exporter;
  let spanProcessor: SpanProcessor;

  before(() => {
    redisServer = net.createServer(socket => {
      let data = '';
      socket.on('data', d => {
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

  const testOpts = () => ({
    spanExporterFactory: () => exporter,
    spanProcessorFactory: options => {
      return (spanProcessor = defaultSpanProcessorFactory(options));
    },
  });

  it('db statement is not added by default', done => {
    startTracing(testOpts());
    const client = require('redis').createClient({
      no_ready_check: true,
    });
    client.hget('foo', 'bar', async () => {
      await spanProcessor.forceFlush();
      const [span] = await exporter.getFinishedSpans();
      assert.deepStrictEqual(span.attributes['db.statement'], 'hget');
      done();
    });
  });

  it('db statement is added when setting SPLUNK_REDIS_INCLUDE_COMMAND_ARGS env var', done => {
    process.env.SPLUNK_REDIS_INCLUDE_COMMAND_ARGS = 'true';
    startTracing(testOpts());
    const client = require('redis').createClient({
      no_ready_check: true,
    });
    client.hget('foo', 'bar', async () => {
      await spanProcessor.forceFlush();
      const [span] = await exporter.getFinishedSpans();
      assert.deepStrictEqual(span.attributes['db.statement'], 'hget foo bar');
      done();
    });
  });
});
