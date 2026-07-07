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

import { diag } from '@opentelemetry/api';
import { startProfiling } from './index';
import type { ProfilingOptions } from './types';
import { recordEffectiveState } from '../opamp/effective-state';
import { setSnapshotProfilingActive } from '../tracing/snapshots/Snapshots';
import type { RemoteProfilingConfig } from '../opamp/types';

// Tracks a currently-running always-on profiler so apply() can decide between a
// no-op, a fresh start, or a stop+restart (the native sampling interval and the
// memory-profiler toggle are baked in at start, so changing either requires a
// restart).
interface RunningProfiler {
  stop: () => Promise<void>;
  samplingInterval: number;
  memoryEnabled: boolean;
}

// Applies remote profiling configuration at runtime. Owns the runtime profiler
// handles so the OpAMP client can stay profiling-agnostic, dispatching parsed
// config here via the `applyRemoteConfig` callback.
//
// `apply()` is serialized: each call awaits the previous one so overlapping
// remote-config pushes cannot interleave stop/start of the native profiler.
export class ProfilingController {
  private readonly _baseOptions: ProfilingOptions;
  private _running: RunningProfiler | null = null;
  private _queue: Promise<void> = Promise.resolve();
  // Last applied callgraphs state, so apply() logs only on an actual toggle.
  // Matches the pre-registered snapshot profiler, which starts inactive.
  private _callgraphsActive = false;
  // Last callgraphs sampling interval applied via remote config, so apply()
  // reconfigures/logs only on an actual change. Undefined until a config sets
  // one (the snapshot profiler keeps its startup default in the meantime).
  private _callgraphsSamplingInterval: number | undefined;

  constructor(baseOptions: ProfilingOptions) {
    this._baseOptions = baseOptions;
  }

  // Starts the always-on profiler per the local/default configuration, before
  // any remote config has arrived. The controller then owns this handle, so a
  // later remote-config "off" can stop it. When locally disabled, records the
  // disabled effective state instead.
  startInitial(enabled: boolean): void {
    if (enabled) {
      this._startCpu(
        this._baseOptions.callstackInterval,
        this._baseOptions.memoryProfilingEnabled
      );
    } else {
      recordEffectiveState({
        profilerEnabled: false,
        memoryProfilerEnabled: false,
      });
    }
  }

  applyRemoteConfiguration(config: RemoteProfilingConfig): Promise<void> {
    // Chain onto the previous apply/stop so calls run one at a time and a
    // rejection in one does not break the chain for the next.
    const next = this._queue.then(() => this._apply(config));
    this._queue = next.catch(() => {});
    return next;
  }

  async stopAll(): Promise<void> {
    const next = this._queue.then(() => this._stopCpu());
    this._queue = next.catch(() => {});
    await next;
  }

  private async _apply(config: RemoteProfilingConfig): Promise<void> {
    // Apply cpu/memory and callgraphs independently: callgraphs is a separate
    // feature (a distinct span processor), so a cpu/memory misconfiguration
    // (e.g. memory-without-cpu) must not silently drop a valid callgraphs
    // toggle. Collect failures from both and surface them together so OpAMP
    // reports FAILED with the full picture rather than only the first error.
    const errors: unknown[] = [];

    try {
      await this._applyCpuMemory(config);
    } catch (err) {
      errors.push(err);
    }

    try {
      this._applyCallgraphs(config);
    } catch (err) {
      errors.push(err);
    }

    // The caller (OpAMPClient) only ever reads the thrown error's message, so a
    // single joined Error carries everything it needs regardless of count.
    if (errors.length > 0) {
      throw new Error(
        errors
          .map((e) => (e instanceof Error ? e.message : String(e)))
          .join('; ')
      );
    }
  }

