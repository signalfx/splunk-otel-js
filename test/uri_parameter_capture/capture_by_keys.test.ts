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
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { strict as assert } from 'assert';
import { after, test } from 'node:test';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';
import { defaultSpanProcessorFactory } from '../../src/tracing/options';
import { doRequest, setupServer } from './common';

test('URI parameters can be captured by keys', async () => {
  const exporter = new InMemorySpanExporter();
  let spanProcessor: SpanProcessor;
  const [server, url] = await setupServer();

  after(async () => {
    server.close();
    await stopTracing();
  });

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      captureHttpRequestUriParams: ['sortBy', 'order', 'yes'],
      spanExporterFactory: () => exporter,
      spanProcessorFactory: (options) => {
        return ([spanProcessor] = defaultSpanProcessorFactory(options));
      },
    },
  });
  startTracing(tracingOptions);
  await doRequest(`${url}/foo?sortBy=name&order=asc&order=desc&quux=123&yes`);
  await spanProcessor!.forceFlush();
  const [span] = exporter.getFinishedSpans();
  assert.deepStrictEqual(span.attributes['http.request.param.sortBy'], [
    'name',
  ]);
  assert.deepStrictEqual(span.attributes['http.request.param.order'], [
    'asc',
    'desc',
  ]);
  assert.deepStrictEqual(span.attributes['http.request.param.yes'], ['']);
  assert.deepEqual(span.attributes['http.request.param.quux'], undefined);
});
