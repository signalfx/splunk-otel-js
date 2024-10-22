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

import { Counter, diag, metrics, ValueType } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import {
  MeterProvider,
  MetricReader,
  PeriodicExportingMetricReader,
  View,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter as OTLPHttpProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import type * as grpc from '@grpc/grpc-js';
import type * as OtlpGrpc from '@opentelemetry/exporter-metrics-otlp-grpc';
import {
  defaultServiceName,
  getEnvArray,
  getEnvBoolean,
  getEnvNumber,
  getEnvValueByPrecedence,
  getNonEmptyEnvVar,
} from '../utils';
import { enableDebugMetrics, getDebugMetricsViews } from './debug_metrics';
import * as util from 'util';
import { detect as detectResource } from '../resource';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ConsoleMetricExporter } from './ConsoleMetricExporter';
import type { ResourceFactory } from '../types';

export type MetricReaderFactory = (options: MetricsOptions) => MetricReader[];

export interface MetricsOptions {
  accessToken: string;
  realm?: string;
  serviceName: string;
  endpoint?: string;
  resource: Resource;
  views?: View[];
  exportIntervalMillis: number;
  metricReaderFactory: MetricReaderFactory;
  debugMetricsEnabled: boolean;
  runtimeMetricsEnabled: boolean;
  runtimeMetricsCollectionIntervalMillis: number;
}

export type StartMetricsOptions = Partial<Omit<MetricsOptions, 'resource'>> & {
  resourceFactory?: ResourceFactory;
};

interface Counters {
  min: number;
  max: number;
  average: number;
  sum: number;
  count: number;
}

interface GcCounters {
  collected: Counters;
  duration: Counters;
}

interface NativeCounters {
  eventLoopLag: Counters;
  gc: {
    all: GcCounters;
    scavenge: GcCounters;
    mark_sweep_compact: GcCounters;
    incremental_marking: GcCounters;
    process_weak_callbacks: GcCounters;
  };
}

const typedKeys = <T extends {}>(obj: T): (keyof T)[] =>
  Object.keys(obj) as (keyof T)[];

interface CountersExtension {
  start(): void;
  reset(): void;
  collect(): NativeCounters;
}

function _loadExtension(): CountersExtension | undefined {
  let extension;
  try {
    extension = require('../native_ext');
  } catch (e) {
    diag.error(
      'Unable to load native metrics extension. Event loop and GC metrics will not be reported',
      e
    );
  }

  return extension?.metrics;
}

function recordGcSumMetric(
  counter: Counter,
  counters: NativeCounters,
  field: keyof GcCounters
) {
  for (const type of typedKeys(counters.gc)) {
    counter.add(counters.gc[type][field].sum, {
      'gc.type': type,
    });
  }
}

function recordGcCountMetric(counter: Counter, counters: NativeCounters) {
  for (const type of typedKeys(counters.gc)) {
    counter.add(counters.gc[type].collected.count, {
      'gc.type': type,
    });
  }
}

const SUPPORTED_EXPORTER_TYPES = ['console', 'otlp', 'none'];

function areValidExporterTypes(types: string[]): boolean {
  return types.every((t) => SUPPORTED_EXPORTER_TYPES.includes(t));
}

