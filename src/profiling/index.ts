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
import { defaultServiceName, getEnvNumber } from '../options';
import { EnvResourceDetector } from '../resource';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  ProfilingExporter,
  ProfilingExtension,
  ProfilingOptions,
  ProfilingStartOptions,
} from './types';
import { ProfilingContextManager } from './profiling_contextmanager';
import { OTLPProfilingExporter } from './otlp_exporter';
import { DebugExporter } from './debug_exporter';

/* The following are wrappers around native functions to give more context to profiling samples. */
function extStopProfiling(extension: ProfilingExtension) {
  return extension.stop();
}

function extStartProfiling(
  extension: ProfilingExtension,
  opts: ProfilingStartOptions
) {
  extension.start(opts);
}

function extCollectSamples(extension: ProfilingExtension) {
  return extension.collect();
}

export function startProfiling(opts: Partial<ProfilingOptions> = {}) {
  const options = _setDefaultOptions(opts);

  if (!options.enabled) {
    return {
      stop: () => {},
    };
  }

  const extension = loadExtension();

  if (extension === undefined) {
    return {
      stop: () => {},
    };
  }

  const contextManager = new ProfilingContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);

  const exporters: ProfilingExporter[] = [
    new OTLPProfilingExporter({
      endpoint: options.endpoint,
      callstackInterval: options.callstackInterval,
      resource: options.resource,
    }),
  ];

  if (options.debugExport) {
    exporters.push(new DebugExporter());
  }

  const startOptions = {
    samplingIntervalMicroseconds: options.callstackInterval * 1_000,
    recordDebugInfo: options.debugExport,
  };

  setImmediate(() => {
    extStartProfiling(extension, startOptions);
  });

  const interval = setInterval(() => {
    const profilingData = extCollectSamples(extension);

    for (const exporter of exporters) {
      exporter.send(profilingData);
    }
  }, options.collectionDuration);

  interval.unref();

  return {
    stop: () => {
      clearInterval(interval);
      const profilingData = extStopProfiling(extension);

      for (const exporter of exporters) {
        exporter.send(profilingData);
      }
    },
  };
}

export function loadExtension(): ProfilingExtension | undefined {
  let extension;
  try {
    extension = require('../native_ext');
  } catch (e) {
    diag.error(
      'Unable to load profiling extension. Profiling data will not be reported',
      e
    );
  }

  return extension?.profiling;
}

export function _setDefaultOptions(
  options: Partial<ProfilingOptions> = {}
): ProfilingOptions {
  const enabled = options.enabled ?? true;
  const endpoint =
    options.endpoint ||
    process.env.SPLUNK_PROFILER_LOGS_ENDPOINT ||
    'localhost:4317';

  const envResource = new EnvResourceDetector().detect();

  const serviceName = String(
    options.serviceName ||
      process.env.OTEL_SERVICE_NAME ||
      envResource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
      defaultServiceName
  );

  let resource =
    options.resource === undefined
      ? envResource
      : envResource.merge(options.resource);

  resource = resource.merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        serviceName || defaultServiceName,
    })
  );

  return {
    enabled,
    serviceName: serviceName,
    endpoint,
    callstackInterval:
      options.callstackInterval ||
      getEnvNumber('SPLUNK_PROFILER_CALL_STACK_INTERVAL', 1000),
    collectionDuration: options.collectionDuration || 60_000,
    resource,
    debugExport: options.debugExport ?? false,
  };
}
