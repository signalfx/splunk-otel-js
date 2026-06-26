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
  propagation,
  trace,
  ROOT_CONTEXT,
  TraceFlags,
} from '@opentelemetry/api';
import { Span as SdkSpan } from '@opentelemetry/sdk-trace-node';
import { strict as assert } from 'assert';
import {
  after,
  afterEach,
  before,
  beforeEach,
  describe,
  it,
  mock,
} from 'node:test';
import { VOLUME_BAGGAGE_KEY } from '../../src/tracing/snapshots/SnapshotPropagator';
import { start } from '../../src';
import { cleanEnvironment, spinMs } from '../utils';
import {
  SnapshotProfiler,
  snapshotProfiler,
} from '../../src/tracing/snapshots/Snapshots';
import * as profilingIndex from '../../src/profiling';
import { noopExtension } from '../../src/profiling';
import type { ProfilingExtension } from '../../src/profiling/types';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { CpuProfile } from '../../src/profiling/types';
import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';
import { emptyResource } from '@opentelemetry/resources';

const NODE_MAJOR_VERSION = process.versions.node.split('.').map(Number)[0];

const TRACE_ID = 'aaaabbbbccccddddeeeeffff11112222';
const SPAN_ID = 'aaaabbbbccccdddd';

// Skipped on Node <20 due to the mock.timers API not yet working.
describe('snapshot profiling', { skip: NODE_MAJOR_VERSION < 20 }, () => {
  before(() => {
    mock.timers.enable({ apis: ['setInterval'] });
  });

  after(() => {
    mock.timers.reset();
  });

  beforeEach(() => {
    cleanEnvironment();
  });

  it('is possible to collect snapshot cpu profiles', async (t) => {
    process.env.SPLUNK_SNAPSHOT_PROFILER_ENABLED = 'true';

    start({
      serviceName: 'snapshot-test',
    });

    const profiler = snapshotProfiler();
    assert.ok(profiler);

    // Wait for the exporter to be set up at next event loop.
    await new Promise<void>((resolve) => setImmediate(resolve));

    const exporter = profiler.exporter!;

    let sendResolve: (value: CpuProfile) => void;

    const sendPromise = new Promise<CpuProfile>((resolve) => {
      sendResolve = resolve;
    });

    t.mock.method(exporter, 'send', async (cpuProfile: CpuProfile) => {
      sendResolve(cpuProfile);
    });

    assert.deepStrictEqual(exporter._instrumentationSource, 'snapshot');
    const resource = exporter._resource;

    assert.strictEqual(resource.attributes[ATTR_SERVICE_NAME], 'snapshot-test');

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

    const tracer = trace.getTracer('test');

    const span = tracer.startSpan('child', undefined, parentCtx) as SdkSpan;
    assert.strictEqual(span.attributes['splunk.snapshot.profiling'], true);

    context.with(trace.setSpan(ROOT_CONTEXT, span), () => {
      spinMs(100);
    });

    span.end();

    const idGenerator = new RandomIdGenerator();
    const span2 = tracer.startSpan(
      's2',
      undefined,
      propagation.setBaggage(
        trace.setSpanContext(ROOT_CONTEXT, {
          traceId: idGenerator.generateTraceId(),
          spanId: idGenerator.generateSpanId(),
          traceFlags: TraceFlags.SAMPLED,
        }),
        propagation.createBaggage({
          [VOLUME_BAGGAGE_KEY]: { value: 'off' },
        })
      )
    );

    context.with(trace.setSpan(ROOT_CONTEXT, span2), () => {
      spinMs(100);
    });

    span2.end();

    mock.timers.tick(31_000);

    const profile = await sendPromise;

    const matchingTraceIdBuffer = Buffer.from(TRACE_ID, 'hex');
    assert.ok(
      profile.stacktraces.every((st) =>
        st.traceId.equals(matchingTraceIdBuffer)
      )
    );

    await profiler.stop();
  });
});

describe('snapshot profiler setActive', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  function highestVolumeContext(traceId: string, spanId: string) {
    return propagation.setBaggage(
      trace.setSpanContext(ROOT_CONTEXT, {
        traceId,
        spanId,
        isRemote: true,
        traceFlags: TraceFlags.SAMPLED,
      }),
      propagation.createBaggage({
        [VOLUME_BAGGAGE_KEY]: { value: 'highest' },
      })
    );
  }

  it('removes the native trace-id filters for in-flight traces when turned off', () => {
    // Turning callgraphs off mid-trace must drop the native trace-id filters of
    // any in-flight traces. The handle is reused on the next setActive(true) and
    // the native stop() does not clear the filter table, so leaving them behind
    // would leak filter entries across off/on cycles.
    const removed: string[] = [];
    const extension: ProfilingExtension = {
      ...noopExtension(),
      // Hand out a valid handle so begin records snapshots against it.
      createCpuProfiler: () => 1,
      removeTraceIdFilter: (_handle: number, traceId: string) => {
        removed.push(traceId);
      },
    };
    // The constructor loads the extension itself; supply the spy so it owns a
    // valid handle (the real native extension allows only one CPU profiler).
    mock.method(profilingIndex, 'loadExtension', () => extension);

    const profiler = new SnapshotProfiler({
      serviceName: 'test',
      endpoint: 'http://localhost:4318',
      resource: emptyResource(),
      samplingIntervalMs: 1,
      collectionIntervalMs: 30_000,
      active: true,
    });

    const tracer = trace.getTracer('test');
    const traceA = 'aaaabbbbccccddddeeeeffff11112222';
    const traceB = 'bbbbccccddddeeeeffff111122223333';
    for (const [traceId, spanId] of [
      [traceA, 'aaaabbbbcccc0001'],
      [traceA, 'aaaabbbbcccc0002'],
      [traceB, 'aaaabbbbcccc0003'],
    ] as const) {
      const ctx = highestVolumeContext(traceId, spanId);
      const span = tracer.startSpan('child', undefined, ctx) as SdkSpan;
      profiler.processor.onStart(span, ctx);
    }

    profiler.setActive(false);

    // Each in-flight trace id is unfiltered exactly once (deduped across spans).
    assert.deepStrictEqual(removed.sort(), [traceB, traceA].sort());
    assert.strictEqual(profiler.activeSnapshots, 0);
  });
});
