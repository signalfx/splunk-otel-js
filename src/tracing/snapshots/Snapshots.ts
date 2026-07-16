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
import { Resource } from '@opentelemetry/resources';
import { ensureProfilingContextManager, noopExtension } from '../../profiling';
import { getConfigBoolean, getConfigNumber } from '../../configuration';
import { SnapshotSpanProcessor } from './SnapshotSpanProcessor';
import type { CpuProfile, ProfilingExtension } from '../../profiling/types';
import { OtlpHttpProfilingExporter } from '../../profiling/OtlpHttpProfilingExporter';
import { loadExtension } from '../../profiling';
import { recordEffectiveState } from '../../opamp/effective-state';

export interface StartSnapshotProfilingOptions {
  serviceName: string;
  endpoint: string;
  resource: Resource;
  samplingIntervalMs?: number;
  collectionIntervalMs?: number;
  // Whether the profiler starts active. Defaults to true. The remote-config
  // path pre-registers an inactive profiler so it can be toggled on later
  // (tracer-provider span processors are immutable after construction).
  active?: boolean;
}

type SnapshotProfilingOptions = Required<StartSnapshotProfilingOptions>;

// After the last snapshot has ended, keep the profiler running to avoid cold starts.
const LINGER_PERIOD_MS = 60_000;

// Fixed native profiler name for the snapshot profiler. The native registry is
// keyed by name and append-only, so this must stay stable across an SDK
// stop/start cycle (see getOrCreateCpuProfiler, which reuses it).
const SNAPSHOT_PROFILER_NAME = 'splunk-snapshot-profiler';

function nativeSnapshotOptions(samplingIntervalMs: number) {
  const samplingIntervalMicroseconds = samplingIntervalMs * 1_000;
  return {
    name: SNAPSHOT_PROFILER_NAME,
    samplingIntervalMicroseconds,
    maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
    recordDebugInfo: false,
    onlyFilteredStacktraces: true,
  };
}

export class SnapshotProfiler {
  processor: SnapshotSpanProcessor;
  extension: ProfilingExtension = loadExtension() || noopExtension();
  profilerHandle: number = -1;
  // The number traces currently being profiled.
  activeSnapshots: number = 0;
  // When false the profiler is registered but emits nothing: snapshots are not
  // begun and the collection loop does not run. Toggled at runtime by remote
  // config (the span processor is immutable once the tracer provider is built,
  // so we gate behaviour here instead of registering/unregistering it).
  active: boolean;

  collectionLoop: NodeJS.Timeout;
  stopTimeout: NodeJS.Timeout | undefined;
  exporter: OtlpHttpProfilingExporter | undefined;
  // Current sampling interval (ms). Tracked so a remote-config change can
  // reconfigure the native profiler and the exporter's reported sampling
  // period without recreating the (immutable) span processor.
  private _samplingIntervalMs: number;
  private _endpoint: string;
  private _resource: Resource;

