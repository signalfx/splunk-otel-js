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
  getEnvArray,
  getEnvBoolean,
  getEnvNumber,
  getNonEmptyEnvVar,
} from './utils';
import { EnvVarKey } from './types';
import {
  AttributeNameValue,
  ParentBasedSampler as ConfigParentBasedSampler,
  AttributeNameValue as ConfigAttributeNameValue,
  Resource as ConfigResource,
  OpenTelemetryConfiguration,
} from './configuration/schema';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { Sampler } from '@opentelemetry/sdk-trace-base';
import { existsSync, readFileSync } from 'node:fs';
import { parseDocument } from 'yaml';
import { bundledInstrumentations } from './instrumentations';
import {
  emptyResource,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { AttributeValue } from '@opentelemetry/api';

export type SplunkConfiguration = {
  profiling?: {
    exporter?: {
      otlp_http?: {
        endpoint?: string | null;
      };
    };
    always_on?: {
      cpu_profiler?: {
        sampling_interval?: number;
        collection_interval?: number;
      };
      memory_profiler?: {} | null;
    };
    callgraphs?: {
      sampling_interval?: number;
      selection_probability?: number;
    } | null;
  };
};
export type DistroConfiguration = OpenTelemetryConfiguration & {
  distribution?: {
    splunk?: SplunkConfiguration;
  };
};

export type SplunkRuntimeMetricsConf = {
  collectionInterval?: number;
};

function getRuntimeMetricsConf(
  conf: DistroConfiguration
): SplunkRuntimeMetricsConf | undefined {
  const runtimeMetricsConf =
    conf['instrumentation/development']?.js?.[
      '@splunk/instrumentation-runtime-metrics'
    ];

  if (typeof runtimeMetricsConf === 'object') {
    return runtimeMetricsConf;
  }

  return undefined;
}

export function loadConfiguration(path: string): DistroConfiguration {
  if (!existsSync(path)) {
    throw new Error(`Config file ${path} does not exist`);
  }

  const file = readFileSync(path, { encoding: 'utf-8' });
  const doc = parseDocument(file);

  if (doc.errors.length > 0) {
    throw doc.errors[0];
  }

  return doc.toJS();
}

let globalConfiguration: DistroConfiguration | undefined;

export function setGlobalConfiguration(config: DistroConfiguration) {
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

function getInstrumentationConf(
  config: DistroConfiguration,
  instrumentationName: string
): Record<string, any> | undefined {
  const conf = config['instrumentation/development']?.js?.[instrumentationName];

  if (conf === null || typeof conf !== 'object') {
    return undefined;
  }

  return conf;
}

function splunkConfig(
  config: DistroConfiguration
): SplunkConfiguration | undefined {
  return config.distribution?.splunk;
}

function fetchConfigValue(key: EnvVarKey, config: DistroConfiguration) {
  switch (key) {
    case 'OTEL_ATTRIBUTE_COUNT_LIMIT': {
      return config.attribute_limits?.attribute_count_limit;
    }
    case 'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT': {
      return config.attribute_limits?.attribute_value_length_limit;
    }
    case 'OTEL_LOG_LEVEL': {
      return config.log_level;
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
      const filter = config.splunk?.general?.js?.package_name_filter;

      if (Array.isArray(filter)) {
        return filter;
      }

      return undefined;
    }
    case 'SPLUNK_AUTOMATIC_LOG_COLLECTION': {
      return config.logger_provider !== undefined;
    }
    case 'SPLUNK_DEBUG_METRICS_ENABLED': {
      return config.splunk?.general?.js?.debug_metrics_enabled === true;
    }
    case 'SPLUNK_INSTRUMENTATION_METRICS_ENABLED': // TODO: Is this env var actually necessary?
    case 'SPLUNK_METRICS_ENABLED': {
      return config.meter_provider !== undefined;
    }
    case 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED': {
      return config.splunk?.general?.js?.use_bundled_instrumentations;
    }
    case 'SPLUNK_PROFILER_ENABLED': {
      const cpuProfiler =
        splunkConfig(config)?.profiling?.always_on?.cpu_profiler;

      if (cpuProfiler === null || typeof cpuProfiler === 'object') {
        return true;
      }

      return false;
    }
    case 'SPLUNK_PROFILER_LOGS_ENDPOINT': {
      const endpoint = config.splunk?.profiling?.exporter?.otlp_http?.endpoint;

      if (typeof endpoint === 'string') {
        return endpoint;
      }

      return undefined;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_ENABLED': {
      return config.splunk?.profiling?.callgraphs !== undefined;
    }
    case 'SPLUNK_PROFILER_CALL_STACK_INTERVAL': {
      return config.splunk?.profiling?.always_on?.cpu_profiler
        ?.sampling_interval;
    }
    case 'SPLUNK_CPU_PROFILER_COLLECTION_INTERVAL': {
      return config.splunk?.profiling?.always_on?.cpu_profiler
        ?.collection_interval;
    }
    case 'SPLUNK_PROFILER_MEMORY_ENABLED': {
      return config.splunk?.profiling?.always_on?.memory_profiler !== undefined;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL': {
      return config.splunk?.profiling?.callgraphs?.sampling_interval;
    }
    case 'SPLUNK_SNAPSHOT_SELECTION_RATE': {
      return config.splunk?.profiling?.callgraphs?.selection_probability;
    }
    case 'SPLUNK_REALM': {
      return undefined;
    }
    case 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED': {
      const httpConf = getInstrumentationConf(
        config,
        '@opentelemetry/instrumentation-http'
      );

      const value = httpConf?.['trace_response_header_enabled'];

      if (typeof value === 'boolean') {
        return value;
      }

      return undefined;
    }
    case 'SPLUNK_TRACING_ENABLED': {
      return config.tracer_provider !== undefined;
    }
    case 'SPLUNK_NEXTJS_FIX_ENABLED': {
      return config?.splunk?.general?.js?.nextjs_cardinality_reduction === true;
    }
    case 'OTEL_EXPORTER_OTLP_ENDPOINT': {
      // TODO: Warn?
      return undefined;
    }
    case 'SPLUNK_ACCESS_TOKEN': {
      return undefined;
    }
    case 'OTEL_METRIC_EXPORT_INTERVAL': {
      return undefined;
    }
    case 'SPLUNK_RUNTIME_METRICS_ENABLED': {
      return getRuntimeMetricsConf(config) !== undefined;
    }
    case 'SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL': {
      return getRuntimeMetricsConf(config)?.collectionInterval;
    }
    case 'SPLUNK_REDIS_INCLUDE_COMMAND_ARGS': {
      const redisConf = getInstrumentationConf(
        config,
        '@opentelemetry/instrumentation-redis'
      );

      const value = redisConf?.['include_command_args'];

      if (typeof value === 'boolean') {
        return value;
      }

      return undefined;
    }
    case 'SPLUNK_GRAPHQL_RESOLVE_SPANS_ENABLED': {
      return config.splunk?.general?.js?.graphql_resolve_spans_enabled === true;
    }
    default: {
      const prefix = 'OTEL_INSTRUMENTATION_';
      const suffix = '_ENABLED';
      if (key.startsWith(prefix) && key.endsWith(suffix)) {
        const shortName = key
          .substring(prefix.length, key.length - suffix.length)
          .toLowerCase();

        for (const instr of bundledInstrumentations) {
          if (instr.shortName === shortName) {
          }
        }
      }

      console.log('unhandled config translation for key', key);
      return undefined;
    }
  }
}

