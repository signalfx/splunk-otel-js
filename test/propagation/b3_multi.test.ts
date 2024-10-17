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

test('propagation: b3 multi', () => {
  process.env.OTEL_PROPAGATORS = 'b3multi';
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  assertIncludes(propagation.fields(), 'x-b3-traceid');
  assertIncludes(propagation.fields(), 'x-b3-spanid');
  assertIncludes(propagation.fields(), 'x-b3-sampled');

  const tracer = trace.getTracer('test-tracer');
  const span = tracer.startSpan('main');

  const carrier = {};

  context.with(trace.setSpan(context.active(), span), () => {
    propagation.inject(context.active(), carrier, defaultTextMapSetter);
    span.end();
  });

  const traceId = span.spanContext().traceId;
  const spanId = span.spanContext().spanId;
  assert.strictEqual(carrier['x-b3-traceid'], traceId);
  assert.strictEqual(carrier['x-b3-spanid'], spanId);
  assert.strictEqual(carrier['x-b3-sampled'], '1');
});
