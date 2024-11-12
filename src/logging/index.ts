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
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  LogRecordProcessor,
  ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs';

import {
  getNonEmptyEnvVar,
  getEnvArray,
  defaultServiceName,
  ensureResourcePath,
} from '../utils';
import { getDetectedResource } from '../resource';
import type { LoggingOptions, StartLoggingOptions } from './types';

export type { LoggingOptions, StartLoggingOptions };

export function startLogging(options: LoggingOptions) {
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
  const envResource = getDetectedResource();

  const serviceName =
    options.serviceName ||
    getNonEmptyEnvVar('OTEL_SERVICE_NAME') ||
    envResource.attributes[ATTR_SERVICE_NAME];

  const resourceFactory = options.resourceFactory || ((r: Resource) => r);
  const resource = resourceFactory(envResource).merge(
    new Resource({
      [ATTR_SERVICE_NAME]: serviceName || defaultServiceName(),
    })
  );

  options.logRecordProcessorFactory =
    options.logRecordProcessorFactory || defaultlogRecordProcessorFactory;

  return {
    serviceName: String(resource.attributes[ATTR_SERVICE_NAME]),
    endpoint: options.endpoint, // will use default collector url if not set
    logRecordProcessorFactory: options.logRecordProcessorFactory,
    resource,
  };
}

const SUPPORTED_EXPORTER_TYPES = ['console', 'otlp', 'none'];

function areValidExporterTypes(types: string[]): boolean {
  return types.every((t) => SUPPORTED_EXPORTER_TYPES.includes(t));
}

function createExporters(options: LoggingOptions) {
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
      case 'otlp': {
        const url = ensureResourcePath(options.endpoint, '/v1/logs');
        return new OTLPLogExporter({
          url,
        });
      }
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
