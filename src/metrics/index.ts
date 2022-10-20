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

import { diag } from '@opentelemetry/api';
import { Counter, metrics, ValueType } from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  MeterProvider,
  MetricReader,
  PeriodicExportingMetricReader,
  View,
} from '@opentelemetry/sdk-metrics-base';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { Metadata } from '@grpc/grpc-js';
import {
  assertNoExtraneousProperties,
  defaultServiceName,
  getEnvBoolean,
  getEnvNumber,
} from '../utils';
import { detect as detectResource } from '../resource';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export type MetricReaderFactory = (options: MetricsOptions) => MetricReader[];
export type ResourceFactory = (resource: Resource) => Resource;

interface MetricsOptions {
  accessToken: string;
  realm?: string;
  serviceName: string;
  endpoint: string;
  resource: Resource;
  views?: View[];
  exportIntervalMillis: number;
  metricReaderFactory: MetricReaderFactory;
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

const typedKeys = <T>(obj: T): (keyof T)[] => Object.keys(obj) as (keyof T)[];

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

function chooseExporter(options: MetricsOptions) {
  if (options.realm) {
    return new OTLPHttpProtoMetricExporter({
      url: options.endpoint,
      headers: {
        'X-SF-TOKEN': options.accessToken,
      },
    });
  }

  const metadata = new Metadata();
  if (options.accessToken) {
    metadata.set('X-SF-TOKEN', options.accessToken);
  }

  return new OTLPMetricExporter({
    url: options.endpoint,
    metadata,
  });
}

export function defaultMetricReaderFactory(
  options: MetricsOptions
): MetricReader[] {
  const reader = new PeriodicExportingMetricReader({
    exportIntervalMillis: options.exportIntervalMillis,
    exporter: chooseExporter(options),
  });

  return [reader];
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
];

export function startMetrics(opts: StartMetricsOptions = {}) {
  assertNoExtraneousProperties(opts, allowedMetricsOptions);

  const options = _setDefaultOptions(opts);

  const provider = new MeterProvider({
    resource: options.resource,
    views: options.views,
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

const defaultEndpoint = 'http://localhost:4317';

export function _setDefaultOptions(
  options: StartMetricsOptions = {}
): MetricsOptions {
  const accessToken =
    options.accessToken || process.env.SPLUNK_ACCESS_TOKEN || '';

  let endpoint = options.endpoint || process.env.SPLUNK_METRICS_ENDPOINT;

  const realm = options.realm || process.env.SPLUNK_REALM || '';

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

    if (!endpoint) {
      endpoint = `https://ingest.${realm}.signalfx.com/v2/datapoint/otlp`;
    }
  }

  if (!endpoint) {
    endpoint = defaultEndpoint;
  }

  let defaultResource = detectResource();

  const serviceName = String(
    options.serviceName ||
      defaultResource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
      defaultServiceName
  );

  defaultResource = defaultResource.merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
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
    runtimeMetricsEnabled:
      options.runtimeMetricsEnabled ??
      getEnvBoolean('SPLUNK_RUNTIME_METRICS_ENABLED', false),
    runtimeMetricsCollectionIntervalMillis:
      options.runtimeMetricsCollectionIntervalMillis ||
      getEnvNumber('SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL', 5000),
  };
}
