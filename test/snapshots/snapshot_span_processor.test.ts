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
  propagation,
  trace,
  ROOT_CONTEXT,
  TraceFlags,
} from '@opentelemetry/api';
import {
  NodeTracerProvider,
  Span as SdkSpan,
} from '@opentelemetry/sdk-trace-node';
import { strict as assert } from 'assert';
import { beforeEach, describe, it, mock, Mock } from 'node:test';
import { VOLUME_BAGGAGE_KEY } from '../../src/tracing/snapshots/SnapshotPropagator';
import {
  SnapshotSpanProcessor,
  SnapshotSpanProcessorOptions,
} from '../../src/tracing/snapshots/SnapshotSpanProcessor';

const provider = new NodeTracerProvider();
trace.setGlobalTracerProvider(provider);
const tracer = trace.getTracer('test');

const TRACE_ID = 'aaaabbbbccccddddeeeeffff11112222';
const SPAN_ID = 'aaaabbbbccccdddd';

describe('snapshot span processor', () => {
  let opts: SnapshotSpanProcessorOptions;
  let processor: SnapshotSpanProcessor;
  let beginSnapshot: Mock<typeof opts.traceSnapshotBegin>;
  let endSnapshot: Mock<typeof opts.traceSnapshotEnd>;

  beforeEach(() => {
    opts = {
      traceSnapshotBegin(_traceId) {},
      traceSnapshotEnd(_traceId) {},
    };

    beginSnapshot = mock.method(opts, 'traceSnapshotBegin');
    endSnapshot = mock.method(opts, 'traceSnapshotEnd');

    processor = new SnapshotSpanProcessor(opts);
  });

  it('will start a snapshot if the span has a parent and parent is remote', () => {
    const baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: { value: 'highest' },
    });
    const parentCtx = propagation.setBaggage(
      trace.setSpanContext(ROOT_CONTEXT, {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      }),
      baggage
    );

    const span = tracer.startSpan('child', undefined, parentCtx) as SdkSpan;

    processor.onStart(span, parentCtx);

    assert.strictEqual(span.attributes['splunk.snapshot.profiling'], true);

    processor.onEnd(span);

    assert.strictEqual(beginSnapshot.mock.callCount(), 1);
    assert.strictEqual(beginSnapshot.mock.calls[0].arguments[0], TRACE_ID);
    assert.strictEqual(endSnapshot.mock.callCount(), 1);
    assert.strictEqual(endSnapshot.mock.calls[0].arguments[0], TRACE_ID);
  });

  it('will start a snapshot if the span is a root span', () => {
    const span = tracer.startSpan('root') as SdkSpan;

    const baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: { value: 'highest' },
    });
    const parentCtx = propagation.setBaggage(ROOT_CONTEXT, baggage);

    processor.onStart(span, parentCtx);

    assert.strictEqual(span.attributes['splunk.snapshot.profiling'], true);

    processor.onEnd(span);

    assert.strictEqual(beginSnapshot.mock.callCount(), 1);
    assert.strictEqual(
      beginSnapshot.mock.calls[0].arguments[0],
      span.spanContext().traceId
    );
    assert.strictEqual(endSnapshot.mock.callCount(), 1);
    assert.strictEqual(
      endSnapshot.mock.calls[0].arguments[0],
      span.spanContext().traceId
    );
  });

  it('will not start a snapshot if the span parent is not remote', () => {
    const parentSpan = tracer.startSpan('parent');
    const span = tracer.startSpan('child') as SdkSpan;

    const baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: { value: 'highest' },
    });
    const parentCtx = propagation.setBaggage(
      trace.setSpan(ROOT_CONTEXT, parentSpan),
      baggage
    );

    processor.onStart(span, parentCtx);
    processor.onEnd(span);

    assert.strictEqual(beginSnapshot.mock.callCount(), 0);
    assert.strictEqual(endSnapshot.mock.callCount(), 0);
  });

  it('will not start a snapshot if the baggage has volume off', () => {
    const baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: { value: 'off' },
    });
    const parentCtx = propagation.setBaggage(
      trace.setSpanContext(ROOT_CONTEXT, {
        traceId: TRACE_ID,
        spanId: SPAN_ID,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      }),
      baggage
    );

    const span = tracer.startSpan('child', undefined, parentCtx) as SdkSpan;

    processor.onStart(span, parentCtx);
    processor.onEnd(span);

    assert.strictEqual(beginSnapshot.mock.callCount(), 0);
    assert.strictEqual(endSnapshot.mock.callCount(), 0);
  });

  it('will not start a snapshot if there is no baggage', () => {
    const parentCtx = trace.setSpanContext(ROOT_CONTEXT, {
      traceId: TRACE_ID,
      spanId: SPAN_ID,
      isRemote: true,
      traceFlags: TraceFlags.SAMPLED,
    });

    const span = tracer.startSpan('child', undefined, parentCtx) as SdkSpan;

    processor.onStart(span, parentCtx);
    processor.onEnd(span);

    assert.strictEqual(beginSnapshot.mock.callCount(), 0);
    assert.strictEqual(endSnapshot.mock.callCount(), 0);
  });
});
