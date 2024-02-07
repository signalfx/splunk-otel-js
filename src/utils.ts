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

export function getNonEmptyEnvVar(key: EnvVarKey): string | undefined {
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

export function getEnvBoolean(key: EnvVarKey, defaultValue = true) {
  const value = getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  if (['false', 'no', '0'].indexOf(value.trim().toLowerCase()) >= 0) {
    return false;
  }

  return true;
}

export function getEnvNumber(key: EnvVarKey, defaultValue: number): number {
  const value = getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  const numberValue = parseInt(value);

  if (isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}

export function deduplicate(arr: string[]) {
  return [...new Set(arr)];
}

export function getEnvArray(key: EnvVarKey, defaultValue: string[]): string[] {
  const value = getNonEmptyEnvVar(key);

  if (value === undefined) {
    return defaultValue;
  }

  return deduplicate(value.split(',')).map((v) => v.trim());
}

export function getEnvValueByPrecedence(
  keys: EnvVarKey[],
  defaultValue?: string
): string | undefined {
  for (const key of keys) {
    const value = getNonEmptyEnvVar(key);

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

export function parseLogLevel(value: string | undefined): DiagLogLevel {
  if (value === undefined) {
    return DiagLogLevel.NONE;
  }

  const v = value.trim().toLowerCase();

  if (validLogLevel(v)) {
    return toDiagLogLevel(v);
  }

  return DiagLogLevel.NONE;
}

export function pick<T extends Record<string, any>, K extends string>(
  obj: T,
  keys: readonly K[]
): { [P in keyof T as P extends K ? P : never]: T[P] } {
  const result = {} as any;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function listEnvVars() {
  return [
    {
      name: 'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT',
      description: 'Maximum allowed attribute value size',
      default: '12000',
      type: 'number',
      category: 'instrumentation',
    },
    {
      name: 'OTEL_BSP_SCHEDULE_DELAY',
      description:
        'The delay in milliseconds between 2 consecutive bath span processor exports.',
      default: '500',
      type: 'number',
      category: 'instrumentation',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_CERTIFICATE',
      description:
        "Path to a certificate to use when verifying a server's TLS credentials.",
      default: '',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE',
      description:
        "Path to a certificate to use when verifying a client's TLS credentials.",
      default: '',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_CLIENT_KEY',
      description:
        "Path to client's private key to use in mTLS communication in PEM format.",
      default: '',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_ENDPOINT',
      description: 'The OTLP endpoint to export to.',
      default: 'http://localhost:4317',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_TRACES_PROTOCOL',
      description:
        'Chooses the trace exporter protocol. Allowed values are grpc and http/protobuf',
      default: 'grpc',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_METRICS_PROTOCOL',
      description:
        'Chooses the metric exporter protocol. Allowed values are grpc and http/protobuf',
      default: 'grpc',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_PROTOCOL',
      description: 'The protocol to use for OTLP exports.',
      default: 'grpc',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
      description: 'The traces OTLP endpoint to export to.',
      default: 'http://localhost:4317',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED',
      description:
        'Whether to activate all the embedded instrumentations. When you set this setting to false, use OTEL_INSTRUMENTATION_<NAME>_ENABLED=true to selectively turn on instrumentations.',
      default: 'true',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'OTEL_LOG_LEVEL',
      description:
        'Log level for the OpenTelemetry diagnostic console logger. To activate debug logging, set the debug value. Available values are error, info, debug, and verbose.',
      default: 'none',
      type: 'string',
      category: 'general',
    },
    {
      name: 'OTEL_METRIC_EXPORT_INTERVAL',
      description:
        'The interval, in milliseconds, of metrics collection and exporting.',
      default: '30000',
      type: 'number',
      category: 'exporter',
    },
    {
      name: 'OTEL_METRICS_EXPORTER',
      description:
        'Comma-separated list of metrics exporter to use. To output to the console, set the variable to console. If set to none, metric exports are turned off.',
      default: 'otlp',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'OTEL_PROPAGATORS',
      description: 'Comma-separated list of propagators you want to use.',
      default: 'tracecontext,baggage',
      type: 'string',
      category: 'general',
    },
    {
      name: 'OTEL_SERVICE_NAME',
      description:
        'Name of the service or application you’re instrumenting. Takes precedence over the service name defined in the OTEL_RESOURCE_ATTRIBUTES variable.',
      default: 'unnamed-node-service',
      type: 'string',
      category: 'general',
    },
    {
      name: 'OTEL_SPAN_LINK_COUNT_LIMIT',
      description: 'Maximum number of links per span.',
      default: '1000',
      type: 'number',
      category: 'general',
    },
    {
      name: 'OTEL_TRACES_EXPORTER',
      description:
        'Comma-separated list of trace exporters to use. To output to the console, set the variable to console.',
      default: 'otlp',
      type: 'string',
      category: 'exporter',
    },
    {
      name: 'SPLUNK_ACCESS_TOKEN',
      description:
        'A Splunk authentication token that lets exporters send data directly to Splunk Observability Cloud. Required if you need to send data to the Splunk Observability Cloud ingest endpoint.',
      default: '',
      type: 'string',
      category: 'general',
    },
    {
      name: 'SPLUNK_INSTRUMENTATION_METRICS_ENABLED',
      description:
        'Emit metrics from instrumentation (e.g. http.server.duration)',
      default: 'false',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_METRICS_ENABLED',
      description: 'Activates metrics collection.',
      default: 'false',
      type: 'boolean',
      category: 'general',
    },
    {
      name: 'SPLUNK_METRICS_ENDPOINT',
      description:
        'The metrics endpoint. Takes precedence over OTEL_EXPORTER_OTLP_METRICS_ENDPOINT. When SPLUNK_REALM is used, the default value is https://ingest.<realm>.signalfx.com/v2/datapoint/otlp.',
      default: '',
      type: 'string',
      category: 'general',
    },
    {
      name: 'SPLUNK_PROFILER_CALL_STACK_INTERVAL',
      description:
        'Frequency with which call stacks are sampled, in milliseconds.',
      default: '1000',
      type: 'number',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_PROFILER_ENABLED',
      description: 'Activates AlwaysOn CPU profiling.',
      default: 'false',
      type: 'boolean',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_PROFILER_LOGS_ENDPOINT',
      description: 'The collector endpoint for profiler logs.',
      default: 'http://localhost:4317',
      type: 'string',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_PROFILER_MEMORY_ENABLED',
      description: 'Activates memory profiling for AlwaysOn Profiling.',
      default: 'false',
      type: 'string',
      category: 'profiler',
    },
    {
      name: 'SPLUNK_REALM',
      description:
        'The name of your organization’s realm, for example, us0. When you set the realm, telemetry is sent directly to the ingest endpoint of Splunk Observability Cloud, bypassing the Splunk Distribution of OpenTelemetry Collector.',
      default: '',
      type: 'string',
      category: 'general',
    },
    {
      name: 'SPLUNK_REDIS_INCLUDE_COMMAND_ARGS',
      description:
        'Whether to include the full Redis query in db.statement span attributes when using the Redis instrumentation.',
      default: 'false',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL',
      description:
        'The interval, in milliseconds, during which GC and event loop statistics are collected.',
      default: '5000',
      type: 'number',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_RUNTIME_METRICS_ENABLED',
      description:
        'Activates the collection and export of runtime metrics. Runtime metrics are only sent if the SPLUNK_METRICS_ENABLED environment variable is set to true or if memory profiling is activated.',
      default: 'true',
      type: 'boolean',
      category: 'instrumentation',
    },
    {
      name: 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED',
      description:
        'Activates the addition of server trace information to HTTP response headers.',
      default: 'true',
      type: 'boolean',
      category: 'general',
    },
    {
      name: 'SPLUNK_TRACING_ENABLED',
      description: 'Enables tracing.',
      default: 'true',
      type: 'boolean',
      category: 'instrumentation',
    },
  ];
}
