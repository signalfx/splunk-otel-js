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

import { CompositePropagator } from '@opentelemetry/core';
import { Configuration } from './configuration/index';
import {
  OpenTelemetrySdkProvider,
  OpenTelemetrySdkProviderConfig,
} from './configuration/component_providers/sdk';
import { isSnapshotProfilingEnabled } from './tracing/snapshots/Snapshots';
import { SnapshotPropagator } from './tracing/snapshots';
import { getEnvNumber, getNonEmptyEnvVar } from './utils';
import { B3PropagatorProvider } from './configuration/component_providers/propagators/b3';
import { B3MultiPropagatorProvider } from './configuration/component_providers/propagators/b3multi';
import { BaggagePropagatorProvider } from './configuration/component_providers/propagators/baggage';
import { TraceContextPropagatorProvider } from './configuration/component_providers/propagators/tracecontext';
import { HostDetectorProvider } from './configuration/component_providers/detectors/host';
import { ProcessDetectorProvider } from './configuration/component_providers/detectors/process';
import { ContainerDetectorProvider } from './configuration/component_providers/detectors/container';
import { ServiceDetectorProvider } from './configuration/component_providers/detectors/service';
import { DistroDetectorProvider } from './detectors/DistroDetector';
import { EnvVarKey } from './types';
import { AttributeNameValue, OpenTelemetryConfiguration } from './configuration/schema';

export function createConfiguration() {
  const hooks: OpenTelemetrySdkProviderConfig['hooks'] = {
    propagator(propagator) {
      if (isSnapshotProfilingEnabled()) {
        return new CompositePropagator({
          propagators: [
            propagator,
            new SnapshotPropagator(
              getEnvNumber('SPLUNK_SNAPSHOT_SELECTION_RATE', 0.01)
            ),
          ],
        });
      }

      return propagator;
    },
  };

  return new Configuration([
    new OpenTelemetrySdkProvider({ hooks }),
    // Propagators
    new B3PropagatorProvider(),
    new B3MultiPropagatorProvider(),
    new BaggagePropagatorProvider(),
    new TraceContextPropagatorProvider(),
    // Detectors
    new ContainerDetectorProvider(),
    new HostDetectorProvider(),
    new ProcessDetectorProvider(),
    new ServiceDetectorProvider(),
    new DistroDetectorProvider(),
  ]);
}

export type DistroConfiguration = OpenTelemetryConfiguration & {
  vendor?: {
    realm?: string;
    // Limit only to these package/service names.
    // When this is set and the package/service name does not match, tracing will be disabled.
    autoInstrumentPackageNames?: string[],
    automaticLogCollection?: boolean;
    tracing?: {
      useDefaultInstrumentations?: boolean;
      traceResponseHeaderEnabled?: boolean;
    },
    profiling?: {
      enabled?: boolean;
      endpoint?: string;
      callstackInterval?: number;
      collectionInterval?: number;
      memoryProfilingEnabled?: boolean;
    },
    metrics?: {
      debug?: boolean;
    },
    snapshotProfiling?: {
      enabled?: boolean;
      samplingInterval?: number;
      selectionRate?: number;
    }
  },
};

let globalConfiguration: OpenTelemetryConfiguration | undefined;

export function setGlobalConfiguration(config: OpenTelemetryConfiguration) {
  globalConfiguration = config;
}

function findAttributeValue(attributes: AttributeNameValue[], name: string) {
  for (let i = 0; i < attributes.length; i++) {
    const attrib = attributes[i];

    if (attrib.name === name) {
      return attrib.value;
    }
  }

  return undefined;
}