export function createOtlpExporter(options: MetricsOptions) {
  let protocol = getEnvValueByPrecedence([
    'OTEL_EXPORTER_OTLP_METRICS_PROTOCOL',
    'OTEL_EXPORTER_OTLP_PROTOCOL',
  ]);

  let endpoint = options.endpoint;

  if (options.realm) {
    if (protocol !== undefined && protocol !== 'http/protobuf') {
      diag.warn(
        `OTLP metric exporter: defaulting protocol to 'http/protobuf' instead of '${protocol}' due to realm being defined.`
      );
    }

    if (options.endpoint === undefined) {
      endpoint = `https://ingest.${options.realm}.signalfx.com/v2/datapoint/otlp`;
      protocol = 'http/protobuf';
    } else {
      diag.warn(
        'OTLP metric exporter factory: Realm value ignored (full endpoint URL has been specified).'
      );
    }
  }

  protocol = protocol ?? 'http/protobuf';

  switch (protocol) {
    case 'grpc': {
      const grpcModule: typeof grpc = require('@grpc/grpc-js');
      const otlpGrpc: typeof OtlpGrpc = require('@opentelemetry/exporter-metrics-otlp-grpc');
      const metadata = new grpcModule.Metadata();
      if (options.accessToken) {
        metadata.set('X-SF-TOKEN', options.accessToken);
      }
      return new otlpGrpc.OTLPMetricExporter({
        url: endpoint,
        metadata,
      });
    }
    case 'http/protobuf': {
      const headers = options.accessToken
        ? {
            'X-SF-TOKEN': options.accessToken,
          }
        : {};
      return new OTLPHttpProtoMetricExporter({
        url: endpoint,
        headers,
      });
    }
    default:
      throw new Error(
        `Metrics: expected OTLP protocol to be either grpc or http/protobuf, got ${protocol}.`
      );
  }
}

function createExporters(options: MetricsOptions) {
  const metricExporters: string[] = getEnvArray('OTEL_METRICS_EXPORTER', [
    'otlp',
  ]);

  if (!areValidExporterTypes(metricExporters)) {
    throw new Error(
      `Invalid value for OTEL_METRICS_EXPORTER env variable: ${util.inspect(
        getNonEmptyEnvVar('OTEL_METRICS_EXPORTER')
      )}. Choose from ${util.inspect(SUPPORTED_EXPORTER_TYPES, {
        compact: true,
      })} or leave undefined.`
    );
  }

  return metricExporters.flatMap((type) => {
    switch (type) {
      case 'otlp':
        return createOtlpExporter(options);
      case 'console':
        return new ConsoleMetricExporter();
      default:
        return [];
    }
  });
}

export function defaultMetricReaderFactory(
  options: MetricsOptions
): MetricReader[] {
  return createExporters(options).map((exporter) => {
    return new PeriodicExportingMetricReader({
      exportIntervalMillis: options.exportIntervalMillis,
      exporter,
    });
  });
}

export const allowedMetricsOptions = [
  'accessToken',
  'realm',
  'endpoint',
  'exportIntervalMillis',
  'metricReaderFactory',
  'views',
  'resourceFactory',
  'runtimeMetricsEnabled',
  'runtimeMetricsCollectionIntervalMillis',
  'serviceName',
  'debugMetricsEnabled',
];

