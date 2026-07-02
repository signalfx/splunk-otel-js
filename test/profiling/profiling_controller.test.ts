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

import { strict as assert } from 'assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import { diag } from '@opentelemetry/api';
import { resourceFromAttributes } from '@opentelemetry/resources';

import * as profilingIndex from '../../src/profiling';
import * as snapshots from '../../src/tracing/snapshots/Snapshots';
import { ProfilingController } from '../../src/profiling/ProfilingController';
import type { ProfilingOptions } from '../../src/profiling/types';
import { defaultExporterFactory } from '../../src/profiling';
import {
  getEffectiveState,
  resetEffectiveState,
} from '../../src/opamp/effective-state';
import type { RemoteProfilingConfig } from '../../src/opamp/types';

const BASE_OPTIONS: ProfilingOptions = {
  endpoint: 'http://localhost:4318',
  serviceName: 'test-service',
  callstackInterval: 1_000,
  collectionDuration: 30_000,
  resource: resourceFromAttributes({}),
  exporterFactory: defaultExporterFactory,
  memoryProfilingEnabled: false,
};

// Records each startProfiling call so tests can assert how the controller
// reconfigured the native profiler, without touching the real extension.
interface StartCall {
  callstackInterval: number;
  memoryProfilingEnabled: boolean;
  stop: ReturnType<typeof mock.fn>;
}

function remoteConfig(
  overrides: Partial<{
    cpu: boolean;
    samplingInterval?: number;
    memory: boolean;
    callgraphs: boolean;
    callgraphsInterval?: number;
  }> = {}
): RemoteProfilingConfig {
  return {
    cpuProfiler: {
      enabled: overrides.cpu ?? false,
      samplingInterval: overrides.samplingInterval,
    },
    memoryProfiler: { enabled: overrides.memory ?? false },
    callgraphs: {
      enabled: overrides.callgraphs ?? false,
      samplingInterval: overrides.callgraphsInterval,
    },
  };
}

// Records each setSnapshotProfilingActive call so tests can assert both the
// active toggle and any sampling interval the controller forwarded.
interface ActiveCall {
  active: boolean;
  samplingIntervalMs: number | undefined;
}

