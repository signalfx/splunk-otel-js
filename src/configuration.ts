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
  _getEnvArray,
  _getEnvBoolean,
  _getEnvNumber,
  _getNonEmptyEnvVar,
} from './utils';
import { EnvVarKey } from './types';
import {
  AttributeNameValue,
  OpenTelemetryConfiguration,
} from './configuration/schema';
import { AlwaysOffSampler, AlwaysOnSampler, TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';
import { Sampler } from '@opentelemetry/api';

export function createConfiguration() {}

export type DistroConfiguration = OpenTelemetryConfiguration & {
  splunk?: {
    // Limit only to these package/service names.
    // When this is set and the package/service name does not match, tracing will be disabled.
    autoInstrumentPackageNames?: string[];
    tracing?: {
      useDefaultInstrumentations?: boolean;
      traceResponseHeaderEnabled?: boolean;
      nextJsCardinalityReduction?: boolean;
    };
    profiling?: {
      enabled?: boolean;
      endpoint?: string;
      callstackInterval?: number;
      collectionInterval?: number;
      memoryProfilingEnabled?: boolean;
    };
    metrics?: {
      debug?: boolean;
    };
    snapshotProfiling?: {
      enabled?: boolean;
      samplingInterval?: number;
      selectionRate?: number;
    };
  };
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
      return undefined;
    }
    case 'OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE': {
      // TODO: Signal specific?
      return undefined;
    }
    case 'OTEL_EXPORTER_OTLP_CLIENT_KEY': {
      // TODO: Signal specific?
      return undefined;
    }
    case 'OTEL_LOG_LEVEL': {
      return config.log_level;
    }
    case 'OTEL_TRACES_SAMPLER': {
      throw new Error('OTEL_TRACES_SAMPLER unsupported for config');
    }
    case 'OTEL_PROPAGATORS': {
      // TODO: Filter out keys
      const propagators = config.propagator?.composite || [];
      throw new Error('OTEL_PROPAGATORS fix');
    }
    case 'OTEL_SERVICE_NAME': {
      return findAttributeValue(
        config.resource?.attributes || [],
        'service.name'
      );
    }
    case 'OTEL_SPAN_LINK_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.link_count_limit;
    }
    case 'SPLUNK_AUTOINSTRUMENT_PACKAGE_NAMES': {
      return config.splunk?.autoInstrumentPackageNames;
    }
    case 'SPLUNK_AUTOMATIC_LOG_COLLECTION': {
      return config.logger_provider !== undefined;
    }
    case 'SPLUNK_DEBUG_METRICS_ENABLED': {
      return config.splunk?.metrics?.debug;
    }
    case 'SPLUNK_INSTRUMENTATION_METRICS_ENABLED': // TODO: Is this env var actually necessary?
    case 'SPLUNK_METRICS_ENABLED': {
      return config.meter_provider !== undefined;
    }
    case 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED': {
      return config.splunk?.tracing?.useDefaultInstrumentations;
    }
    case 'SPLUNK_PROFILER_ENABLED': {
      return config.splunk?.profiling?.enabled;
    }
    case 'SPLUNK_PROFILER_LOGS_ENDPOINT': {
      return config.splunk?.profiling?.endpoint;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_ENABLED': {
      return config.splunk?.snapshotProfiling?.enabled;
    }
    case 'SPLUNK_PROFILER_CALL_STACK_INTERVAL': {
      return config.splunk?.profiling?.callstackInterval;
    }
    case 'SPLUNK_CPU_PROFILER_COLLECTION_INTERVAL': {
      return config.splunk?.profiling?.collectionInterval;
    }
    case 'SPLUNK_PROFILER_MEMORY_ENABLED': {
      return config.splunk?.profiling?.memoryProfilingEnabled;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL': {
      return config.splunk?.snapshotProfiling?.samplingInterval;
    }
    case 'SPLUNK_SNAPSHOT_SELECTION_RATE': {
      return config.splunk?.snapshotProfiling?.selectionRate;
    }
    case 'SPLUNK_REALM': {
      throw new Error('SPLUNK_REALM not supported');
    }
    case 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED': {
      return config.splunk?.tracing?.traceResponseHeaderEnabled;
    }
    case 'SPLUNK_TRACING_ENABLED': {
      return config.tracer_provider !== undefined;
    }
    case 'SPLUNK_NEXTJS_FIX_ENABLED': {
      return config.splunk?.tracing?.nextJsCardinalityReduction;
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

export function getResourceConfig() {
  if (globalConfiguration === undefined) {
    return undefined;
  }

  return globalConfiguration.resource;
}

export function getConfigResourceDetectors() {
  if (globalConfiguration === undefined) {
    return undefined;
  }

  const detection = globalConfiguration.resource?.['detection/development'];

  if (detection === undefined) {
    return undefined;
  }

  return detection.detectors || [];
}

export function configGetPropagators() {
  if (globalConfiguration === undefined) {
    return undefined;
  }

  const compositePropagators = (
    globalConfiguration.propagator?.composite || []
  ).flatMap((v) => Object.keys(v));
  const compositeListPropagators = (
    globalConfiguration.propagator?.composite_list || ''
  )
    .split(',')
    .map((v) => v.trim());

  return [...new Set([...compositePropagators, ...compositeListPropagators])];
}

export function configGetSampler() {
  if (globalConfiguration === undefined) {
    return undefined;
  }

  const sampler = globalConfiguration.tracer_provider?.sampler;

  if (sampler === undefined || sampler.always_on !== undefined) {
    // We use AlwaysOnSampler by default instead of parent based.
    return new AlwaysOnSampler();
  }

  if (sampler.always_off !== undefined) {
    return new AlwaysOffSampler();
  }

  if (sampler.parent_based !== undefined) {
    const parentBased = sampler.parent_based;

    let rootSampler: Sampler | undefined;
    let remoteParentSampled: Sampler | undefined;

    if (parentBased.root === undefined) {
      rootSampler = new AlwaysOnSampler();
    } else {
      const root = parentBased.root;

      if (root.trace_id_ratio_based !== undefined) {
        const ratio = root.trace_id_ratio_based.ratio ?? undefined;
        rootSampler = new TraceIdRatioBasedSampler(ratio);
      } else if (root.always_on !== undefined) {
        rootSampler = new AlwaysOnSampler();
      } else if (root.always_off !== undefined) {
        rootSampler = new AlwaysOffSampler();
      } else {
        rootSampler = new AlwaysOnSampler();
      }
    }

    remoteParentSampled = parentBased.remote_parent_sampled
  }
  return globalConfiguration?.tracer_provider?.sampler;
}

export function getConfigLogger() {
  if (globalConfiguration === undefined) {
    return undefined;
  }

  return globalConfiguration.logger_provider;
}

export function getNonEmptyConfigVar(key: EnvVarKey): string | undefined {
  if (globalConfiguration === undefined) {
    return _getNonEmptyEnvVar(key);
  }

  const value = fetchConfigValue(key, globalConfiguration);

  if (value === undefined) {
    return value;
  }

  return String(value);
}

export function getConfigBoolean(key: EnvVarKey, defaultValue = true): boolean {
  if (globalConfiguration === undefined) {
    return _getEnvBoolean(key, defaultValue);
  }

  const value = fetchConfigValue(key, globalConfiguration);

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`Expected bool value, got ${typeof value}`);
  }

  return value;
}

export function getConfigNumber(key: EnvVarKey, defaultValue: number): number {
  if (globalConfiguration === undefined) {
    return _getEnvNumber(key, defaultValue);
  }

  const value = fetchConfigValue(key, globalConfiguration);

  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'number') {
    throw new Error(`Expected number value, got ${typeof value}`);
  }

  return value;
}

export function getConfigArray(key: EnvVarKey): string[] | undefined {
  if (globalConfiguration === undefined) {
    return _getEnvArray(key);
  }

  const value = fetchConfigValue(key, globalConfiguration);

  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`Expected array value, got ${typeof value}`);
  }

  return value.map((v) => String(v));
}