  constructor(options: SnapshotProfilingOptions) {
    ensureProfilingContextManager();

    this.active = options.active;
    this._samplingIntervalMs = options.samplingIntervalMs;
    this._endpoint = options.endpoint;
    this._resource = options.resource;

    this.processor = new SnapshotSpanProcessor({
      traceSnapshotBegin: (traceId) => {
        if (!this.active) {
          return false;
        }
        // A fresh native start (profiler fully stopped: no active snapshots and
        // not in the linger window) begins a new session that adopts the
        // current sampling interval. Sync the exporter's reported period here,
        // so a pending interval change is reflected only once the collected
        // samples actually use it — never on an in-flight/lingering profile.
        if (this.activeSnapshots === 0 && this.stopTimeout === undefined) {
          if (this.exporter) {
            this.exporter._callstackInterval = this._samplingIntervalMs;
          }
        }
        this.extension.addTraceIdFilter(this.profilerHandle, traceId);
        this.extension.startCpuProfiler(this.profilerHandle);
        this.activeSnapshots += 1;
        return true;
      },
      traceSnapshotEnd: (traceId) => {
        this.activeSnapshots = Math.max(this.activeSnapshots - 1, 0);
        this.extension.removeTraceIdFilter(this.profilerHandle, traceId);

        if (this.stopTimeout !== undefined) {
          clearTimeout(this.stopTimeout);
          this.stopTimeout = undefined;
        }

        if (this.activeSnapshots === 0) {
          this.stopTimeout = setTimeout(async () => {
            const profile = this.extension.stop(this.profilerHandle);
            await this._export(profile);
            this.stopTimeout = undefined;
          }, LINGER_PERIOD_MS);
          this.stopTimeout.unref();
        }
      },
    });

    // getOrCreateCpuProfiler (not a strict create) so a second SDK start/stop/
    // start cycle reuses the same-named native profiler the registry still
    // holds instead of allocating a duplicate.
    this.profilerHandle =
      this.extension.getOrCreateCpuProfiler(
        nativeSnapshotOptions(options.samplingIntervalMs)
      ) ?? -1;

    this.collectionLoop = setInterval(async () => {
      if (!this.active) {
        return;
      }
      const profile = this.extension.collect(this.profilerHandle);
      await this._export(profile);
    }, options.collectionIntervalMs);
    this.collectionLoop.unref();

    // Tracing needs to be started after profiling, setting up the profiling exporter
    // causes @grpc/grpc-js to be loaded, but to avoid any loads before tracing's setup
    // has finished, load it next event loop.
    setImmediate(() => {
      this.exporter = new OtlpHttpProfilingExporter({
        endpoint: this._endpoint,
        callstackInterval: this._samplingIntervalMs,
        resource: this._resource,
        instrumentationSource: 'snapshot',
      });
    });
  }

  async _export(profile: CpuProfile | null) {
    if (!profile || !this.exporter) {
      return;
    }

    if (profile.stacktraces.length > 0) {
      await this.exporter.send(profile);
    }
  }

  async stop() {
    // Mark inactive first so any tracer still holding the begin/end closures
    // (e.g. an old provider after a start/stop/start cycle) trips the inactive
    // guard instead of calling the native profiler on a stopped handle.
    this.active = false;
    clearTimeout(this.stopTimeout);
    clearInterval(this.collectionLoop);
    // Remove the native trace-id filters of any in-flight traces. The native
    // profiler is reused across SDK start/stop cycles (getOrCreateCpuProfiler)
    // and native stop() does not clear the filter table, so leaving these
    // behind would leak stale trace ids into the next start (mirrors the
    // setActive(false) path).
    for (const traceId of this.processor.clearActiveSnapshots()) {
      this.extension.removeTraceIdFilter(this.profilerHandle, traceId);
    }

    const profile = this.extension.stop(this.profilerHandle);

    if (profile) {
      await this._export(profile);
    }
  }

  // Turns snapshot collection on or off at runtime without touching the
  // (immutable) span processor registration. Turning off stops the native
  // profiler and drains any pending samples; turning on lets the next sampled
  // trace begin a snapshot again.
  setActive(active: boolean) {
    if (this.active === active) {
      return;
    }

    this.active = active;

    if (!active) {
      if (this.stopTimeout !== undefined) {
        clearTimeout(this.stopTimeout);
        this.stopTimeout = undefined;
      }
      this.activeSnapshots = 0;
      // Drop in-flight span->trace mappings so spans that began while active do
      // not later fire an unbalanced traceSnapshotEnd against the now-stopped
      // profiler (which would drive activeSnapshots negative / re-arm the loop).
      // Remove their native trace-id filters too: the handle is reused on the
      // next setActive(true), and the native stop() does not clear the filter
      // table, so without this each off/on cycle would leak the in-flight
      // entries (their traceSnapshotEnd -> removeTraceIdFilter never runs).
      for (const traceId of this.processor.clearActiveSnapshots()) {
        this.extension.removeTraceIdFilter(this.profilerHandle, traceId);
      }
      // Export the final in-flight profile rather than dropping it (mirrors
      // stop()); fire-and-forget since setActive is synchronous.
      const profile = this.extension.stop(this.profilerHandle);
      void this._export(profile);
    }
  }

