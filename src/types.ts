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

export type LogLevel = 'none' | 'verbose' | 'debug' | 'info' | 'warn' | 'error';

export type EnvVarKey =
  | 'OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT'
  | 'OTEL_BSP_SCHEDULE_DELAY'
  | 'OTEL_EXPORTER_OTLP_CERTIFICATE'
  | 'OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE'
  | 'OTEL_EXPORTER_OTLP_CLIENT_KEY'
  | 'OTEL_EXPORTER_OTLP_ENDPOINT'
  | 'OTEL_EXPORTER_OTLP_METRICS_PROTOCOL'
  | 'OTEL_EXPORTER_OTLP_PROTOCOL'
  | 'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'
  | 'OTEL_EXPORTER_OTLP_TRACES_PROTOCOL'
  | 'OTEL_LOG_LEVEL'
  | 'OTEL_METRIC_EXPORT_INTERVAL'
  | 'OTEL_METRICS_EXPORTER'
  | 'OTEL_PROPAGATORS'
  | 'OTEL_SERVICE_NAME'
  | 'OTEL_SPAN_LINK_COUNT_LIMIT'
  | 'OTEL_TRACES_EXPORTER'
  | 'SPLUNK_ACCESS_TOKEN'
  | 'SPLUNK_AUTOINSTRUMENT_PACKAGE_NAMES'
  | 'SPLUNK_METRICS_ENABLED'
  | 'SPLUNK_METRICS_ENDPOINT'
  | 'SPLUNK_PROFILER_CALL_STACK_INTERVAL'
  | 'SPLUNK_PROFILER_ENABLED'
  | 'SPLUNK_PROFILER_LOGS_ENDPOINT'
  | 'SPLUNK_PROFILER_MEMORY_ENABLED'
  | 'SPLUNK_REALM'
  | 'SPLUNK_REDIS_INCLUDE_COMMAND_ARGS'
  | 'SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL'
  | 'SPLUNK_RUNTIME_METRICS_ENABLED'
  | 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED'
  | 'SPLUNK_TRACING_ENABLED'
  | 'TEST_ALLOW_DOUBLE_START';
