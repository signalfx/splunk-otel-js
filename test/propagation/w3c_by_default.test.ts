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
  context,
  defaultTextMapSetter,
  propagation,
  trace,
} from '@opentelemetry/api';
import { assertIncludes } from './common';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing } from '../../src/tracing';
import { strict as assert } from 'assert';
import { test } from 'node:test';

test('propagation defaults to w3c', () => {
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  assertIncludes(propagation.fields(), 'traceparent');
  assertIncludes(propagation.fields(), 'tracestate');
  assertIncludes(propagation.fields(), 'baggage');

  const tracer = trace.getTracer('test-tracer');
  const span = tracer.startSpan('main');
  const carrier = {};
  const baggage = propagation.createBaggage({
    key1: { value: 'value1' },
  });
  const ctx = trace.setSpan(
    propagation.setBaggage(context.active(), baggage),
    span
  );

  context.with(ctx, () => {
    propagation.inject(context.active(), carrier, defaultTextMapSetter);
    span.end();
  });

  const traceId = span.spanContext().traceId;
  const spanId = span.spanContext().spanId;
  assert.strictEqual(carrier['traceparent'], `00-${traceId}-${spanId}-01`);
  assert.strictEqual(carrier['baggage'], 'key1=value1');
});
