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

import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { strict as assert } from 'assert';
import { after, test } from 'node:test';
import { parseOptionsAndConfigureInstrumentations } from '../../../src/instrumentations';
import { startTracing } from '../../../src/tracing';
import { defaultSpanProcessorFactory } from '../../../src/tracing/options';
import { createServer } from './common';

test('Redis instrumentation: db statement is not added when SPLUNK_REDIS_INCLUDE_COMMAND_ARGS is false', async () => {
  process.env.SPLUNK_REDIS_INCLUDE_COMMAND_ARGS = 'false';

  const port = 6379;
  const redisServer = createServer(port);
  const exporter = new InMemorySpanExporter();
  let spanProcessor: SpanProcessor;

  after(() => {
    redisServer.close();
  });

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      serviceName: 'test-service',
      instrumentations: [new RedisInstrumentation()],
      spanExporterFactory: () => exporter,
      spanProcessorFactory: (options) => {
        return ([spanProcessor] = defaultSpanProcessorFactory(options));
      },
    },
  });

  startTracing(tracingOptions);

  const client = require('redis').createClient({
    no_ready_check: true,
    port,
  });

  await new Promise<void>((resolve, reject) => {
    client.hget('foo', 'bar', async (err: any) => {
      if (err) {
        return reject(err);
      }

      await spanProcessor.forceFlush();
      const [span] = exporter.getFinishedSpans();
      assert.deepStrictEqual(
        span.attributes['db.statement'],
        'hget [2 other arguments]'
      );

      resolve();
    });
  });

  await client.quit();
});
