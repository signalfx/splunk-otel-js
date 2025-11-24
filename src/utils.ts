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

import { strict as assert } from 'assert';
import { diag, DiagLogLevel } from '@opentelemetry/api';
import type { EnvVarKey, LogLevel } from './types';
import { resolve } from 'path';
import * as fs from 'fs';

export type ConfigCache = Map<string, string>;

const configCache: ConfigCache = new Map();

export function findServiceName(
  cache: ConfigCache = configCache
): string | undefined {
  const cacheKey = 'package.name';

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }

  const pkgPath = resolve(process.cwd(), 'package.json');

  try {
    const content = fs.readFileSync(pkgPath, { encoding: 'utf8' });
    const pkg = JSON.parse(content);
    const name = pkg['name'];
    if (typeof name === 'string') {
      cache.set(cacheKey, name);
      return name;
    }
  } catch (e) {
    diag.debug(`Error reading ${pkgPath}`, e);
  }

  return undefined;
}

export function defaultServiceName(cache: ConfigCache = configCache): string {
  return findServiceName(cache) || 'unnamed-node-service';
}

export function _getNonEmptyEnvVar(key: EnvVarKey): string | undefined {
  const value = process.env[key];

  if (value !== undefined) {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      diag.warn(
        `Defined, but empty environment variable: '${key}'. The value will be considered as undefined.`
      );
      return undefined;
    }

    return trimmed;
  }

  return value;
}

export function parseEnvBooleanString(value?: string) {
  if (typeof value !== 'string') {
    return value;
  }

  value = value.trim().toLowerCase();

  if (!value || ['false', 'no', 'n', '0'].indexOf(value) >= 0) {
    return false;
  }

  if (['true', 'yes', 'y', '1'].indexOf(value) >= 0) {
    return true;
  }

  throw new Error(`Invalid string representing boolean: ${value}`);
}

export function _getEnvBoolean(key: EnvVarKey, defaultValue = true): boolean {
  const value = _getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  if (['false', 'no', '0'].indexOf(value.trim().toLowerCase()) >= 0) {
    return false;
  }

  return true;
}