  private async _applyCpuMemory(config: RemoteProfilingConfig): Promise<void> {
    // The always-on profiler is driven by the CPU profiler switch; the memory
    // profiler is collected alongside it. Memory profiling without the CPU
    // profiler is not supported in this version.
    const enabled = config.cpuProfiler.enabled;
    const memoryEnabled = config.memoryProfiler.enabled;

    if (!enabled) {
      // Surface a memory-without-cpu request as a failure rather than silently
      // reporting APPLIED while doing nothing: the memory profiler can only run
      // alongside the CPU profiler in this version.
      if (memoryEnabled) {
        throw new Error(
          'memory_profiler requires cpu_profiler to be enabled; ignoring memory_profiler'
        );
      }
      if (this._running) {
        diag.info('opamp: remote config disabled the CPU profiler');
      }
      await this._stopCpu();
      return;
    }

    // A non-positive sampling interval is invalid; fall back to the configured
    // base interval rather than passing 0/negative to the native profiler.
    const requestedInterval = config.cpuProfiler.samplingInterval;
    const samplingInterval =
      typeof requestedInterval === 'number' && requestedInterval > 0
        ? requestedInterval
        : this._baseOptions.callstackInterval;

    const wasRunning = this._running !== null;
    if (this._running) {
      const unchanged =
        this._running.samplingInterval === samplingInterval &&
        this._running.memoryEnabled === memoryEnabled;
      if (unchanged) {
        return;
      }
      // The native CPU profiler bakes in the sampling interval at start and the
      // memory profiler is started once, so a change means stop + restart.
      await this._stopCpu();
    }

    if (!this._startCpu(samplingInterval, memoryEnabled)) {
      // cpu_profiler was requested but the native profiler did not start (the
      // extension is unavailable). Surface it as a failure rather than a silent
      // APPLIED that produces no profiles — mirroring the callgraphs path.
      throw new Error(
        'cpu_profiler requested but the profiling extension is unavailable'
      );
    }

    diag.info(
      wasRunning
        ? `opamp: remote config reconfigured the CPU profiler (sampling interval ${samplingInterval}ms, memory profiling ${memoryEnabled ? 'on' : 'off'})`
        : `opamp: remote config enabled the CPU profiler (sampling interval ${samplingInterval}ms, memory profiling ${memoryEnabled ? 'on' : 'off'})`
    );
  }

  // Starts the always-on profiler. Returns whether it actually started: false
  // when the native extension is unavailable (startProfiling no-ops), so the
  // caller can report the failure instead of recording a phantom running state.
  private _startCpu(samplingInterval: number, memoryEnabled: boolean): boolean {
    const options: ProfilingOptions = {
      ...this._baseOptions,
      callstackInterval: samplingInterval,
      memoryProfilingEnabled: memoryEnabled,
    };

    // startProfiling records the effective state (profilerEnabled,
    // callStackInterval, memoryProfilerEnabled) itself.
    const { started, stop } = startProfiling(options);
    if (!started) {
      return false;
    }
    this._running = { stop, samplingInterval, memoryEnabled };
    return true;
  }

  private async _stopCpu(): Promise<void> {
    if (!this._running) {
      return;
    }

    const running = this._running;
    this._running = null;

    try {
      await running.stop();
    } catch (err) {
      diag.warn('opamp: error stopping profiler on remote config', err);
    }

    recordEffectiveState({
      profilerEnabled: false,
      memoryProfilerEnabled: false,
    });
  }

  private _applyCallgraphs(config: RemoteProfilingConfig): void {
    const requested = config.callgraphs.enabled;
    // A non-positive interval is invalid; pass undefined so the snapshot
    // profiler keeps its current interval rather than reconfiguring to 0.
    const requestedInterval = config.callgraphs.samplingInterval;
    const samplingInterval =
      typeof requestedInterval === 'number' && requestedInterval > 0
        ? requestedInterval
        : undefined;

    const effective = setSnapshotProfilingActive(requested, samplingInterval);

    // setSnapshotProfilingActive returns the state it could actually reach: it
    // is false when enabling but no snapshot profiler is registered or the
    // native extension is unavailable. Turning callgraphs ON but ending up
    // inactive is a failure to apply — surface it so OpAMP reports FAILED
    // rather than APPLIED-but-doing-nothing (consistent with the cpu path).
    if (requested && !effective) {
      throw new Error(
        'callgraphs requested but snapshot profiling could not be activated'
      );
    }

    const intervalChanged =
      effective &&
      samplingInterval !== undefined &&
      samplingInterval !== this._callgraphsSamplingInterval;
    if (intervalChanged) {
      this._callgraphsSamplingInterval = samplingInterval;
    }

    if (effective !== this._callgraphsActive) {
      this._callgraphsActive = effective;
      diag.info(
        `opamp: remote config ${effective ? 'enabled' : 'disabled'} callgraphs (snapshot profiling)` +
          (effective && samplingInterval !== undefined
            ? ` (sampling interval ${samplingInterval}ms)`
            : '')
      );
    } else if (intervalChanged) {
      diag.info(
        `opamp: remote config reconfigured callgraphs sampling interval to ${samplingInterval}ms`
      );
    }
  }
}
