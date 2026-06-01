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
  getEnvValueByPrecedence,
  getNonEmptyEnvVar,
} from './utils';
import { EnvVarKey } from './types';
import {
  AttributeNameValue,
  AttributeNameValue as ConfigAttributeNameValue,
  Resource as ConfigResource,
  OpenTelemetryConfiguration,
  Sampler as ConfigSchemaSampler,
} from './configuration/schema';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import { Sampler } from '@opentelemetry/sdk-trace-base';
import { parseDocument, stringify as stringifyYaml, visit } from 'yaml';
import { bundledInstrumentations } from './instrumentations';
import {
  emptyResource,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { AttributeValue } from '@opentelemetry/api';
import { convertSubstitution, envSubstitute } from './configuration/substitute';
import { getEffectiveState } from './opamp/effective-state';

type ConfigSampler = ConfigSchemaSampler;

export type SplunkConfiguration = {
  use_bundled_instrumentations?: boolean;
  package_name_filter?: string[];
  general?: {
    js?: {
      nextjs_cardinality_reduction?: boolean;
    } | null;
  } | null;
  runtime_metrics?: {
    collection_interval?: number;
  } | null;
  debug_metrics_enabled?: boolean;
  // TODO: Proper types for this one (instrumentation shortnames)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instrumentations?: any;
  profiling?: {
    exporter?: {
      otlp_log_http?: {
        endpoint?: string | null;
      };
    };
    always_on?: {
      cpu_profiler?: {
        sampling_interval?: number;
        collection_interval?: number;
      };
      memory_profiler?: {
        max_stack_depth?: number;
      } | null;
    };
    callgraphs?: {
      sampling_interval?: number;
      selection_probability?: number;
    } | null;
  };
  opamp?: {
    endpoint?: string | null;
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

export function loadConfiguration(content: string): DistroConfiguration {
  const doc = parseDocument(content);

  if (doc.errors.length > 0) {
    throw doc.errors[0];
  }

  visit(doc, {
    Scalar: (key, node) => {
      if (key !== 'value') {
        return undefined;
      }

      const value = node.value;
      if (typeof value === 'string') {
        const sub = envSubstitute(value, (key) => process.env[key]);

        if (node.type !== 'QUOTE_DOUBLE') {
          node.value = convertSubstitution(sub);
        } else {
          node.value = sub;
        }
      }

      return undefined;
    },
  });

  rawGlobalConfiguration = doc.toString();

  return doc.toJS();
}

let globalConfiguration: DistroConfiguration | undefined;
let rawGlobalConfiguration: string | undefined;

export function setGlobalConfiguration(config: DistroConfiguration) {
  globalConfiguration = config;
}

// Test-only: clears the loaded declarative configuration state so the next
// getLoadedConfigurationString() call reverts to the environment format.
export function resetConfiguration() {
  globalConfiguration = undefined;
  rawGlobalConfiguration = undefined;
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
): Record<string, unknown> | undefined {
  const conf = splunkConfig(config)?.instrumentations?.[instrumentationName];

  if (conf === null || typeof conf !== 'object') {
    return undefined;
  }

  return conf as Record<string, unknown>;
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
    case 'OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.event_attribute_count_limit;
    }
    case 'OTEL_LINK_ATTRIBUTE_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.link_attribute_count_limit;
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
    case 'OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.attribute_count_limit;
    }
    case 'OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT': {
      return config.tracer_provider?.limits?.attribute_value_length_limit;
    }
    case 'OTEL_SPAN_EVENT_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.event_count_limit;
    }
    case 'OTEL_SPAN_LINK_COUNT_LIMIT': {
      return config.tracer_provider?.limits?.link_count_limit;
    }
    case 'SPLUNK_AUTOINSTRUMENT_PACKAGE_NAMES': {
      const filter = splunkConfig(config)?.package_name_filter;

      if (Array.isArray(filter)) {
        return filter.map((v) => String(v));
      }

      return undefined;
    }
    case 'SPLUNK_AUTOMATIC_LOG_COLLECTION': {
      return config.logger_provider !== undefined;
    }
    case 'SPLUNK_DEBUG_METRICS_ENABLED': {
      return splunkConfig(config)?.debug_metrics_enabled;
    }
    case 'SPLUNK_INSTRUMENTATION_METRICS_ENABLED': // TODO: Is this env var actually necessary?
    case 'SPLUNK_METRICS_ENABLED': {
      return config.meter_provider !== undefined;
    }
    case 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED': {
      return splunkConfig(config)?.use_bundled_instrumentations;
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
      const endpoint =
        splunkConfig(config)?.profiling?.exporter?.otlp_log_http?.endpoint;

      if (typeof endpoint === 'string') {
        return endpoint;
      }

      return undefined;
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_ENABLED': {
      return splunkConfig(config)?.profiling?.callgraphs !== undefined;
    }
    case 'SPLUNK_PROFILER_CALL_STACK_INTERVAL': {
      return splunkConfig(config)?.profiling?.always_on?.cpu_profiler
        ?.sampling_interval;
    }
    case 'SPLUNK_CPU_PROFILER_COLLECTION_INTERVAL': {
      return splunkConfig(config)?.profiling?.always_on?.cpu_profiler
        ?.collection_interval;
    }
    case 'SPLUNK_PROFILER_MEMORY_ENABLED': {
      return (
        splunkConfig(config)?.profiling?.always_on?.memory_profiler !==
        undefined
      );
    }
    case 'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL': {
      return splunkConfig(config)?.profiling?.callgraphs?.sampling_interval;
    }
    case 'SPLUNK_SNAPSHOT_SELECTION_PROBABILITY':
    case 'SPLUNK_SNAPSHOT_SELECTION_RATE': {
      return splunkConfig(config)?.profiling?.callgraphs?.selection_probability;
    }
    case 'SPLUNK_REALM': {
      return undefined;
    }
    case 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED': {
      const httpConf = getInstrumentationConf(config, 'http');

      const value = httpConf?.['trace_response_header_enabled'];

      if (typeof value === 'boolean') {
        return value;
      }

      return undefined;
    }
    case 'OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT': {
      return config?.logger_provider?.limits?.attribute_count_limit;
    }
    case 'OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT': {
      return config?.logger_provider?.limits?.attribute_value_length_limit;
    }
    case 'SPLUNK_TRACING_ENABLED': {
      return config.tracer_provider !== undefined;
    }
    case 'SPLUNK_NEXTJS_FIX_ENABLED': {
      return (
        splunkConfig(config)?.general?.js?.nextjs_cardinality_reduction === true
      );
    }
    case 'SPLUNK_OPAMP_ENABLED': {
      return splunkConfig(config)?.opamp !== undefined;
    }
    case 'SPLUNK_OPAMP_ENDPOINT': {
      return splunkConfig(config)?.opamp?.endpoint;
    }
    case 'SPLUNK_ACCESS_TOKEN': {
      return undefined;
    }
    case 'SPLUNK_RUNTIME_METRICS_ENABLED': {
      return splunkConfig(config)?.runtime_metrics !== undefined;
    }
    case 'SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL': {
      return splunkConfig(config)?.runtime_metrics?.collection_interval;
    }
    case 'SPLUNK_REDIS_INCLUDE_COMMAND_ARGS': {
      const redisConf = getInstrumentationConf(config, 'redis');

      const value = redisConf?.['include_command_args'];

      if (typeof value === 'boolean') {
        return value;
      }

      return undefined;
    }
    case 'SPLUNK_GRAPHQL_RESOLVE_SPANS_ENABLED': {
      const conf = getInstrumentationConf(config, 'graphql');

      const value = conf?.['resolve_spans_enabled'];

      if (typeof value === 'boolean') {
        return value;
      }

      return undefined;
    }
    default: {
      const instrumentationPrefix = 'OTEL_INSTRUMENTATION_';
      const instrumentationSuffix = '_ENABLED';
      if (
        key.startsWith(instrumentationPrefix) &&
        key.endsWith(instrumentationSuffix)
      ) {
        const shortName = key
          .substring(
            instrumentationPrefix.length,
            key.length - instrumentationSuffix.length
          )
          .toLowerCase();

        for (const instr of bundledInstrumentations) {
          if (instr.shortName === shortName) {
            const instrumentation =
              splunkConfig(config)?.instrumentations?.[shortName];

            if (
              instrumentation !== null &&
              typeof instrumentation === 'object' &&
              instrumentation['disabled'] === true
            ) {
              return false;
            }

            return instr.disabledByDefault !== true;
          }
        }
      }

      return undefined;
    }
  }
}

