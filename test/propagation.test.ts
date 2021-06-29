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
  setSpan,
  defaultTextMapSetter,
} from '@opentelemetry/api';
import { startTracing } from '../src/tracing';
import { CompositePropagator, RandomIdGenerator } from '@opentelemetry/core';
import { InMemorySpanExporter, SpanProcessor } from '@opentelemetry/tracing';
import { SYNTHETIC_RUN_ID_FIELD } from '../src/SplunkBatchSpanProcessor';
import { defaultSpanProcessorFactory } from '../src/options';

describe('propagation', () => {
  it('must be set to b3', done => {
    startTracing();

    const propagator = propagation._getGlobalPropagator();
    assert(
      propagator instanceof CompositePropagator,
      'propagator must be a CompositePropagator'
    );

    const tracer = trace.getTracer('test-tracer');
    const span = tracer.startSpan('main');
    context.with(setSpan(context.active(), span), () => {
      const carrier = {};
      propagation.inject(context.active(), carrier, defaultTextMapSetter);
      span.end();

      const traceId = span.context().traceId;
      const spanId = span.context().spanId;
      assert.strictEqual(carrier['x-b3-traceid'], traceId);
      assert.strictEqual(carrier['x-b3-spanid'], spanId);
      assert.strictEqual(carrier['x-b3-sampled'], '1');
      assert.strictEqual(carrier['traceparent'], `00-${traceId}-${spanId}-01`);
      done();
    });
  });

  it('must extract synthetic run id', done => {
    startTracing();

    const propagator = propagation._getGlobalPropagator();
    assert(propagator instanceof CompositePropagator);
    assert(propagator.fields().includes('baggage'));

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
    done();
  });

  it('must extract synthetic run id', done => {
    const exporter = new InMemorySpanExporter();
    let spanProcessor: SpanProcessor;
    startTracing({
      spanExporterFactory: () => exporter,
      spanProcessorFactory: options => {
        spanProcessor = defaultSpanProcessorFactory(options);
        return spanProcessor;
      },
    });

    const propagator = propagation._getGlobalPropagator();
    assert(
      propagator instanceof CompositePropagator,
      'propagator must be instance of B3Propagator'
    );

    assert(propagator.fields().includes('baggage'));

    const tracer = trace.getTracer('test-tracer');

    const syntheticsTraceId = new RandomIdGenerator().generateTraceId();
    const incomingCarrier = {
      baggage: 'Synthetics-RunId=' + syntheticsTraceId,
    };
    const newContext = propagation.extract(context.active(), incomingCarrier);
    tracer.startSpan('request handler', {}, newContext).end();

    spanProcessor.forceFlush().then(() => {
      assert(exporter.getFinishedSpans().length == 1);
      assert.strictEqual(
        exporter.getFinishedSpans()[0].attributes[SYNTHETIC_RUN_ID_FIELD],
        syntheticsTraceId
      );

      done();
    });
  });

  it('must ignore invalid synthetic run id', done => {
    const exporter = new InMemorySpanExporter();
    let spanProcessor: SpanProcessor;
    startTracing({
      spanExporterFactory: () => exporter,
      spanProcessorFactory: options => {
        spanProcessor = defaultSpanProcessorFactory(options);
        return spanProcessor;
      },
    });

    const tracer = trace.getTracer('test-tracer');
    const incomingCarrier = {
      baggage: 'Synthetics-RunId=invalid',
    };
    const newContext = propagation.extract(context.active(), incomingCarrier);
    tracer.startSpan('request handler', {}, newContext).end();

    spanProcessor.forceFlush().then(() => {
      assert(exporter.getFinishedSpans().length == 1);
      assert.strictEqual(
        exporter.getFinishedSpans()[0].attributes[SYNTHETIC_RUN_ID_FIELD],
        undefined
      );

      done();
    });
  });
});
