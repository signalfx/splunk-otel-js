/*
 * Copyright 2021 Splunk Inc.
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

describe('propagation', () => {
  it('must be set to b3', done => {
    startTracing();

    const propagator = otel.propagation._getGlobalPropagator();
    assert(
      propagator instanceof B3Propagator,
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
      assert.equal(carrier['x-b3-traceid'], span.context().traceId);
      assert.equal(carrier['x-b3-spanid'], span.context().spanId);
      assert.equal(carrier['x-b3-sampled'], 1);
      done();
    });
  });
});
