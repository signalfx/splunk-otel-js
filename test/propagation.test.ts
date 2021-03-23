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

import * as otel from '@opentelemetry/api';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { startTracing } from '../src/tracing';
import { CompositePropagator } from '@opentelemetry/core';

describe('propagation', () => {
  it('must be set to b3', done => {
    startTracing();

    const propagator = otel.propagation._getGlobalPropagator();
    assert(
      propagator instanceof CompositePropagator,
      'propagator must be instance of B3Propagator'
    );

    const tracer = otel.trace.getTracer('test-tracer');
    const span = tracer.startSpan('main');
    otel.context.with(otel.setSpan(otel.context.active(), span), () => {
      const carrier = {};
      otel.propagation.inject(
        otel.context.active(),
        carrier,
        otel.defaultTextMapSetter
      );
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
});