describe('ProfilingController', () => {
  let startCalls: StartCall[];
  let activeCalls: ActiveCall[];

  beforeEach(() => {
    resetEffectiveState();
    startCalls = [];
    activeCalls = [];

    mock.method(
      profilingIndex,
      'startProfiling',
      (options: ProfilingOptions) => {
        const stop = mock.fn(async () => {});
        startCalls.push({
          callstackInterval: options.callstackInterval,
          memoryProfilingEnabled: options.memoryProfilingEnabled,
          stop,
        });
        return { started: true, stop };
      }
    );

    mock.method(
      snapshots,
      'setSnapshotProfilingActive',
      (active: boolean, samplingIntervalMs?: number) => {
        activeCalls.push({ active, samplingIntervalMs });
        return active;
      }
    );
  });

  afterEach(() => {
    mock.restoreAll();
  });

  describe('startInitial', () => {
    it('starts the profiler with base options when enabled', () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);

      assert.strictEqual(startCalls.length, 1);
      assert.strictEqual(startCalls[0].callstackInterval, 1_000);
      assert.strictEqual(startCalls[0].memoryProfilingEnabled, false);
    });

    it('does not start the profiler when disabled, and records it off', () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      assert.strictEqual(startCalls.length, 0);
      assert.strictEqual(getEffectiveState().profilerEnabled, false);
      assert.strictEqual(getEffectiveState().memoryProfilerEnabled, false);
    });
  });

  describe('cpu profiler', () => {
    it('starts the profiler on an off->on transition', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 250 })
      );

      assert.strictEqual(startCalls.length, 1);
      assert.strictEqual(startCalls[0].callstackInterval, 250);
    });

    it('falls back to the base interval when none is supplied', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(remoteConfig({ cpu: true }));

      assert.strictEqual(startCalls[0].callstackInterval, 1_000);
    });

    it('falls back to the base interval for a non-positive sampling interval', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      // 0 and negatives are invalid; never forward them to the native profiler.
      await controller.apply(remoteConfig({ cpu: true, samplingInterval: 0 }));
      await controller.apply(remoteConfig({ cpu: true, samplingInterval: -5 }));

      for (const call of startCalls) {
        assert.strictEqual(call.callstackInterval, 1_000);
      }
    });

    it('stops the profiler on an on->off transition', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      const initial = startCalls[0];

      await controller.apply(remoteConfig({ cpu: false }));

      assert.strictEqual(initial.stop.mock.callCount(), 1);
      assert.strictEqual(getEffectiveState().profilerEnabled, false);
    });

    it('is a no-op when nothing changed', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);

      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 1_000 })
      );

      // Only the initial start; no stop, no restart.
      assert.strictEqual(startCalls.length, 1);
      assert.strictEqual(startCalls[0].stop.mock.callCount(), 0);
    });

    it('restarts the profiler when the sampling interval changes', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      const initial = startCalls[0];

      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 500 })
      );

      assert.strictEqual(
        initial.stop.mock.callCount(),
        1,
        'should stop the old'
      );
      assert.strictEqual(startCalls.length, 2, 'should start a new one');
      assert.strictEqual(startCalls[1].callstackInterval, 500);
    });

    it('restarts the profiler when memory profiling is toggled', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      const initial = startCalls[0];

      await controller.apply(remoteConfig({ cpu: true, memory: true }));

      assert.strictEqual(initial.stop.mock.callCount(), 1);
      assert.strictEqual(startCalls.length, 2);
      assert.strictEqual(startCalls[1].memoryProfilingEnabled, true);
    });

    it('fails when cpu is requested but the extension is unavailable', async () => {
      // startProfiling returns started:false when the native extension cannot
      // load. Enabling cpu_profiler but not actually starting must surface as a
      // rejection so OpAMP reports FAILED rather than a silent APPLIED that
      // produces no profiles (parity with the callgraphs path).
      mock.method(profilingIndex, 'startProfiling', () => ({
        started: false,
        stop: mock.fn(async () => {}),
      }));

      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await assert.rejects(
        () => controller.apply(remoteConfig({ cpu: true })),
        /profiling extension is unavailable/
      );
    });

    it('rejects memory profiling without the cpu profiler', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      // memory_profiler can only run alongside the cpu_profiler; surfacing this
      // as a rejection lets the OpAMP layer report FAILED rather than a silent
      // APPLIED that does nothing.
      await assert.rejects(
        () => controller.apply(remoteConfig({ cpu: false, memory: true })),
        /memory_profiler requires cpu_profiler/
      );
      assert.strictEqual(startCalls.length, 0);
    });
  });

  describe('callgraphs', () => {
    it('toggles snapshot profiling active state per config', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(remoteConfig({ callgraphs: true }));
      await controller.apply(remoteConfig({ callgraphs: false }));

      assert.deepStrictEqual(
        activeCalls.map((c) => c.active),
        [true, false]
      );
    });

    it('fails when callgraphs is requested but cannot be activated', async () => {
      // setSnapshotProfilingActive returns false when no profiler is registered
      // or the native extension is missing; enabling callgraphs but ending up
      // inactive must surface as a rejection so OpAMP reports FAILED.
      mock.method(
        snapshots,
        'setSnapshotProfilingActive',
        (active: boolean, samplingIntervalMs?: number) => {
          activeCalls.push({ active, samplingIntervalMs });
          return false;
        }
      );

      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await assert.rejects(
        () => controller.apply(remoteConfig({ callgraphs: true })),
        /could not be activated/
      );
    });

    it('still applies callgraphs when cpu/memory config fails', async () => {
      // A memory-without-cpu misconfiguration must not drop a valid callgraphs
      // toggle: both features are applied independently, and the apply still
      // rejects so the failure is reported.
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await assert.rejects(
        () =>
          controller.apply(
            remoteConfig({ cpu: false, memory: true, callgraphs: true })
          ),
        /memory_profiler requires cpu_profiler/
      );

      // callgraphs was still activated despite the cpu/memory failure.
      assert.deepStrictEqual(
        activeCalls.map((c) => c.active),
        [true]
      );
    });

    it('forwards the sampling interval when enabling callgraphs', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(
        remoteConfig({ callgraphs: true, callgraphsInterval: 5 })
      );

      assert.deepStrictEqual(activeCalls, [
        { active: true, samplingIntervalMs: 5 },
      ]);
    });

    it('reconfigures the sampling interval while callgraphs stays on', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(
        remoteConfig({ callgraphs: true, callgraphsInterval: 5 })
      );
      await controller.apply(
        remoteConfig({ callgraphs: true, callgraphsInterval: 10 })
      );

      assert.deepStrictEqual(activeCalls, [
        { active: true, samplingIntervalMs: 5 },
        { active: true, samplingIntervalMs: 10 },
      ]);
    });

    it('does not forward a non-positive sampling interval', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      // 0 and negatives are invalid; the snapshot profiler must keep its
      // current interval rather than being reconfigured to 0.
      await controller.apply(
        remoteConfig({ callgraphs: true, callgraphsInterval: 0 })
      );

      assert.deepStrictEqual(activeCalls, [
        { active: true, samplingIntervalMs: undefined },
      ]);
    });
  });

  describe('serialization', () => {
    it('applies overlapping configs one at a time, in order', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      // Fire two applies without awaiting the first; the controller must run
      // them sequentially so the native start/stop never interleave.
      const first = controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 100 })
      );
      const second = controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 200 })
      );
      await Promise.all([first, second]);

      assert.strictEqual(startCalls.length, 2);
      assert.strictEqual(startCalls[0].callstackInterval, 100);
      assert.strictEqual(startCalls[1].callstackInterval, 200);
    });

    it('continues applying after a stop error', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      // Make the running profiler's stop reject.
      startCalls[0].stop.mock.mockImplementation(async () => {
        throw new Error('stop failed');
      });

      // Interval change forces stop+start; the stop rejects but the controller
      // swallows it and proceeds with the restart.
      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 500 })
      );

      assert.strictEqual(startCalls.length, 2);
      assert.strictEqual(startCalls[1].callstackInterval, 500);
    });
  });

  describe('stopAll', () => {
    it('stops a running profiler', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      const initial = startCalls[0];

      await controller.stopAll();

      assert.strictEqual(initial.stop.mock.callCount(), 1);
      assert.strictEqual(getEffectiveState().profilerEnabled, false);
    });

    it('is a no-op when nothing is running', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.stopAll();

      assert.strictEqual(startCalls.length, 0);
    });
  });

  describe('logging', () => {
    let infoLogs: string[];

    beforeEach(() => {
      infoLogs = [];
      mock.method(diag, 'info', (message: string) => {
        infoLogs.push(message);
      });
    });

    it('logs cpu enable, reconfigure, and disable transitions', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 250 })
      );
      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 500 })
      );
      await controller.apply(remoteConfig({ cpu: false }));

      assert.deepStrictEqual(infoLogs, [
        'opamp: remote config enabled the CPU profiler (sampling interval 250ms, memory profiling off)',
        'opamp: remote config reconfigured the CPU profiler (sampling interval 500ms, memory profiling off)',
        'opamp: remote config disabled the CPU profiler',
      ]);
    });

    it('logs callgraphs enable and disable transitions', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(false);

      await controller.apply(remoteConfig({ callgraphs: true }));
      await controller.apply(remoteConfig({ callgraphs: false }));

      assert.deepStrictEqual(infoLogs, [
        'opamp: remote config enabled callgraphs (snapshot profiling)',
        'opamp: remote config disabled callgraphs (snapshot profiling)',
      ]);
    });

    it('does not log when an apply changes nothing', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      infoLogs = [];

      // Same interval/memory as the initial start, callgraphs already off: a
      // pure no-op apply must stay silent.
      await controller.apply(
        remoteConfig({ cpu: true, samplingInterval: 1_000 })
      );

      assert.deepStrictEqual(infoLogs, []);
    });

    it('does not log a cpu transition on shutdown via stopAll', async () => {
      const controller = new ProfilingController(BASE_OPTIONS);
      controller.startInitial(true);
      infoLogs = [];

      await controller.stopAll();

      // stopAll is process teardown, not a remote-config change; it must not
      // emit a "remote config disabled" line.
      assert.deepStrictEqual(infoLogs, []);
    });
  });
});
