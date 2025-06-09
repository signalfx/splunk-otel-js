import { ensureProfilingContextManager } from "../../profiling";
import { getEnvBoolean, getEnvNumber } from "../../utils";
import { SnapshotSpanProcessor } from "./SnapshotSpanProcessor";
import type { ProfilingExtension } from "../../profiling/types";
import { loadExtension } from "../../profiling";

export interface SnapshotProfilingOptions {
  samplingIntervalMicroseconds: number;
}

export class SnapshotProfiler {
  processor: SnapshotSpanProcessor;
  extension: ProfilingExtension | undefined = loadExtension();
  profilerHandle: number;

  constructor(options: SnapshotProfilingOptions) {
    ensureProfilingContextManager();
    this.processor = new SnapshotSpanProcessor({
      traceSnapshotBegin: (traceId) => {
        console.log('begin snapshot for traceId', traceId);
      },
      traceSnapshotEnd: (traceId) => {
        console.log('trace snapshot ended', traceId);
      }
    });

    const samplingIntervalMicroseconds = options.samplingIntervalMicroseconds;
    this.profilerHandle = this.extension?.createCpuProfiler({
      name: 'splunk-snapshot-profiler',
      samplingIntervalMicroseconds,
      maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
      recordDebugInfo: false,
    }) ?? -1;

    console.log('profiler handle', this.profilerHandle);
  }
}

let profiler: SnapshotProfiler | undefined;

export function startSnapshotProfiling() {
  const intervalMs = getEnvNumber('SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL', 10);
  const samplingIntervalMicroseconds = intervalMs * 1_000;


  profiler = new SnapshotProfiler({
    samplingIntervalMicroseconds,
  });
}

export function isSnapshotProfilingEnabled() {
  return getEnvBoolean('SPLUNK_SNAPSHOT_PROFILER_ENABLED', false);
}

export function snapshotSpanProcessor(): SnapshotSpanProcessor | undefined {
  return profiler?.processor;
}

/*
export function startProfiling(options: ProfilingOptions) {
  const extension = loadExtension();

  if (extension === undefined) {
    return {
      stop: async () => {},
    };
  }

  ensureProfilingContextManager();

  const samplingIntervalMicroseconds = options.callstackInterval * 1_000;
  const startOptions = {
    name: 'splunk-otel-js-profiler',
    samplingIntervalMicroseconds,
    maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
    recordDebugInfo: false,
  };

  const handle = extStartProfiling(extension, startOptions);

  let cpuSamplesCollectInterval: NodeJS.Timeout;
  let exporters: ProfilingExporter[] = [];

  // Tracing needs to be started after profiling, setting up the profiling exporter
  // causes @grpc/grpc-js to be loaded, but to avoid any loads before tracing's setup
  // has finished, load it next event loop.
  setImmediate(() => {
    exporters = options.exporterFactory(options);
    cpuSamplesCollectInterval = setInterval(async () => {
      console.log('collecting cpu profile for handle', handle);
      const cpuProfile = extCollectCpuProfile(handle, extension);

      if (cpuProfile) {
        recordCpuProfilerMetrics(cpuProfile);
        const sends = exporters.map((exporter) => exporter.send(cpuProfile));
        await Promise.allSettled(sends);
      }
    }, options.collectionDuration);

    cpuSamplesCollectInterval.unref();
  });

  return {
    stop: async () => {
      clearInterval(cpuSamplesCollectInterval);
      const cpuProfile = extStopProfiling(handle, extension);

      if (cpuProfile) {
        const sends = exporters.map((e) => e.send(cpuProfile));
        await Promise.allSettled(sends).then((results) => {
          for (const result of results) {
            if (result.status === 'rejected') {
              diag.error(
                'Failed sending CPU profile on shutdown',
                result.reason
              );
            }
          }
        });
      }
    },
  };
}
*/

