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

import { context, propagation, trace } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';
import { assertIncludes } from './common';
import { defaultSpanProcessorFactory } from '../../src/tracing/options';
import { SYNTHETIC_RUN_ID_FIELD } from '../../src/tracing/SplunkBatchSpanProcessor';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing } from '../../src/tracing';
import { strict as assert } from 'assert';
import { test } from 'node:test';

test('propagation: attach synthetic run id', async () => {
  const exporter = new InMemorySpanExporter();
  let spanProcessor: SpanProcessor;
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      spanExporterFactory: () => exporter,
      spanProcessorFactory: (options) => {
        return ([spanProcessor] = defaultSpanProcessorFactory(options));
      },
    },
  });

  startTracing(tracingOptions);

  assertIncludes(propagation.fields(), 'baggage');

  const tracer = trace.getTracer('test-tracer');
  const syntheticsTraceId = new RandomIdGenerator().generateTraceId();
  const incomingCarrier = {
    baggage: 'Synthetics-RunId=' + syntheticsTraceId,
  };
  const newContext = propagation.extract(context.active(), incomingCarrier);
  tracer.startSpan('request handler', {}, newContext).end();

  await spanProcessor!.forceFlush();

  assert.strictEqual(exporter.getFinishedSpans().length, 1);
  assert.strictEqual(
    exporter.getFinishedSpans()[0].attributes[SYNTHETIC_RUN_ID_FIELD],
    syntheticsTraceId
  );
});