function resourceFromString(resourceString: string): Resource {
  const values = resourceString.split(',');

  const attributes: Record<string, string> = {};
  for (const s of values) {
    const assignment = s.trim().split('=');

    if (assignment.length == 2) {
      const [k, v] = assignment;
      attributes[k] = v;
    }
  }

  return resourceFromAttributes(attributes);
}

function valueFromConfigAttributeNameValue(
  attr: ConfigAttributeNameValue
): string | boolean | number | string[] | number[] | boolean[] {
  switch (attr.type) {
    case 'string': {
      if (typeof attr.value === 'string') {
        return attr.value;
      }
      break;
    }
    case 'int':
    case 'double': {
      if (typeof attr.value === 'number') {
        return attr.value;
      }
      break;
    }
    case 'bool': {
      if (typeof attr.value === 'boolean') {
        return attr.value;
      }
      break;
    }
    case 'string_array': {
      if (Array.isArray(attr.value)) {
        const values: string[] = [];

        for (const v of attr.value) {
          values.push(String(v));
        }

        return values;
      }

      break;
    }
    case 'double_array':
    case 'int_array': {
      if (Array.isArray(attr.value)) {
        const values: number[] = [];

        for (const v of attr.value) {
          values.push(Number(v));
        }

        return values;
      }

      break;
    }
    case 'bool_array': {
      if (Array.isArray(attr.value)) {
        const values: boolean[] = [];

        for (const v of attr.value) {
          values.push(Boolean(v));
        }

        return values;
      }

      break;
    }
    default:
      return String(attr.value);
  }

  return String(attr.value);
}

