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
import { test } from 'node:test';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
  TracerProvider,
} from '@opentelemetry/sdk-trace';
import {
  toBatchSpanProcessorOptions,
  toTracerProviderOptions,
} from '../../src/tracing/sdkTraceCompatibility';

test('legacy tracer limits still apply to recorded spans', () => {
  const previousCountLimit = process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
  const previousValueLimit = process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
  process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = '2';
  process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = '4';

  try {
    const exporter = new InMemorySpanExporter();
    const provider = new TracerProvider(
      toTracerProviderOptions({
        generalLimits: { attributeCountLimit: 1 },
        spanProcessors: [new SimpleSpanProcessor({ exporter })],
      })
    );
    const span = provider.getTracer('test').startSpan('limited span');
    span.setAttribute('first', '123456');
    span.setAttribute('second', 'ignored');
    span.end();

    assert.deepEqual(exporter.getFinishedSpans()[0].attributes, {
      first: '1234',
    });
  } finally {
    if (previousCountLimit === undefined) {
      delete process.env.OTEL_ATTRIBUTE_COUNT_LIMIT;
    } else {
      process.env.OTEL_ATTRIBUTE_COUNT_LIMIT = previousCountLimit;
    }
    if (previousValueLimit === undefined) {
      delete process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT;
    } else {
      process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT = previousValueLimit;
    }
  }
});

test('legacy batch settings retain environment fallbacks and explicit overrides', () => {
  const previousQueueSize = process.env.OTEL_BSP_MAX_QUEUE_SIZE;
  process.env.OTEL_BSP_MAX_QUEUE_SIZE = '42';

  try {
    const exporter = new InMemorySpanExporter();
    assert.equal(toBatchSpanProcessorOptions(exporter).maxQueueSize, 42);
    assert.equal(
      toBatchSpanProcessorOptions(exporter, { maxQueueSize: 7 }).maxQueueSize,
      7
    );
  } finally {
    if (previousQueueSize === undefined) {
      delete process.env.OTEL_BSP_MAX_QUEUE_SIZE;
    } else {
      process.env.OTEL_BSP_MAX_QUEUE_SIZE = previousQueueSize;
    }
  }
});