export function startMetrics(options: MetricsOptions) {
  const debugMetricsViews: View[] = options.debugMetricsEnabled
    ? getDebugMetricsViews()
    : [];

  const provider = new MeterProvider({
    resource: options.resource,
    views: [...(options.views || []), ...debugMetricsViews],
  });

  const metricReaders = options.metricReaderFactory(options);

  metricReaders.forEach((reader) => {
    provider.addMetricReader(reader);
  });

  metrics.setGlobalMeterProvider(provider);

  async function stopGlobalMetrics() {
    metrics.disable();
    await provider.forceFlush();
    await provider.shutdown();
  }

  if (options.debugMetricsEnabled) {
    enableDebugMetrics();
  }

  if (!options.runtimeMetricsEnabled) {
    return {
      stop: stopGlobalMetrics,
    };
  }

  const meter = metrics.getMeter('splunk-otel-js-runtime-metrics');

  meter
    .createObservableGauge('process.runtime.nodejs.memory.heap.total', {
      unit: 'By',
      valueType: ValueType.INT,
    })
    .addCallback((result) => {
      result.observe(process.memoryUsage().heapTotal);
    });

  meter
    .createObservableGauge('process.runtime.nodejs.memory.heap.used', {
      unit: 'By',
      valueType: ValueType.INT,
    })
    .addCallback((result) => {
      result.observe(process.memoryUsage().heapUsed);
    });

  meter
    .createObservableGauge('process.runtime.nodejs.memory.rss', {
      unit: 'By',
      valueType: ValueType.INT,
    })
    .addCallback((result) => {
      result.observe(process.memoryUsage().rss);
    });

  const extension = _loadExtension();

  if (extension === undefined) {
    return {
      stop: stopGlobalMetrics,
    };
  }

  extension.start();

  let runtimeCounters = extension.collect();

  meter
    .createObservableGauge('process.runtime.nodejs.event_loop.lag.max', {
      unit: 'ns',
      valueType: ValueType.INT,
    })
    .addCallback((result) => {
      result.observe(runtimeCounters.eventLoopLag.max);
    });

  meter
    .createObservableGauge('process.runtime.nodejs.event_loop.lag.min', {
      unit: 'ns',
      valueType: ValueType.INT,
    })
    .addCallback((result) => {
      result.observe(runtimeCounters.eventLoopLag.min);
    });

  const gcSizeCounter = meter.createCounter(
    'process.runtime.nodejs.memory.gc.size',
    {
      unit: 'By',
      valueType: ValueType.INT,
    }
  );

  const gcPauseCounter = meter.createCounter(
    'process.runtime.nodejs.memory.gc.pause',
    {
      unit: 'By',
      valueType: ValueType.INT,
    }
  );

  const gcCountCounter = meter.createCounter(
    'process.runtime.nodejs.memory.gc.count',
    {
      unit: '1',
      valueType: ValueType.INT,
    }
  );

  const interval = setInterval(() => {
    runtimeCounters = extension.collect();
    extension.reset();

    recordGcSumMetric(gcSizeCounter, runtimeCounters, 'collected');
    recordGcSumMetric(gcPauseCounter, runtimeCounters, 'duration');
    recordGcCountMetric(gcCountCounter, runtimeCounters);
  }, options.runtimeMetricsCollectionIntervalMillis);
  interval.unref();

  return {
    stop: async () => {
      clearInterval(interval);
      await stopGlobalMetrics();
    },
  };
}

export function _setDefaultOptions(
  options: StartMetricsOptions = {}
): MetricsOptions {
  const accessToken =
    options.accessToken || getNonEmptyEnvVar('SPLUNK_ACCESS_TOKEN') || '';

  const endpoint =
    options.endpoint || getNonEmptyEnvVar('SPLUNK_METRICS_ENDPOINT');

  const realm = options.realm || getNonEmptyEnvVar('SPLUNK_REALM') || '';

  if (realm) {
    if (!accessToken) {
      throw new Error(
        'Splunk realm is set, but access token is unset. To send metrics to the Observability Cloud, both need to be set'
      );
    }

    if (options.metricReaderFactory) {
      diag.warn(
        'Splunk realm is set with a custom metric reader. Make sure to use OTLP metrics proto HTTP exporter.'
      );
    }
  }

  let defaultResource = detectResource();

  const serviceName = String(
    options.serviceName ||
      defaultResource.attributes[ATTR_SERVICE_NAME] ||
      defaultServiceName()
  );

  defaultResource = defaultResource.merge(
    new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    })
  );

  const resourceFactory =
    options.resourceFactory || ((resource: Resource) => resource);
  const resource = resourceFactory(defaultResource);

  return {
    serviceName,
    accessToken,
    realm,
    resource,
    endpoint,
    views: options.views,
    metricReaderFactory:
      options.metricReaderFactory ?? defaultMetricReaderFactory,
    exportIntervalMillis:
      options.exportIntervalMillis ||
      getEnvNumber('OTEL_METRIC_EXPORT_INTERVAL', 30_000),
    debugMetricsEnabled:
      options.debugMetricsEnabled ??
      getEnvBoolean('SPLUNK_DEBUG_METRICS_ENABLED', false),
    runtimeMetricsEnabled:
      options.runtimeMetricsEnabled ??
      getEnvBoolean('SPLUNK_RUNTIME_METRICS_ENABLED', true),
    runtimeMetricsCollectionIntervalMillis:
      options.runtimeMetricsCollectionIntervalMillis ||
      getEnvNumber('SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL', 5000),
  };
}
