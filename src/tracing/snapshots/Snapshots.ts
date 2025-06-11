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
import { getEnvBoolean, getEnvNumber } from '../../utils';
import { SnapshotSpanProcessor } from './SnapshotSpanProcessor';
import type { CpuProfile, ProfilingExtension } from '../../profiling/types';
import { OtlpHttpProfilingExporter } from '../../profiling/OtlpHttpProfilingExporter';
import { loadExtension } from '../../profiling';

export interface StartSnapshotProfilingOptions {
  serviceName: string;
  endpoint: string;
  resource: Resource;
  samplingIntervalMs?: number;
  collectionIntervalMs?: number;
}

type SnapshotProfilingOptions = Required<StartSnapshotProfilingOptions>;

// After the last snapshot has ended, keep the profiler running to avoid cold starts.
const LINGER_PERIOD_MS = 60_000;

export class SnapshotProfiler {
  processor: SnapshotSpanProcessor;
  extension: ProfilingExtension = loadExtension() || noopExtension();
  profilerHandle: number = -1;
  // The number traces currently being profiled.
  activeSnapshots: number = 0;

  collectionLoop: NodeJS.Timeout;
  stopTimeout: NodeJS.Timeout | undefined;
  exporter: OtlpHttpProfilingExporter | undefined;
  exportLoop: NodeJS.Timeout | undefined;

  constructor(options: SnapshotProfilingOptions) {
    ensureProfilingContextManager();

    this.processor = new SnapshotSpanProcessor({
      traceSnapshotBegin: (traceId) => {
        this.extension.addTraceIdFilter(this.profilerHandle, traceId);
        this.extension.startCpuProfiler(this.profilerHandle);
        this.activeSnapshots += 1;
      },
      traceSnapshotEnd: (traceId) => {
        this.activeSnapshots = Math.max(this.activeSnapshots - 1, 0);
        this.extension.removeTraceIdFilter(this.profilerHandle, traceId);

        if (this.activeSnapshots === 0) {
          if (this.stopTimeout !== undefined) {
            clearTimeout(this.stopTimeout);
            this.stopTimeout = undefined;
          }

          this.stopTimeout = setTimeout(async () => {
            const profile = this.extension.stop(this.profilerHandle);
            await this._export(profile);
            this.stopTimeout = undefined;
          }, LINGER_PERIOD_MS);
          this.stopTimeout.unref();
        }
      },
    });

    const samplingIntervalMicroseconds = options.samplingIntervalMs * 1_000;

    this.profilerHandle =
      this.extension.createCpuProfiler({
        name: 'splunk-snapshot-profiler',
        samplingIntervalMicroseconds,
        maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
        recordDebugInfo: false,
        omitStacktracesWithoutContext: true,
      }) ?? -1;

    this.collectionLoop = setInterval(async () => {
      const profile = this.extension.collect(this.profilerHandle);
      await this._export(profile);
    }, options.collectionIntervalMs);
    this.collectionLoop.unref();

    setImmediate(() => {
      this.exporter = new OtlpHttpProfilingExporter({
        endpoint: options.endpoint,
        callstackInterval: options.samplingIntervalMs,
        resource: options.resource,
        instrumentationSource: 'continuous',
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
    clearTimeout(this.stopTimeout);
    clearInterval(this.collectionLoop);
    clearInterval(this.exportLoop);

    const profile = this.extension.stop(this.profilerHandle);

    if (profile) {
      await this._export(profile);
    }
  }
}

let profiler: SnapshotProfiler | undefined;

export function startSnapshotProfiling(options: StartSnapshotProfilingOptions) {
  const samplingIntervalMs =
    options.samplingIntervalMs ??
    getEnvNumber('SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL', 10);
  const collectionIntervalMs =
    options.collectionIntervalMs ??
    getEnvNumber('SPLUNK_CPU_PROFILER_COLLECTION_INTERVAL', 30_000);

  profiler = new SnapshotProfiler({
    serviceName: options.serviceName,
    endpoint: options.endpoint,
    resource: options.resource,
    samplingIntervalMs,
    collectionIntervalMs,
  });
}

export async function stopSnapshotProfiling() {
  if (!profiler) {
    return;
  }

  await profiler.stop();
}

export function isSnapshotProfilingEnabled() {
  return getEnvBoolean('SPLUNK_SNAPSHOT_PROFILER_ENABLED', false);
}

export function snapshotSpanProcessor(): SnapshotSpanProcessor | undefined {
  return profiler?.processor;
}