function resourceFromConfigAttributes(
  configAttributes: ConfigResource['attributes']
): Resource {
  if (configAttributes === undefined || configAttributes === null) {
    return emptyResource();
  }

  const attributes: Record<string, AttributeValue> = {};

  for (const attr of configAttributes) {
    attributes[attr.name] = valueFromConfigAttributeNameValue(attr);
  }

  return resourceFromAttributes(attributes);
}

export function configGetResource(): Resource {
  if (globalConfiguration === undefined) {
    return emptyResource();
  }

  const configResource = globalConfiguration.resource;

  if (isNil(configResource)) {
    return emptyResource();
  }

  const attributesListResource = resourceFromString(
    configResource?.attributes_list || ''
  );
  const attributesResource = resourceFromConfigAttributes(
    configResource?.attributes
  );

  return attributesListResource.merge(attributesResource);
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

function makeRootSampler(sampler: ConfigParentBasedSampler['root']): Sampler {
  if (sampler === undefined) {
    return new AlwaysOnSampler();
  }

  if (sampler.always_on !== undefined) {
    return new AlwaysOnSampler();
  }

  if (sampler.always_off !== undefined) {
    return new AlwaysOffSampler();
  }

  if (sampler.trace_id_ratio_based !== undefined) {
    const ratioBased = sampler.trace_id_ratio_based;
    return new TraceIdRatioBasedSampler(ratioBased.ratio ?? undefined);
  }

  return new AlwaysOnSampler();
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

    return new ParentBasedSampler({
      root: makeRootSampler(parentBased.root),
    });
  }

  if (sampler.trace_id_ratio_based !== undefined) {
    const ratioBased = sampler.trace_id_ratio_based;
    return new TraceIdRatioBasedSampler(ratioBased.ratio ?? undefined);
  }

  // TODO: Should composite/development be supported?
  return undefined;
}

export function getConfigLogger() {
  return globalConfiguration?.logger_provider;
}

export function getConfigTracerProvider() {
  return globalConfiguration?.tracer_provider;
}

export function getConfigMeterProvider() {
  return globalConfiguration?.meter_provider;
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

export function getConfigBoolean(key: EnvVarKey, defaultValue = true): boolean {
  if (globalConfiguration === undefined) {
    return getEnvBoolean(key, defaultValue);
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

export function getConfigNumber(
  key: EnvVarKey | EnvVarKey[],
  defaultValue: number
): number {
  if (globalConfiguration === undefined) {
    return getEnvNumber(key, defaultValue);
  }

  let value;

  if (Array.isArray(key)) {
    for (const k of key) {
      value = fetchConfigValue(k, globalConfiguration);

      if (value !== undefined) {
        break;
      }
    }
  } else {
    value = fetchConfigValue(key, globalConfiguration);
  }

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
    return getEnvArray(key);
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

function isNil<T>(v: T | undefined | null): boolean {
  return v === undefined || v === null;
}
