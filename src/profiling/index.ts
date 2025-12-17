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

import { context, diag } from '@opentelemetry/api';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { defaultServiceName, ensureResourcePath } from '../utils';
import {
  getConfigBoolean,
  getConfigNumber,
  getNonEmptyConfigVar,
} from '../configuration';
import {
  recordCpuProfilerMetrics,
  recordHeapProfilerMetrics,
} from '../metrics/debug_metrics';
import { getDetectedResource } from '../resource';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import type {
  HeapProfile,
  MemoryProfilingOptions,
  ProfilingExporter,
  ProfilingExtension,
  NativeProfilingOptions,
  ProfilingOptions,
  StartProfilingOptions,
} from './types';
import { ProfilingContextManager } from './ProfilingContextManager';
import { OtlpHttpProfilingExporter } from './OtlpHttpProfilingExporter';
import { isTracingContextManagerEnabled } from '../tracing';

export type { StartProfilingOptions, ProfilingOptions };

/* The following are wrappers around native functions to give more context to profiling samples. */
function extStopProfiling(handle: number, extension: ProfilingExtension) {
  diag.debug('profiling: Stopping');
  return extension.stop(handle);
}

function extStopMemoryProfiling(extension: ProfilingExtension) {
  return extension.stopMemoryProfiling();
}

function extStartProfiling(
  extension: ProfilingExtension,
  opts: NativeProfilingOptions
): number {
  diag.debug('profiling: Starting');
  return extension.start(opts);
}

function extStartMemoryProfiling(
  extension: ProfilingExtension,
  options?: MemoryProfilingOptions
) {
  return extension.startMemoryProfiling(options);
}

function extCollectHeapProfile(
  extension: ProfilingExtension
): HeapProfile | null {
  return extension.collectHeapProfile();
}

function extCollectCpuProfile(handle: number, extension: ProfilingExtension) {
  diag.debug('profiling: Collecting CPU profile');
  return extension.collect(handle);
}

export function defaultExporterFactory(
  options: ProfilingOptions
): ProfilingExporter[] {
  const endpoint =
    ensureResourcePath(options.endpoint, '/v1/logs') ?? options.endpoint;
  const exporters: ProfilingExporter[] = [
    new OtlpHttpProfilingExporter({
      endpoint,
      callstackInterval: options.callstackInterval,
      resource: options.resource,
      instrumentationSource: 'continuous',
    }),
  ];

  return exporters;
}

let profilingContextManagerEnabled = false;

export function isProfilingContextManagerSet(): boolean {
  return profilingContextManagerEnabled;
}

export function ensureProfilingContextManager() {
  if (profilingContextManagerEnabled === true) {
    return;
  }

  const contextManager = new ProfilingContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);
  profilingContextManagerEnabled = true;
}

