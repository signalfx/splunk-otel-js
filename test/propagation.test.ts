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

import * as util from 'util';

import {
  context,
  defaultTextMapSetter,
  propagation,
  trace,
} from '@opentelemetry/api';
import { RandomIdGenerator } from '@opentelemetry/core';
import {
  InMemorySpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { parseOptionsAndConfigureInstrumentations } from '../src/instrumentations';
import { startTracing, stopTracing } from '../src/tracing';
import { SYNTHETIC_RUN_ID_FIELD } from '../src/tracing/SplunkBatchSpanProcessor';
import { defaultSpanProcessorFactory } from '../src/tracing/options';
import * as utils from './utils';
import { strict as assert } from 'assert';
import { describe, it, beforeEach, afterEach } from 'node:test';

function assertIncludes(arr: string[], item: string) {
  assert(Array.isArray(arr), `Expected an array got ${util.inspect(arr)}`);
  assert(
    arr.includes(item),
    `Could not find "${item}" in ${util.inspect(arr)}`
  );
}

describe('propagation', () => {
  beforeEach(utils.cleanEnvironment);
  /*
    if an assert fails, the tracing is not stopped inside the test and the tracer
    lifecycle leaks into the next test. Even though it would be better to keep
    `start`` and `stop`` in the same location we'll bring `stop` here to make
    sure it always happens.
  */
  afterEach(stopTracing);

  it('must be set to w3c by default', () => {
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

    stopTracing();
  });

  it('has an option for b3multi', () => {
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

    stopTracing();
  });

  it('has an option for b3', () => {
    process.env.OTEL_PROPAGATORS = 'b3';
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
    startTracing(tracingOptions);
    assertIncludes(propagation.fields(), 'b3');

    const tracer = trace.getTracer('test-tracer');
    const span = tracer.startSpan('main');

    const carrier = {};

    context.with(trace.setSpan(context.active(), span), () => {
      propagation.inject(context.active(), carrier, defaultTextMapSetter);
      span.end();
    });

    const traceId = span.spanContext().traceId;
    const spanId = span.spanContext().spanId;
    assert.strictEqual(carrier['b3'], `${traceId}-${spanId}-1`);

    stopTracing();
  });

  it('must extract synthetic run id', () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
    startTracing(tracingOptions);
    assertIncludes(propagation.fields(), 'baggage');

    const syntheticsTraceId = new RandomIdGenerator().generateTraceId();

    const incomingCarrier = {
      baggage: 'Synthetics-RunId=' + syntheticsTraceId,
    };
    const newContext = propagation.extract(context.active(), incomingCarrier);

    const outgoingCarrier = {};
    propagation.inject(newContext, outgoingCarrier);
    assert.strictEqual(
      outgoingCarrier['baggage'],
      'Synthetics-RunId=' + syntheticsTraceId
    );
  });

  it('must attach synthetic run id to exported spans', async () => {
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

    await spanProcessor.forceFlush();

    assert.strictEqual(exporter.getFinishedSpans().length, 1);
    assert.strictEqual(
      exporter.getFinishedSpans()[0].attributes[SYNTHETIC_RUN_ID_FIELD],
      syntheticsTraceId
    );

    stopTracing();
  });
});