  // Reconfigures the sampling interval at runtime (remote config) without
  // recreating the immutable span processor. getOrCreateCpuProfiler re-applies
  // the interval to the same-named native profiler; v8 bakes the interval in at
  // start, so the change takes effect on the next snapshot the profiler begins
  // (the native profiler is stopped between snapshots).
  //
  // The exporter's reported sampling period is deliberately NOT updated here: a
  // snapshot may be mid-collection or in its linger window, still sampling at
  // the old interval. Updating now would serialize old-interval samples with
  // the new period. traceSnapshotBegin syncs the exporter on the next fresh
  // native start instead, when the collected samples actually use the new rate.
  setSamplingInterval(samplingIntervalMs: number) {
    if (this._samplingIntervalMs === samplingIntervalMs) {
      return;
    }

    this._samplingIntervalMs = samplingIntervalMs;
    this.extension.getOrCreateCpuProfiler(
      nativeSnapshotOptions(samplingIntervalMs)
    );
  }
}

let profiler: SnapshotProfiler | undefined;

export function startSnapshotProfiling(options: StartSnapshotProfilingOptions) {
  const samplingIntervalMs =
    options.samplingIntervalMs ??
    getConfigNumber(
      [
        'SPLUNK_SNAPSHOT_SAMPLING_INTERVAL',
        'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL',
      ],
      1
    );
  const collectionIntervalMs =
    options.collectionIntervalMs ??
    getConfigNumber('SPLUNK_CPU_PROFILER_COLLECTION_INTERVAL', 30_000);

  const active = options.active ?? true;

  profiler = new SnapshotProfiler({
    serviceName: options.serviceName,
    endpoint: options.endpoint,
    resource: options.resource,
    samplingIntervalMs,
    collectionIntervalMs,
    active,
  });

  // The snapshot profiler can only actually run when the native profiler handle
  // is valid; a no-op extension (or a failed getOrCreateCpuProfiler) leaves it at -1,
  // in which case nothing is collected. An inactive pre-registered profiler is
  // reported as disabled until toggled on.
  recordEffectiveState({
    snapshotProfilerEnabled: active && profiler.profilerHandle >= 0,
    snapshotSamplingInterval: samplingIntervalMs,
  });
}

// Toggles the pre-registered snapshot profiler at runtime (remote config), and
// optionally reconfigures its sampling interval. Returns whether the profiler
// is actually active afterwards: false when no profiler was registered or the
// native extension is unavailable.
export function setSnapshotProfilingActive(
  active: boolean,
  samplingIntervalMs?: number
): boolean {
  if (!profiler) {
    return false;
  }

  // Apply an interval change before toggling active: the native interval is
  // baked in at the next start, so reconfiguring while the profiler is (about
  // to be) stopped ensures the next snapshot uses it.
  if (typeof samplingIntervalMs === 'number' && samplingIntervalMs > 0) {
    profiler.setSamplingInterval(samplingIntervalMs);
    recordEffectiveState({ snapshotSamplingInterval: samplingIntervalMs });
  }

  // Resolve the reachable state before toggling: activating without a valid
  // native profiler handle would leave profiler.active=true (so the propagator
  // injects snapshot-volume baggage downstream) while this agent can collect
  // nothing. Gate setActive on the effective state instead.
  const effective = active && profiler.profilerHandle >= 0;
  profiler.setActive(effective);

  recordEffectiveState({ snapshotProfilerEnabled: effective });
  return effective;
}

export async function stopSnapshotProfiling() {
  if (!profiler) {
    return;
  }

  const current = profiler;
  // Drop the singleton before awaiting so a concurrent start() does not adopt a
  // half-stopped profiler, and a subsequent start() registers a fresh one.
  profiler = undefined;
  await current.stop();
}

export function isSnapshotProfilingEnabled() {
  return getConfigBoolean('SPLUNK_SNAPSHOT_PROFILER_ENABLED', false);
}

// Whether the registered snapshot profiler is currently collecting. The
// SnapshotPropagator consults this so a profiler that is registered but dormant
// (pre-registered inactive for remote config, callgraphs not yet enabled) does
// not write/propagate snapshot-volume baggage and thereby dictate distributed
// snapshot selection for downstream services that are active.
export function isSnapshotProfilingActive(): boolean {
  return profiler?.active ?? false;
}

export function snapshotSpanProcessor(): SnapshotSpanProcessor | undefined {
  return profiler?.processor;
}

export function snapshotProfiler(): SnapshotProfiler | undefined {
  return profiler;
}