export function startProfiling(options: ProfilingOptions) {
  const extension = loadExtension();

  if (extension === undefined) {
    return {
      stop: async () => {},
    };
  }

  if (isTracingContextManagerEnabled()) {
    diag.warn(
      `Splunk profiling: unable to set up context manager due to tracing's context manager being active. Traces won't be correlated to profiling data. Please start profiling before tracing.`
    );
  } else if (!profilingContextManagerEnabled) {
    ensureProfilingContextManager();
  }

  const samplingIntervalMicroseconds = options.callstackInterval * 1_000;
  const startOptions = {
    name: 'splunk-otel-js-profiler',
    samplingIntervalMicroseconds,
    maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
    recordDebugInfo: false,
  };

  const handle = extStartProfiling(extension, startOptions);

  let cpuSamplesCollectInterval: NodeJS.Timeout;
  let memSamplesCollectInterval: NodeJS.Timeout;
  let exporters: ProfilingExporter[] = [];

  // Tracing needs to be started after profiling, setting up the profiling exporter
  // causes @grpc/grpc-js to be loaded, but to avoid any loads before tracing's setup
  // has finished, load it next event loop.
  setImmediate(() => {
    exporters = options.exporterFactory(options);
    cpuSamplesCollectInterval = setInterval(async () => {
      const cpuProfile = extCollectCpuProfile(handle, extension);

      if (cpuProfile) {
        recordCpuProfilerMetrics(cpuProfile);
        const sends = exporters.map((exporter) => exporter.send(cpuProfile));
        await Promise.allSettled(sends);
      }
    }, options.collectionDuration);

    cpuSamplesCollectInterval.unref();

    if (options.memoryProfilingEnabled) {
      extStartMemoryProfiling(extension, options.memoryProfilingOptions);
      memSamplesCollectInterval = setInterval(async () => {
        const heapProfile = extCollectHeapProfile(extension);
        if (heapProfile) {
          recordHeapProfilerMetrics(heapProfile);

          const sends = exporters.map((exporter) =>
            exporter.sendHeapProfile(heapProfile)
          );
          await Promise.allSettled(sends);
        }
      }, options.collectionDuration);

      memSamplesCollectInterval.unref();
    }
  });

  return {
    stop: async () => {
      if (options.memoryProfilingEnabled) {
        clearInterval(memSamplesCollectInterval);
        extStopMemoryProfiling(extension);
      }

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

export function loadExtension(): ProfilingExtension | undefined {
  try {
    diag.debug('profiling: Loading');
    return require('../native_ext').profiling;
  } catch (e) {
    diag.error(
      'profiling: Unable to load extension. Profiling data will not be reported',
      e
    );
  }

  return undefined;
}

export function noopExtension(): ProfilingExtension {
  return {
    createCpuProfiler: (_options: NativeProfilingOptions) => -1,
    startCpuProfiler: (_handle: number) => false,
    addTraceIdFilter: (_handle: number, _traceId: string) => {},
    removeTraceIdFilter: (_handle: number, _traceId: string) => {},
    start: (_options: NativeProfilingOptions) => -1,
    stop: (_handle: number) => null,
    collect: (_handle: number) => null,
    enterContext: (_context: unknown, _traceId: string, _spanId: string) => {},
    exitContext: (_context: unknown) => {},
    startMemoryProfiling: (_options?: MemoryProfilingOptions) => {},
    stopMemoryProfiling: () => {},
    collectHeapProfile: () => null,
  };
}

export function _setDefaultOptions(
  options: StartProfilingOptions = {}
): ProfilingOptions {
  const endpoint =
    options.endpoint ||
    getNonEmptyConfigVar('SPLUNK_PROFILER_LOGS_ENDPOINT') ||
    getNonEmptyConfigVar('OTEL_EXPORTER_OTLP_ENDPOINT') ||
    'http://localhost:4318';

  const envResource = getDetectedResource();

  const serviceName = String(
    options.serviceName ||
      getNonEmptyConfigVar('OTEL_SERVICE_NAME') ||
      envResource.attributes?.[ATTR_SERVICE_NAME] ||
      defaultServiceName()
  );

  const resourceFactory = options.resourceFactory || ((r: Resource) => r);

  const resource = resourceFactory(
    resourceFromAttributes(envResource.attributes || {})
  ).merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    })
  );

  const memoryProfilingEnabled =
    options.memoryProfilingEnabled ??
    getConfigBoolean('SPLUNK_PROFILER_MEMORY_ENABLED', false);

  return {
    serviceName: serviceName,
    endpoint,
    callstackInterval:
      options.callstackInterval ||
      getConfigNumber('SPLUNK_PROFILER_CALL_STACK_INTERVAL', 1000),
    collectionDuration: options.collectionDuration || 30_000,
    resource,
    exporterFactory: options.exporterFactory ?? defaultExporterFactory,
    memoryProfilingEnabled,
    memoryProfilingOptions: options.memoryProfilingOptions,
  };
}

export const allowedProfilingOptions = [
  'callstackInterval',
  'collectionDuration',
  'endpoint',
  'accessToken',
  'resourceFactory',
  'serviceName',
  'exporterFactory',
  'memoryProfilingEnabled',
  'memoryProfilingOptions',
];