function fetchConfigValue(key: EnvVarKey, config: DistroConfiguration) {
  switch (key) {
    case 'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT': {
      return config.attribute_limits?.attribute_value_length_limit;
    }
    case 'OTEL_EXPORTER_OTLP_CERTIFICATE': {
      // TODO: Signal specific?
      return undefined
    }
    case 'OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE': {
      // TODO: Signal specific?
      return undefined
    }
    case 'OTEL_EXPORTER_OTLP_CLIENT_KEY': {
      // TODO: Signal specific?
      return undefined
    }
    case 'OTEL_LOG_LEVEL': {
      return config.log_level;
    }
    case 'OTEL_TRACES_SAMPLER': {
      return config.tracer_provider?.sampler;
    }
    case 'OTEL_PROPAGATORS': {
      // TODO: Filter out keys
      const propagators = config.propagator?.composite || [];
    }
    case 'OTEL_SERVICE_NAME': {
      return findAttributeValue(config.resource?.attributes || [], 'service.name');
    }
    case 'OTEL_SPAN_LINK_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.link_count_limit;
    }
    case 'SPLUNK_AUTOINSTRUMENT_PACKAGE_NAMES': {
      return config.vendor?.autoInstrumentPackageNames;
    }
    case 'SPLUNK_AUTOMATIC_LOG_COLLECTION': {
      return config.vendor?.automaticLogCollection;
    }
    case 'SPLUNK_DEBUG_METRICS_ENABLED': {
      return config.vendor?.metrics?.debug;
    }
    case 'SPLUNK_INSTRUMENTATION_METRICS_ENABLED': // TODO: Is this env var actually necessary?
    case 'SPLUNK_METRICS_ENABLED': {
      return config.meter_provider !== undefined;
    }
    case 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED': {
      return config.vendor?.tracing?.useDefaultInstrumentations;
    }
    case 'SPLUNK_PROFILER_ENABLED': {
      return config.vendor?.profiling?.enabled;
    }
    case 'SPLUNK_PROFILER_LOGS_ENDPOINT': {
      return config.vendor?.profiling?.endpoint;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_ENABLED': {
      return config.vendor?.snapshotProfiling?.enabled;
    }
    case 'SPLUNK_PROFILER_CALL_STACK_INTERVAL': {
      return config.vendor?.profiling?.callstackInterval;
    }
    case 'SPLUNK_CPU_PROFILER_COLLECTION_INTERVAL': {
      return config.vendor?.profiling?.collectionInterval;
    }
    case 'SPLUNK_PROFILER_MEMORY_ENABLED': {
      return config.vendor?.profiling?.memoryProfilingEnabled;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL': {
      return config.vendor?.snapshotProfiling?.samplingInterval;
    }
    case 'SPLUNK_SNAPSHOT_SELECTION_RATE': {
      return config.vendor?.snapshotProfiling?.selectionRate;
    }
    case 'SPLUNK_REALM': {
      return config.vendor?.realm;
    }
    case 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED': {
      return config.vendor?.tracing?.traceResponseHeaderEnabled;
    }
    case 'SPLUNK_TRACING_ENABLED': {
      return config.tracer_provider !== undefined;
    }
    /*
  | 'OTEL_EXPORTER_OTLP_ENDPOINT'
  | 'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT'
  | 'OTEL_EXPORTER_OTLP_METRICS_PROTOCOL'
  | 'OTEL_EXPORTER_OTLP_PROTOCOL'
  | 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'
  | 'OTEL_EXPORTER_OTLP_TRACES_PROTOCOL'
  | 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED'
  | 'OTEL_LOGS_EXPORTER'
  | 'OTEL_METRIC_EXPORT_INTERVAL'
  | 'OTEL_METRICS_EXPORTER'
  | 'OTEL_TRACES_EXPORTER'
  | 'OTEL_TRACES_SAMPLER'
  | 'SPLUNK_ACCESS_TOKEN'
  | 'SPLUNK_GRAPHQL_RESOLVE_SPANS_ENABLED'
  | 'SPLUNK_NEXTJS_FIX_ENABLED'
  | 'SPLUNK_REDIS_INCLUDE_COMMAND_ARGS'
  | 'SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL'
  | 'SPLUNK_RUNTIME_METRICS_ENABLED'
    default: {
      console.log('unhandled config translation for key', key);
      return '';
    }
    */
  }
}

export function getNonEmptyConfigVar(key: EnvVarKey): string | undefined {
  if (globalConfiguration === undefined) {
    return getNonEmptyEnvVar(key);
  }

  const value = fetchConfigValue(key, globalConfiguration);

  if (value === undefined) {
    return value;
  }

  return String(value);
}
