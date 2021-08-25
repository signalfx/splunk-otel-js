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

import {
  propagation,
  trace,
  context,
  defaultTextMapSetter,
} from '@opentelemetry/api';
import { startTracing, stopTracing } from '../src/tracing';
import { CompositePropagator, RandomIdGenerator } from '@opentelemetry/core';
import { InMemorySpanExporter, SpanProcessor } from '@opentelemetry/tracing';
import { SYNTHETIC_RUN_ID_FIELD } from '../src/SplunkBatchSpanProcessor';
import { defaultSpanProcessorFactory } from '../src/options';
import * as utils from './utils';

describe('propagation', () => {
  beforeEach(utils.cleanEnvironment);

  it('must be set to b3', () => {
    startTracing();
    assert(propagation.fields().includes('x-b3-traceid'));
    assert(propagation.fields().includes('x-b3-spanid'));
    assert(propagation.fields().includes('x-b3-sampled'));
    assert(propagation.fields().includes('traceparent'));

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
    assert.strictEqual(carrier['traceparent'], `00-${traceId}-${spanId}-01`);

    stopTracing();
  });

  it('must extract synthetic run id', () => {
    startTracing();
    assert(propagation.fields().includes('baggage'));

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

    stopTracing();
  });

  it('must attach synthetic run id to exported spans', async () => {
    const exporter = new InMemorySpanExporter();
    let spanProcessor: SpanProcessor;
    startTracing({
      spanExporterFactory: () => exporter,
      spanProcessorFactory: options => {
        return (spanProcessor = defaultSpanProcessorFactory(options));
      },
    });

    assert(propagation.fields().includes('baggage'));

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
