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
import { test, mock } from 'node:test';

import { trace } from '@opentelemetry/api';
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';

test('Tracing: flushes when stopped', async () => {
  const createSpan = (
    expectRecording = true,
    tracer = trace.getTracer('test-tracer')
  ) => {
    const span = tracer.startSpan('test-span');
    assert.equal(span.isRecording(), expectRecording);
    span.end();
  };
  const exporter = new InMemorySpanExporter();
  const exportFn = mock.method(exporter, 'export');
  const shutdownFn = mock.method(exporter, 'shutdown');

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      spanExporterFactory: () => exporter,
    },
  });

  startTracing(tracingOptions);

  const storedTracer = trace.getTracer('test-tracer');
  createSpan();

  assert.equal(exportFn.mock.callCount(), 0);
  assert.equal(shutdownFn.mock.callCount(), 0);
  await stopTracing();

  createSpan(false);
  // note that if the tracer is created and stored before stopping tracing, the spans
  // are "recorded", but the SpanProcessor which is now shut down will just dump them.
  createSpan(true, storedTracer);

  assert.equal(exportFn.mock.callCount(), 1);
  assert.equal(shutdownFn.mock.callCount(), 1);

  exportFn.mock.restore();
  shutdownFn.mock.restore();
});