function resourceFromString(resourceString: string): Resource {
  const values = resourceString.split(',');

  const attributes: Record<string, string> = {};
  for (const s of values) {
    const assignment = s.trim().split('=');

    if (assignment.length === 2) {
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

export function configGetUriParameterCapture(): string[] {
  if (globalConfiguration === undefined) {
    return [];
  }

  const capture = getInstrumentationConf(globalConfiguration, 'http')?.[
    'capture_uri_parameters'
  ];

  if (Array.isArray(capture)) {
    return capture.map((v) => String(v));
  }

  return [];
}

function makeSampler(sampler: ConfigSampler | undefined): Sampler | undefined {
  if (sampler === null || sampler === undefined) {
    return undefined;
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

  // TODO: Support probability based sampler once available in OTel.

  return undefined;
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
      root: makeSampler(parentBased.root) || new AlwaysOnSampler(),
      remoteParentSampled: makeSampler(parentBased.remote_parent_sampled),
      remoteParentNotSampled: makeSampler(
        parentBased.remote_parent_not_sampled
      ),
      localParentSampled: makeSampler(parentBased.local_parent_sampled),
      localParentNotSampled: makeSampler(parentBased.local_parent_not_sampled),
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

// Resolves the effective OTLP exporter endpoint for a signal as reported in the
// effective environment config. Mirrors the precedence used by the exporter
// factories (signal-specific endpoint, then the shared OTLP endpoint, then the
// realm-based Splunk ingest URL). The trailing resource path (e.g. /v1/traces)
// is appended downstream inside the OTLP exporter, so it is intentionally not
// reproduced here; this is the resolved base endpoint, not the final URL.
function resolveOtlpEndpoint(
  signalEnvKey: EnvVarKey,
  realmPath: string
): string | null {
  const explicit = getEnvValueByPrecedence([
    signalEnvKey,
    'OTEL_EXPORTER_OTLP_ENDPOINT',
  ]);

  if (explicit !== undefined) {
    return explicit;
  }

  const realm = getNonEmptyConfigVar('SPLUNK_REALM');
  if (realm !== undefined) {
    return `https://ingest.${realm}.observability.splunkcloud.com${realmPath}`;
  }

  return null;
}

function quoteEnvValue(value: string | number | boolean | null): string {
  return value === null ? 'null' : String(value);
}

// Builds the "Effective Environment Config" body mandated by the GDI
// specification (specification/opamp_datamodel.md). Only the required keys are
// reported. Each value reflects what is actually in effect at runtime: values
// reported by the components as they start (the effective-state holder) are
// preferred, since those capture programmatic options and runtime outcomes
// (e.g. the profiler failing to load). Anything not yet reported falls back to
// the distro's own configuration resolution so defaults are still applied.
function getEffectiveEnvironmentConfig(): string {
  const state = getEffectiveState();

  const entries: Array<[string, string | number | boolean | null]> = [
    [
      'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
      state.tracesEndpoint ??
        resolveOtlpEndpoint(
          'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
          '/v2/trace/otlp'
        ),
    ],
    [
      'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
      state.metricsEndpoint ??
        resolveOtlpEndpoint(
          'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
          '/v2/datapoint/otlp'
        ),
    ],
    [
      'OTEL_EXPORTER_OTLP_LOGS_ENDPOINT',
      // Logs have no realm-based default; they fall back to the local
      // collector default resolved inside the exporter, so report null when
      // unset rather than fabricating an endpoint here.
      state.logsEndpoint ??
        getEnvValueByPrecedence([
          'OTEL_EXPORTER_OTLP_LOGS_ENDPOINT',
          'OTEL_EXPORTER_OTLP_ENDPOINT',
        ]) ??
        null,
    ],
    [
      'SPLUNK_PROFILER_ENABLED',
      state.profilerEnabled ??
        getConfigBoolean('SPLUNK_PROFILER_ENABLED', false),
    ],
    [
      'SPLUNK_PROFILER_MEMORY_ENABLED',
      state.memoryProfilerEnabled ??
        getConfigBoolean('SPLUNK_PROFILER_MEMORY_ENABLED', false),
    ],
    [
      'SPLUNK_SNAPSHOT_PROFILER_ENABLED',
      state.snapshotProfilerEnabled ??
        getConfigBoolean('SPLUNK_SNAPSHOT_PROFILER_ENABLED', false),
    ],
    [
      'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL',
      state.snapshotSamplingInterval ??
        getConfigNumber('SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL', 1),
    ],
    [
      'SPLUNK_PROFILER_CALL_STACK_INTERVAL',
      state.callStackInterval ??
        getConfigNumber('SPLUNK_PROFILER_CALL_STACK_INTERVAL', 1000),
    ],
    // In the pure-environment case there is, by definition, no declarative
    // config file, so both config-file keys report null.
    ['OTEL_CONFIG_FILE', null],
    ['OTEL_EXPERIMENTAL_CONFIG_FILE', null],
  ];

  return entries.map(([k, v]) => `${k}=${quoteEnvValue(v)}`).join('\n');
}

type SignalName = 'traces' | 'metrics' | 'logs';

// Default OTLP/HTTP endpoints used by the SDK exporters when a declarative
// config declares an exporter but omits the endpoint. Reported so the
// effective declarative config reflects the value actually in effect (C7).
const OTLP_HTTP_DEFAULT_ENDPOINTS: Record<SignalName, string> = {
  traces: 'http://localhost:4318/v1/traces',
  metrics: 'http://localhost:4318/v1/metrics',
  logs: 'http://localhost:4318/v1/logs',
};

// Projects a declarative exporter block down to just its endpoint, supplying
// the OTLP/HTTP default when an otlp_http exporter omits the endpoint. Returns
// undefined when no OTLP exporter is present.
function projectExporterEndpoint(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exporter: any,
  signal: SignalName
): Record<string, { endpoint: string | null }> | undefined {
  if (exporter === null || typeof exporter !== 'object') {
    return undefined;
  }

  const out: Record<string, { endpoint: string | null }> = {};

  for (const kind of ['otlp_http', 'otlp_grpc'] as const) {
    const ex = exporter[kind];
    if (ex === undefined) {
      continue;
    }

    const endpoint =
      ex?.endpoint ??
      (kind === 'otlp_http' ? OTLP_HTTP_DEFAULT_ENDPOINTS[signal] : null);
    out[kind] = { endpoint: endpoint ?? null };
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

// Projects a span/log record processor (batch|simple) to a minimal form that
// keeps only the exporter endpoint(s). All active exporters are reported (C9).
function projectSignalProcessor(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processor: any,
  signal: SignalName
): Record<string, object> | undefined {
  if (processor === null || typeof processor !== 'object') {
    return undefined;
  }

  const out: Record<string, object> = {};

  for (const procType of ['batch', 'simple'] as const) {
    const exporter = projectExporterEndpoint(
      processor[procType]?.exporter,
      signal
    );
    if (exporter !== undefined) {
      out[procType] = { exporter };
    }
  }

  return Object.keys(out).length > 0 ? out : undefined;
}

function projectProcessorList(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  processors: any,
  signal: SignalName
): object | undefined {
  if (!Array.isArray(processors)) {
    return undefined;
  }

  const projected = processors
    .map((p) => projectSignalProcessor(p, signal))
    .filter((p): p is Record<string, object> => p !== undefined);

  return projected.length > 0 ? { processors: projected } : undefined;
}

function projectMeterProvider(config: DistroConfiguration): object | undefined {
  const readers = config.meter_provider?.readers;
  if (!Array.isArray(readers)) {
    return undefined;
  }

  const projected = readers
    .map((reader) => {
      const exporter = projectExporterEndpoint(
        reader?.periodic?.exporter,
        'metrics'
      );
      return exporter !== undefined ? { periodic: { exporter } } : undefined;
    })
    .filter((r) => r !== undefined);

  return projected.length > 0 ? { readers: projected } : undefined;
}

// Projects the Splunk profiling config. Presence implies enabled (C6); absent
// features are omitted, which the spec treats as disabled. Where a component
// reported its actual runtime outcome (e.g. the profiler failed to load), that
// outcome wins over what the file declared (spec B7): a feature that did not
// actually start is dropped from the report.
function projectProfiling(config: DistroConfiguration): object | undefined {
  const profiling = splunkConfig(config)?.profiling;
  if (profiling === undefined) {
    return undefined;
  }

  const state = getEffectiveState();

  const alwaysOn: Record<string, unknown> = {};
  const cpuProfiler = profiling.always_on?.cpu_profiler;
  // A configured cpu_profiler implies always-on profiling is enabled, unless a
  // component reported that it did not actually start.
  if (cpuProfiler !== undefined && state.profilerEnabled !== false) {
    alwaysOn.cpu_profiler = {
      // Prefer the interval the profiler actually started with; otherwise fill
      // the default sampling interval when omitted from the file (C7).
      sampling_interval:
        state.callStackInterval ?? cpuProfiler?.sampling_interval ?? 1000,
    };
  }
  if (
    profiling.always_on?.memory_profiler !== undefined &&
    state.memoryProfilerEnabled !== false &&
    state.profilerEnabled !== false
  ) {
    alwaysOn.memory_profiler = profiling.always_on.memory_profiler;
  }

  const profilingOut: Record<string, unknown> = {};
  if (Object.keys(alwaysOn).length > 0) {
    profilingOut.always_on = alwaysOn;
  }
  if (
    profiling.callgraphs !== undefined &&
    profiling.callgraphs !== null &&
    state.snapshotProfilerEnabled !== false
  ) {
    profilingOut.callgraphs = {
      sampling_interval:
        state.snapshotSamplingInterval ??
        profiling.callgraphs.sampling_interval,
    };
  }

  return Object.keys(profilingOut).length > 0
    ? { splunk: { profiling: profilingOut } }
    : undefined;
}

// Builds the "Effective Declarative Config" body mandated by the GDI
// specification (specification/opamp_datamodel.md): a minimal, filtered view of
// the loaded declarative config containing only the required fields. Values are
// sourced from the already env-substituted globalConfiguration, so config
// templates are reported as their evaluated values (C8).
function getEffectiveDeclarativeConfig(): string {
  const config = globalConfiguration ?? ({} as DistroConfiguration);

  const tracerProvider = projectProcessorList(
    config.tracer_provider?.processors,
    'traces'
  );
  const meterProvider = projectMeterProvider(config);
  const loggerProvider = projectProcessorList(
    config.logger_provider?.processors,
    'logs'
  );
  const distribution = projectProfiling(config);

  // The config-file paths are environment variables that point at the loaded
  // file, not fields within the declarative config itself, so read them from
  // the environment directly rather than via the config object.
  const doc: Record<string, unknown> = {
    otel_config_file: getNonEmptyEnvVar('OTEL_CONFIG_FILE') ?? null,
    otel_experimental_config_file:
      getNonEmptyEnvVar('OTEL_EXPERIMENTAL_CONFIG_FILE') ?? null,
  };

  if (tracerProvider !== undefined) {
    doc.tracer_provider = tracerProvider;
  }
  if (meterProvider !== undefined) {
    doc.meter_provider = meterProvider;
  }
  if (loggerProvider !== undefined) {
    doc.logger_provider = loggerProvider;
  }
  if (distribution !== undefined) {
    doc.distribution = distribution;
  }

  return stringifyYaml(doc);
}

// The AgentConfigFile name for the declarative format must match the loaded
// config filename including path (OTEL_CONFIG_FILE). The distro currently reads
// the file via OTEL_EXPERIMENTAL_CONFIG_FILE, so fall back to that; a defaulted
// name must still be provided per spec.
function effectiveDeclarativeConfigName(): string {
  return (
    getNonEmptyEnvVar('OTEL_CONFIG_FILE') ??
    getNonEmptyEnvVar('OTEL_EXPERIMENTAL_CONFIG_FILE') ??
    'config.yaml'
  );
}

export function getLoadedConfigurationString(): {
  type: 'yaml' | 'env';
  name: string;
  content: string;
} {
  if (rawGlobalConfiguration !== undefined) {
    return {
      type: 'yaml',
      name: effectiveDeclarativeConfigName(),
      content: getEffectiveDeclarativeConfig(),
    };
  }

  return {
    type: 'env',
    name: 'environment',
    content: getEffectiveEnvironmentConfig(),
  };
}
