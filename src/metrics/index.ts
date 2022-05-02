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

import { metrics, ValueType } from '@opentelemetry/api-metrics';
import { Resource } from '@opentelemetry/resources';
import {
  MeterProvider,
  MetricReader,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics-base';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Metadata } from '@grpc/grpc-js';
import { defaultServiceName, getEnvBoolean, getEnvNumber } from '../options';
import { EnvDetector } from '../resource';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export type MetricReaderFactory = (options: MetricsOptions) => MetricReader[];

interface MetricsOptions {
  serviceName: string;
  accessToken: string;
  endpoint?: string;
  resource?: Resource;
  exportIntervalMillis: number;
  metricReaderFactory: MetricReaderFactory;
  enableRuntimeMetrics: boolean;
}

/* TODO: Native API might need a new API for OTel metrics. Types commented out until then.
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
*/

export type StartMetricsOptions = Partial<MetricsOptions>;

export function defaultMetricReaderFactory(
  options: StartMetricsOptions
): MetricReader[] {
  const metadata = new Metadata();
  if (options.accessToken) {
    metadata.set('X-SF-TOKEN', options.accessToken);
  }

  const reader = new PeriodicExportingMetricReader({
    exportIntervalMillis: options.exportIntervalMillis,
    exporter: new OTLPMetricExporter({
      url: options.endpoint,
      metadata,
    }),
  });

  return [reader];
}

export function startMetrics(opts: StartMetricsOptions = {}) {
  const options = _setDefaultOptions(opts);

  const provider = new MeterProvider({
    resource: options.resource,
  });

  const metricReaders = options.metricReaderFactory(options);

  metricReaders.forEach(reader => {
    provider.addMetricReader(reader);
  });

  metrics.setGlobalMeterProvider(provider);

  if (options.enableRuntimeMetrics) {
    const meter = metrics.getMeter('splunk-otel-js');

    meter.createObservableGauge(
      'process.runtime.nodejs.memory.heap.total',
      result => {
        result.observe(process.memoryUsage().heapTotal, {});
      },
      {
        unit: 'By',
        valueType: ValueType.INT,
      }
    );

    meter.createObservableGauge(
      'process.runtime.nodejs.memory.heap.used',
      result => {
        result.observe(process.memoryUsage().heapUsed, {});
      },
      {
        unit: 'By',
        valueType: ValueType.INT,
      }
    );

    meter.createObservableGauge(
      'process.runtime.nodejs.memory.rss',
      result => {
        result.observe(process.memoryUsage().rss, {});
      },
      {
        unit: 'By',
        valueType: ValueType.INT,
      }
    );
  }
}

export function _setDefaultOptions(
  options: StartMetricsOptions = {}
): MetricsOptions {
  const accessToken =
    options.accessToken || process.env.SPLUNK_ACCESS_TOKEN || '';

  const resource = new EnvDetector()
    .detect()
    .merge(options.resource || Resource.empty());

  const serviceName = String(
    options.serviceName ||
      process.env.OTEL_SERVICE_NAME ||
      resource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
      defaultServiceName
  );

  return {
    serviceName,
    accessToken,
    resource,
    endpoint: options.endpoint,
    metricReaderFactory:
      options.metricReaderFactory ?? defaultMetricReaderFactory,
    exportIntervalMillis:
      options.exportIntervalMillis ||
      getEnvNumber('OTEL_METRIC_EXPORT_INTERVAL', 5000),
    enableRuntimeMetrics:
      options.enableRuntimeMetrics ||
      getEnvBoolean('SPLUNK_RUNTIME_METRICS_ENABLED', false),
  };
}
