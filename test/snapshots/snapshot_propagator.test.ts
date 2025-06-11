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

import { propagation, trace, ROOT_CONTEXT } from '@opentelemetry/api';
import { SamplingDecision } from '@opentelemetry/sdk-trace-node';
import { strict as assert } from 'assert';
import { describe, it, mock } from 'node:test';
import {
  VOLUME_BAGGAGE_KEY,
  SnapshotPropagator,
} from '../../src/tracing/snapshots/SnapshotPropagator';

const NoopGetter = {
  keys: (_carrier: unknown) => [],
  get: (_carrier: unknown, _key: string) => undefined,
};

describe('snapshot propagator', () => {
  it('returns the existing baggage if snapshot volume is "highest"', () => {
    const baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: { value: 'highest' },
    });

    const propagator = new SnapshotPropagator(0.0);

    const ctx = propagation.setBaggage(ROOT_CONTEXT, baggage);
    const extractedCtx = propagator.extract(ctx, undefined, NoopGetter);
    const propagatedBaggage = propagation.getBaggage(extractedCtx);

    assert.strictEqual(
      propagatedBaggage?.getEntry(VOLUME_BAGGAGE_KEY)?.value,
      'highest'
    );
  });

  it('returns the existing baggage if snapshot volume is "off"', () => {
    const baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: { value: 'off' },
    });

    const propagator = new SnapshotPropagator(0.0);

    const ctx = propagation.setBaggage(ROOT_CONTEXT, baggage);
    const extractedCtx = propagator.extract(ctx, undefined, NoopGetter);
    const propagatedBaggage = propagation.getBaggage(extractedCtx);

    assert.strictEqual(
      propagatedBaggage?.getEntry(VOLUME_BAGGAGE_KEY)?.value,
      'off'
    );
  });

  it('returns baggage with "highest" volume if context is sampled and no span is active', () => {
    const propagator = new SnapshotPropagator(1.0);
    const extractedCtx = propagator.extract(
      ROOT_CONTEXT,
      undefined,
      NoopGetter
    );
    const propagatedBaggage = propagation.getBaggage(extractedCtx);
    assert.strictEqual(
      propagatedBaggage?.getEntry(VOLUME_BAGGAGE_KEY)?.value,
      'highest'
    );
  });

  it('returns baggage with "off" volume if context is not sampled and no span is not active', () => {
    const propagator = new SnapshotPropagator(0.0);
    const extractedCtx = propagator.extract(
      ROOT_CONTEXT,
      undefined,
      NoopGetter
    );
    const propagatedBaggage = propagation.getBaggage(extractedCtx);
    assert.strictEqual(
      propagatedBaggage?.getEntry(VOLUME_BAGGAGE_KEY)?.value,
      'off'
    );
  });

  it('returns baggage with "highest" volume if a span is active and sampled based on traceId', () => {
    const propagator = new SnapshotPropagator(0.0);

    mock.method(propagator.sampler, 'shouldSample', () => {
      return { decision: SamplingDecision.RECORD_AND_SAMPLED };
    });

    const tracer = trace.getTracer('test-tracer');
    const span = tracer.startSpan('test');

    const extractedCtx = propagator.extract(
      trace.setSpan(ROOT_CONTEXT, span),
      undefined,
      NoopGetter
    );
    const propagatedBaggage = propagation.getBaggage(extractedCtx);

    assert.strictEqual(
      propagatedBaggage?.getEntry(VOLUME_BAGGAGE_KEY)?.value,
      'highest'
    );
  });

  it('returns baggage with "off" volume if a span is active and trace is not sampled', () => {
    const propagator = new SnapshotPropagator(0.0);

    mock.method(propagator.sampler, 'shouldSample', () => {
      return { decision: SamplingDecision.NOT_RECORD };
    });

    const tracer = trace.getTracer('test-tracer');
    const span = tracer.startSpan('test');

    const extractedCtx = propagator.extract(
      trace.setSpan(ROOT_CONTEXT, span),
      undefined,
      NoopGetter
    );
    const propagatedBaggage = propagation.getBaggage(extractedCtx);

    assert.strictEqual(
      propagatedBaggage?.getEntry(VOLUME_BAGGAGE_KEY)?.value,
      'off'
    );
  });
});
