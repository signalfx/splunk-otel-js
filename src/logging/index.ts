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

import * as util from 'util';
import * as logsAPI from '@opentelemetry/api-logs';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  LogRecordProcessor,
  ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs';

import { getNonEmptyEnvVar, getEnvArray, defaultServiceName } from '../utils';
import { detect as detectResource } from '../resource';

type LogRecordProcessorFactory = (
  options: LoggingOptions
) => LogRecordProcessor | LogRecordProcessor[];

interface LoggingOptions {
  accessToken?: string;
  realm?: string;
  serviceName: string;
  endpoint?: string;
  resource: Resource;
  logRecordProcessorFactory: LogRecordProcessorFactory;
}

export const allowedLoggingOptions = [
  'accessToken',
  'realm',
  'serviceName',
  'endpoint',
  'logRecordProcessorFactory',
];

export type StartLoggingOptions = Partial<Omit<LoggingOptions, 'resource'>>;

export function startLogging(opts: StartLoggingOptions = {}) {
  const options = _setDefaultOptions(opts);
  const loggerProvider = new LoggerProvider({
    resource: options.resource,
  });

  let processors = options.logRecordProcessorFactory(options);

  if (!Array.isArray(processors)) {
    processors = [processors];
  }

  processors.forEach((processor) =>
    loggerProvider.addLogRecordProcessor(processor)
  );

  logsAPI.logs.setGlobalLoggerProvider(loggerProvider);

  return {
    stop: () => {
      return loggerProvider.shutdown();
    },
  };
}

export function _setDefaultOptions(
  options: StartLoggingOptions = {}
): LoggingOptions {
  let resource = detectResource();

  const serviceName =
    options.serviceName ||
    getNonEmptyEnvVar('OTEL_SERVICE_NAME') ||
    resource.attributes[SemanticResourceAttributes.SERVICE_NAME];

  if (!serviceName) {
    diag.warn(
      'service.name attribute for logging is not set, your service is unnamed and will be difficult to identify. ' +
        'Set your service name using the OTEL_RESOURCE_ATTRIBUTES environment variable. ' +
        'E.g. OTEL_RESOURCE_ATTRIBUTES="service.name=<YOUR_SERVICE_NAME_HERE>"'
    );
  }

  resource = resource.merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        serviceName || defaultServiceName(),
    })
  );

  options.logRecordProcessorFactory =
    options.logRecordProcessorFactory || defaultlogRecordProcessorFactory;

  return {
    serviceName: String(
      resource.attributes[SemanticResourceAttributes.SERVICE_NAME]
    ),
    endpoint: options.endpoint, // will use default collector url if not set
    logRecordProcessorFactory: options.logRecordProcessorFactory,
    resource,
  };
}

const SUPPORTED_EXPORTER_TYPES = ['console', 'otlp', 'none'];

function areValidExporterTypes(types: string[]): boolean {
  return types.every((t) => SUPPORTED_EXPORTER_TYPES.includes(t));
}

export function createExporters(options: LoggingOptions) {
  const logExporters: string[] = getEnvArray('OTEL_LOGS_EXPORTER', ['otlp']);

  if (!areValidExporterTypes(logExporters)) {
    throw new Error(
      `Invalid value for OTEL_LOGS_EXPORTER env variable: ${util.inspect(
        getNonEmptyEnvVar('OTEL_LOGS_EXPORTER')
      )}. Choose from ${util.inspect(SUPPORTED_EXPORTER_TYPES, {
        compact: true,
      })} or leave undefined.`
    );
  }

  return logExporters.flatMap((type) => {
    switch (type) {
      case 'otlp':
        return new OTLPLogExporter({
          url: options.endpoint,
        });
      case 'console':
        return new ConsoleLogRecordExporter();
      default:
        return [];
    }
  });
}

export function defaultlogRecordProcessorFactory(
  options: LoggingOptions
): LogRecordProcessor[] {
  let exporters = createExporters(options);

  if (!Array.isArray(exporters)) {
    exporters = [exporters];
  }
  return exporters.map((exporter) => new BatchLogRecordProcessor(exporter, {}));
}
