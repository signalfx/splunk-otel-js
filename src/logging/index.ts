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
import { CompressionAlgorithm } from '@opentelemetry/otlp-exporter-base';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  LogRecordProcessor,
  ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs';

import { _getEnvArray, defaultServiceName, ensureResourcePath } from '../utils';
import { getConfigLogger, getNonEmptyConfigVar } from '../configuration';
import { getDetectedResource } from '../resource';
import type { LoggingOptions, StartLoggingOptions } from './types';
import type {
  LogRecordExporter as ConfigLogRecordExporter,
  NameStringValuePair,
} from '../configuration/schema';
import type { LogRecordExporter as SdkLogRecordExporter } from '@opentelemetry/sdk-logs';

export type { LoggingOptions, StartLoggingOptions };

export function startLogging(options: LoggingOptions) {
  let processors = options.logRecordProcessorFactory(options);

  if (!Array.isArray(processors)) {
    processors = [processors];
  }

  const loggerProvider = new LoggerProvider({
    resource: options.resource,
    processors,
  });

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
    getNonEmptyConfigVar('OTEL_SERVICE_NAME') ||
    envResource.attributes?.[ATTR_SERVICE_NAME];

  const resourceFactory = options.resourceFactory || ((r: Resource) => r);
  const resource = resourceFactory(
    resourceFromAttributes(envResource.attributes || {})
  ).merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName || defaultServiceName(),
    })
  );

  options.logRecordProcessorFactory =
    options.logRecordProcessorFactory || defaultLogRecordProcessorFactory;

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
  const logExporters: string[] = _getEnvArray('OTEL_LOGS_EXPORTER') || ['otlp'];

  if (!areValidExporterTypes(logExporters)) {
    throw new Error(
      `Invalid value for OTEL_LOGS_EXPORTER env variable: ${util.inspect(
        logExporters
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

function nameStringValuePairsToRecord(
  pairs: NameStringValuePair[] | undefined
): Record<string, string> | undefined {
  if (pairs === undefined) return undefined;

  const record: Record<string, string> = {};

  for (const pair of pairs) {
    if (pair.value !== null) {
      record[pair.name] = pair.value;
    }
  }

  return record;
}

function toExporter(
  configExporter: ConfigLogRecordExporter
): SdkLogRecordExporter {
  if (configExporter.console !== undefined) {
    return new ConsoleLogRecordExporter();
  }

  if (configExporter.otlp_http !== undefined) {
    const cxp = configExporter.otlp_http;
    const url = cxp.endpoint ?? undefined;
    return new OTLPLogExporter({
      url,
      headers: nameStringValuePairsToRecord(cxp.headers),
      compression:
        cxp.compression === 'gzip'
          ? CompressionAlgorithm.GZIP
          : CompressionAlgorithm.NONE,
      timeoutMillis: cxp.timeout ?? undefined,
    });
  }

  throw new Error(
    `Unsupported log exporter requested: ${Object.keys(configExporter)[0]}`
  );
}

export function defaultLogRecordProcessorFactory(
  options: LoggingOptions
): LogRecordProcessor[] {
  const loggerFromConfig = getConfigLogger();

  if (loggerFromConfig === undefined) {
    let exporters = createExporters(options);

    if (!Array.isArray(exporters)) {
      exporters = [exporters];
    }
    return exporters.map(
      (exporter) => new BatchLogRecordProcessor(exporter, {})
    );
  }

  const processors: LogRecordProcessor[] = [];

  for (const configProcessor of loggerFromConfig.processors) {
    if (configProcessor.batch !== undefined) {
      const batch = configProcessor.batch;
      const configExporter = batch.exporter;
      processors.push(
        new BatchLogRecordProcessor(toExporter(configExporter), {
          maxExportBatchSize: batch.max_export_batch_size ?? undefined,
          scheduledDelayMillis: batch.schedule_delay ?? undefined,
          exportTimeoutMillis: batch.export_timeout ?? undefined,
          maxQueueSize: batch.max_queue_size ?? undefined,
        })
      );
    } else if (configProcessor.simple !== undefined) {
    }
  }

  return processors;
}
