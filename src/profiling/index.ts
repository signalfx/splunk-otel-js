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
import { Resource } from '@opentelemetry/resources';
import {
  assertNoExtraneousProperties,
  defaultServiceName,
  getEnvBoolean,
  getEnvNumber,
  getNonEmptyEnvVar,
} from '../utils';
import { detect as detectResource } from '../resource';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  HeapProfile,
  MemoryProfilingOptions,
  ProfilingExporter,
  ProfilingExtension,
  ProfilingOptions,
  StartProfilingOptions,
  ProfilingStartOptions,
  allowedProfilingOptions,
} from './types';
import { ProfilingContextManager } from './ProfilingContextManager';
import { OTLPProfilingExporter } from './OTLPProfilingExporter';
import { isTracingContextManagerEnabled } from '../tracing';

export { StartProfilingOptions };

/* The following are wrappers around native functions to give more context to profiling samples. */
function extStopProfiling(extension: ProfilingExtension) {
  diag.debug('profiling: Stopping');
  return extension.stop();
}

function extStopMemoryProfiling(extension: ProfilingExtension) {
  return extension.stopMemoryProfiling();
}

function extStartProfiling(
  extension: ProfilingExtension,
  opts: ProfilingStartOptions
) {
  diag.debug('profiling: Starting');
  extension.start(opts);
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

function extCollectSamples(extension: ProfilingExtension) {
  diag.debug('profiling: Collecting samples');
  return extension.collectRaw();
}

export function defaultExporterFactory(
  options: ProfilingOptions
): ProfilingExporter[] {
  const exporters: ProfilingExporter[] = [
    new OTLPProfilingExporter({
      endpoint: options.endpoint,
      callstackInterval: options.callstackInterval,
      resource: options.resource,
    }),
  ];

  return exporters;
}

let profilingContextManagerEnabled = false;

export function isProfilingContextManagerSet(): boolean {
  return profilingContextManagerEnabled;
}

export function startProfiling(opts: StartProfilingOptions = {}) {
  assertNoExtraneousProperties(opts, allowedProfilingOptions);

  const options = _setDefaultOptions(opts);

  const extension = loadExtension();

  if (extension === undefined) {
    return {
      stop: () => {},
    };
  }

  if (isTracingContextManagerEnabled()) {
    diag.warn(
      `Splunk profiling: unable to set up context manager due to tracing's context manager being active. Traces won't be correlated to profiling data. Please start profiling before tracing.`
    );
  } else if (!profilingContextManagerEnabled) {
    const contextManager = new ProfilingContextManager();
    contextManager.enable();
    context.setGlobalContextManager(contextManager);
    profilingContextManagerEnabled = true;
  }

  const exporters = options.exporterFactory(options);

  const samplingIntervalMicroseconds = options.callstackInterval * 1_000;
  const startOptions = {
    samplingIntervalMicroseconds,
    maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
    recordDebugInfo: false,
  };

  extStartProfiling(extension, startOptions);

  const cpuSamplesCollectInterval = setInterval(() => {
    const profilingData = extCollectSamples(extension);

    if (profilingData) {
      for (const exporter of exporters) {
        exporter.send(profilingData);
      }
    }
  }, options.collectionDuration);

  cpuSamplesCollectInterval.unref();

  let memSamplesCollectInterval: NodeJS.Timer | undefined;
  if (options.memoryProfilingEnabled) {
    extStartMemoryProfiling(extension, options.memoryProfilingOptions);
    memSamplesCollectInterval = setInterval(() => {
      const heapProfile = extCollectHeapProfile(extension);
      if (heapProfile) {
        for (const exporter of exporters) {
          exporter.sendHeapProfile(heapProfile);
        }
      }
    }, options.collectionDuration);

    memSamplesCollectInterval.unref();
  }

  return {
    stop: () => {
      if (options.memoryProfilingEnabled) {
        clearInterval(memSamplesCollectInterval);
        extStopMemoryProfiling(extension);
      }

      clearInterval(cpuSamplesCollectInterval);
      const cpuProfile = extStopProfiling(extension);

      if (cpuProfile) {
        for (const exporter of exporters) {
          exporter.send(cpuProfile);
        }
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

export function _setDefaultOptions(
  options: Partial<ProfilingOptions> = {}
): ProfilingOptions {
  const endpoint =
    options.endpoint ||
    getNonEmptyEnvVar('SPLUNK_PROFILER_LOGS_ENDPOINT') ||
    getNonEmptyEnvVar('OTEL_EXPORTER_OTLP_ENDPOINT') ||
    'http://localhost:4317';

  const combinedResource = detectResource();

  const serviceName = String(
    options.serviceName ||
      getNonEmptyEnvVar('OTEL_SERVICE_NAME') ||
      combinedResource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
      defaultServiceName()
  );

  let resource =
    options.resource === undefined
      ? combinedResource
      : combinedResource.merge(options.resource);

  resource = resource.merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    })
  );

  const memoryProfilingEnabled =
    options.memoryProfilingEnabled ??
    getEnvBoolean('SPLUNK_PROFILER_MEMORY_ENABLED', false);

  return {
    serviceName: serviceName,
    endpoint,
    callstackInterval:
      options.callstackInterval ||
      getEnvNumber('SPLUNK_PROFILER_CALL_STACK_INTERVAL', 1000),
    collectionDuration: options.collectionDuration || 30_000,
    resource,
    exporterFactory: options.exporterFactory ?? defaultExporterFactory,
    memoryProfilingEnabled,
    memoryProfilingOptions: options.memoryProfilingOptions,
  };
}
