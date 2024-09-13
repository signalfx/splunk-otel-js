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

import * as utils from '../utils';
utils.mockMocha();
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { strict as assert } from 'assert';
import * as net from 'net';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';
import { defaultSpanProcessorFactory } from '../../src/tracing/options';

describe('Redis instrumentation', () => {
  let redisServer: net.Server;
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
          socket.end();
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

  it('db statement is not added when SPLUNK_REDIS_INCLUDE_COMMAND_ARGS is false', async () => {
    process.env.SPLUNK_REDIS_INCLUDE_COMMAND_ARGS = 'false';
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
      tracing: testOpts(),
    });
    startTracing(tracingOptions);
    const client = require('redis').createClient({
      no_ready_check: true,
    });

    await new Promise<void>((resolve, reject) => {
      client.hget('foo', 'bar', async (err, res) => {
        if (err) {
          return reject(err);
        }

        await spanProcessor.forceFlush();
        const [span] = await exporter.getFinishedSpans();
        assert.deepStrictEqual(
          span.attributes['db.statement'],
          'hget [2 other arguments]'
        );

        resolve();
      });
    });

    await client.quit();
  });

  it('db statement is fully added when setting SPLUNK_REDIS_INCLUDE_COMMAND_ARGS env var', async () => {
    process.env.SPLUNK_REDIS_INCLUDE_COMMAND_ARGS = 'true';
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
      tracing: testOpts(),
    });
    startTracing(tracingOptions);
    const client = require('redis').createClient({
      no_ready_check: true,
    });

    await new Promise<void>((resolve, reject) => {
      client.hget('foo', 'bar', async (err, res) => {
        if (err) {
          return reject(err);
        }

        await spanProcessor.forceFlush();
        const [span] = await exporter.getFinishedSpans();
        assert.deepStrictEqual(span.attributes['db.statement'], 'hget foo bar');

        resolve();
      });
    });

    await client.quit();
  });
});