export function _getEnvNumber(key: EnvVarKey | EnvVarKey[], defaultValue: number): number {
  const value = Array.isArray(key)
    ? _getEnvValueByPrecedence(key)
    : _getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  const numberValue = parseFloat(value);

  if (isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}

export function deduplicate(arr: string[]) {
  return [...new Set(arr)];
}

export function _getEnvArray(key: EnvVarKey): string[] | undefined {
  const value = _getNonEmptyEnvVar(key);

  if (value === undefined) {
    return undefined;
  }

  return deduplicate(value.split(',')).map((v) => v.trim());
}

export function _getEnvValueByPrecedence(
  keys: EnvVarKey[],
  defaultValue?: string
): string | undefined {
  for (const key of keys) {
    const value = _getNonEmptyEnvVar(key);

    if (value !== undefined) {
      return value;
    }
  }

  return defaultValue;
}

const formatStringSet = (set: Set<string> | string[]) => {
  return [...set.values()].map((item) => `"${item}"`).join(', ');
};

export function assertNoExtraneousProperties(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: Record<string, any>,
  expectedProps: string[]
) {
  const keys = new Set(Object.keys(obj));
  for (const p of expectedProps) {
    keys.delete(p);
  }

  assert.equal(
    keys.size,
    0,
    `Unexpected configuration options: ${formatStringSet(
      keys
    )}. Allowed: ${formatStringSet(expectedProps)}`
  );
}

function validLogLevel(level: string): level is LogLevel {
  return ['verbose', 'debug', 'info', 'warn', 'error'].includes(level);
}

export function toDiagLogLevel(level: LogLevel): DiagLogLevel {
  switch (level) {
    case 'verbose':
      return DiagLogLevel.VERBOSE;
    case 'debug':
      return DiagLogLevel.DEBUG;
    case 'info':
      return DiagLogLevel.INFO;
    case 'warn':
      return DiagLogLevel.WARN;
    case 'error':
      return DiagLogLevel.ERROR;
  }

  return DiagLogLevel.NONE;
}

export function parseLogLevel(value: string | null | undefined): DiagLogLevel {
  if (value === undefined || value === null) {
    return DiagLogLevel.NONE;
  }

  const v = value.trim().toLowerCase();

  if (validLogLevel(v)) {
    return toDiagLogLevel(v);
  }

  return DiagLogLevel.NONE;
}

function constructUrl(url: string): URL | undefined {
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}

export function ensureResourcePath(
  url: string | undefined,
  resourcePath: string
): string | undefined {
  if (url === undefined) {
    return undefined;
  }

  const validUrl = constructUrl(url);

  if (validUrl === undefined) {
    diag.error(`Invalid URL: ${url}`);
    return undefined;
  }

  if (validUrl.pathname === '/') {
    diag.debug(
      `Appending path ${resourcePath} to ${url} due to resource path not set.`
    );
    validUrl.pathname = resourcePath;
    return validUrl.toString();
  }

  return url;
}

export function listEnvVars() {
  return [
    {
      name: 'OTEL_BSP_SCHEDULE_DELAY',
      property: '',
      description:
        'The delay in milliseconds between 2 consecutive bath span processor exports.',
      default: '5000',
      type: 'number',
      category: 'instrumentation',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_CERTIFICATE',
      property: '',
      description:
        "Path to a certificate to use when verifying a server's TLS credentials.",
      default: '',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE',
      property: '',
      description:
        "Path to a certificate to use when verifying a client's TLS credentials.",
      default: '',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_CLIENT_KEY',
      property: '',
      description:
        "Path to client's private key to use in mTLS communication in PEM format.",
      default: '',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
      property: 'endpoint',
      description: 'The OTLP endpoint to export to.',
      default: 'http://localhost:4318',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_TRACES_PROTOCOL',
      property: '',
      description:
        'Chooses the trace exporter protocol. Allowed values are grpc and http/protobuf',
      default: 'http/protobuf',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_METRICS_PROTOCOL',
      property: 'metrics.metricReaderFactory',
      description:
        'Chooses the metric exporter protocol. Allowed values are grpc and http/protobuf',
      default: 'http/protobuf',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_PROTOCOL',
      property: '',
      description: 'The protocol to use for OTLP exports.',
      default: 'http/protobuf',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
      property: '',
      description: 'The traces OTLP endpoint to export to.',
      default: 'http://localhost:4318',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED',
      property: '',
      description:
        'Whether to activate all the embedded instrumentations. When you set this setting to false, use OTEL_INSTRUMENTATION_<NAME>_ENABLED=true to selectively turn on instrumentations.',
      default: 'true',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'OTEL_INSTRUMENTATION_<NAME>_ENABLED',
      property: '',
      description:
        'When set to true, this setting activates a specific instrumentation, as defined by replacing <NAME> with the name of the instrumentation. The name is not case sensitive.',
      default: 'true',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'OTEL_LOG_LEVEL',
      property: 'logLevel',
      description:
        'Log level for the OpenTelemetry diagnostic console logger. To activate debug logging, set the debug value. Available values are error, info, debug, and verbose.',
      default: 'none',
      type: 'string',
      category: 'general',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
      property: 'metrics.endpoint',
      description:
        'The metrics endpoint. Takes precedence over the value set in OTEL_EXPORTER_OTLP_ENDPOINT.',
      default: 'https://ingest.<realm>.signalfx.com/v2/datapoint/otlp',
      type: 'number',
      category: 'metrics',
    },
    {
      name: 'OTEL_METRIC_EXPORT_INTERVAL',
      property: 'metrics.exportIntervalMillis',
      description:
        'The interval, in milliseconds, of metrics collection and exporting.',
      default: '30000',
      type: 'number',
      category: 'metrics',
    },
    {
      name: 'OTEL_METRICS_EXPORTER',
      property: 'metrics.metricReaderFactory',
      description:
        'Comma-separated list of metrics exporter to use. To output to the console, set the variable to console. If set to none, metric exports are turned off.',
      default: 'otlp',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_PROPAGATORS',
      property: 'tracing.propagators',
      description: 'Comma-separated list of propagators you want to use.',
      default: 'tracecontext,baggage',
      type: 'string',
      category: 'propagator',
    },
    {
      name: 'OTEL_SERVICE_NAME',
      property: 'serviceName',
      description:
        'Name of the service or application you’re instrumenting. Takes precedence over the service name defined in the OTEL_RESOURCE_ATTRIBUTES variable.',
      default: 'unnamed-node-service',
      type: 'string',
      category: 'general',
    },
    {
      name: 'OTEL_TRACES_EXPORTER',
      property: 'tracing.spanExporterFactory',
      description:
        'Comma-separated list of trace exporters to use. To output to the console, set the variable to console.',
      default: 'otlp',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'SPLUNK_ACCESS_TOKEN',
      property: 'accessToken',
      description:
        'A Splunk authentication token that lets exporters send data directly to Splunk Observability Cloud. Required if you need to send data to the Splunk Observability Cloud ingest endpoint.',
      default: '',
      type: 'string',
      category: 'general',
    },
    {
      name: 'SPLUNK_INSTRUMENTATION_METRICS_ENABLED',
      property: '',
      description:
        'Emit metrics from instrumentation (for example, http.server.duration)',
      default: 'false',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_METRICS_ENABLED',
      property: 'Activated by calling start()',
      description: 'Activates metrics collection.',
      default: 'false',
      type: 'boolean',
      category: 'metrics',
    },
    {
      name: 'SPLUNK_PROFILER_ENABLED',
      property: 'profilingEnabled',
      description: 'Activates AlwaysOn CPU profiling.',
      default: 'false',
      type: 'boolean',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_PROFILER_LOGS_ENDPOINT',
      property: 'profiling.endpoint',
      description: 'The collector endpoint for profiler logs.',
      default: 'http://localhost:4318',
      type: 'string',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_PROFILER_MEMORY_ENABLED',
      property: 'profiling.memoryProfilingEnabled',
      description: 'Activates memory profiling for AlwaysOn Profiling.',
      default: 'false',
      type: 'string',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_PROFILER_CALL_STACK_INTERVAL',
      property: 'profiling.callstackInterval',
      description:
        'Frequency with which call stacks are sampled, in milliseconds.',
      default: '1000',
      type: 'number',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_REALM',
      property: 'realm',
      description:
        'The name of your organization’s realm, for example, us0. When you set the realm, telemetry is sent directly to the ingest endpoint of Splunk Observability Cloud, bypassing the Splunk Distribution of OpenTelemetry Collector.',
      default: '',
      type: 'string',
      category: 'general',
    },
    {
      name: 'SPLUNK_REDIS_INCLUDE_COMMAND_ARGS',
      property: '',
      description:
        'Whether to include the full Redis query in db.statement span attributes when using the Redis instrumentation.',
      default: 'false',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_GRAPHQL_RESOLVE_SPANS_ENABLED',
      property: '',
      description:
        'Starting from version 2.7.0 of the instrumentation, GraphQL spans for resolvers are no longer generated. To collect resolve spans, set this environment variable to true. The default value is false.',
      default: 'false',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL',
      property: 'metrics.runtimeMetricsCollectionIntervalMillis',
      description:
        'The interval, in milliseconds, during which GC and event loop statistics are collected.',
      default: '5000',
      type: 'number',
      category: 'metrics',
    },
    {
      name: 'SPLUNK_RUNTIME_METRICS_ENABLED',
      property: 'metrics.runtimeMetricsEnabled',
      description:
        'Activates the collection and export of runtime metrics. Runtime metrics are only sent if the SPLUNK_METRICS_ENABLED environment variable is set to true or if memory profiling is activated.',
      default: 'true',
      type: 'boolean',
      category: 'metrics',
    },
    {
      name: 'SPLUNK_DEBUG_METRICS_ENABLED',
      property: 'metrics.debugMetricsEnabled',
      description:
        'Activates the collection and export of internal debug metrics for troubleshooting. Debug metrics are only sent if the SPLUNK_METRICS_ENABLED environment variable is set to true.',
      default: 'true',
      type: 'boolean',
      category: 'metrics',
    },
    {
      name: 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED',
      property: 'tracing.serverTimingEnabled',
      description:
        'Activates the addition of server trace information to HTTP response headers.',
      default: 'true',
      type: 'boolean',
      category: 'general',
    },
    {
      name: 'SPLUNK_TRACING_ENABLED',
      property: '',
      description: 'Enables tracing.',
      default: 'true',
      type: 'boolean',
      category: 'instrumentation',
    },
  ];
}
