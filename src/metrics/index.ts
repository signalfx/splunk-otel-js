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
  Attributes,
  Counter,
  diag,
  metrics,
  ValueType,
} from '@opentelemetry/api';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import {
  AggregationOption,
  AggregationType,
  IAttributesProcessor,
  InstrumentType,
  MeterProvider,
  MetricReader,
  PeriodicExportingMetricReader,
  PushMetricExporter,
  ViewOptions,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter as OTLPHttpProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { AggregationTemporalityPreference } from '@opentelemetry/exporter-metrics-otlp-http';
import type * as grpc from '@grpc/grpc-js';
import type * as OtlpGrpc from '@opentelemetry/exporter-metrics-otlp-grpc';
import type { MetricsOptions, StartMetricsOptions } from './types';

import {
  defaultServiceName,
  ensureResourcePath,
  readFileContent,
} from '../utils';
import { enableDebugMetrics, getDebugMetricsViews } from './debug_metrics';
import * as util from 'util';
import { getDetectedResource } from '../resource';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { ConsoleMetricExporter } from './ConsoleMetricExporter';
import {
  getEnvArray,
  getNonEmptyEnvVar,
  getEnvValueByPrecedence,
} from '../utils';
import {
  getConfigMeterProvider,
  getConfigBoolean,
  getConfigNumber,
  getNonEmptyConfigVar,
  configGetResource,
} from '../configuration';
import {
  Aggregation as ConfigAggregation,
  PushMetricExporter as ConfigPushMetricExporter,
  View as ConfigView,
  IncludeExclude as ConfigViewAttribIncludeExclude,
} from '../configuration/schema';
import { toCompression } from '../configuration/convert';

export type { MetricsOptions, StartMetricsOptions };

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

const typedKeys = <T extends object>(obj: T): (keyof T)[] =>
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

    const envEndpoint = getEnvValueByPrecedence([
      'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
      'OTEL_EXPORTER_OTLP_ENDPOINT',
    ]);

    if (endpoint === undefined && envEndpoint === undefined) {
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
        : undefined;
      const url = ensureResourcePath(endpoint, '/v1/metrics');
      return new OTLPHttpProtoMetricExporter({
        url,
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
  const metricExporters: string[] = getEnvArray('OTEL_METRICS_EXPORTER') || [
    'otlp',
  ];

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

function toAggregationTemporalityPreference(
  preference: 'cumulative' | 'delta' | 'low_memory' | null | undefined
): AggregationTemporalityPreference | undefined {
  if (preference === 'cumulative')
    return AggregationTemporalityPreference.CUMULATIVE;
  if (preference === 'delta') return AggregationTemporalityPreference.DELTA;
  if (preference === 'low_memory')
    return AggregationTemporalityPreference.LOWMEMORY;

  return undefined;
}

function toMetricExporter(
  configExporter: ConfigPushMetricExporter
): PushMetricExporter | undefined {
  if (configExporter.otlp_http !== undefined) {
    const otlpHttp = configExporter.otlp_http;
    const configHeaders = otlpHttp.headers || [];
    const headers: Record<string, string> = {};

    for (const header of configHeaders) {
      if (header.value !== null) {
        headers[header.name] = header.value;
      }
    }

    const url = ensureResourcePath(otlpHttp.endpoint, '/v1/metrics');
    return new OTLPHttpProtoMetricExporter({
      url,
      headers,
      timeoutMillis: otlpHttp.timeout ?? undefined,
      compression: toCompression(otlpHttp.compression),
      httpAgentOptions: {
        ca: readFileContent(otlpHttp.tls?.ca_file),
        cert: readFileContent(otlpHttp.tls?.cert_file),
        key: readFileContent(otlpHttp.tls?.key_file),
      },
      temporalityPreference: toAggregationTemporalityPreference(
        otlpHttp.temporality_preference
      ),
    });
  } else if (configExporter.otlp_grpc !== undefined) {
    const grpcModule: typeof grpc = require('@grpc/grpc-js');
    const otlpGrpc: typeof OtlpGrpc = require('@opentelemetry/exporter-metrics-otlp-grpc');

    const cfgGrpc = configExporter.otlp_grpc;

    const metadata = new grpcModule.Metadata();

    for (const header of cfgGrpc.headers || []) {
      if (header.value !== null) {
        metadata.set(header.name, header.value);
      }
    }

    const credentials =
      cfgGrpc.tls === undefined
        ? undefined
        : grpcModule.credentials.createSsl(
            readFileContent(cfgGrpc.tls?.cert_file),
            readFileContent(cfgGrpc.tls?.key_file),
            readFileContent(cfgGrpc.tls?.ca_file)
          );

    return new otlpGrpc.OTLPMetricExporter({
      url: cfgGrpc.endpoint ?? undefined,
      metadata,
      timeoutMillis: cfgGrpc.timeout ?? undefined,
      compression: toCompression(cfgGrpc.compression),
      credentials,
      temporalityPreference: toAggregationTemporalityPreference(
        cfgGrpc.temporality_preference
      ),
    });
  } else if (configExporter.console !== undefined) {
    return new ConsoleMetricExporter();
  } else if (configExporter['otlp_file/development'] !== undefined) {
    diag.warn('metric exporter "otlp_file/development" is not supported');
  }

  return undefined;
}

function toViewAggregationOption(
  aggregation: ConfigAggregation | undefined
): AggregationOption | undefined {
  if (aggregation === undefined) {
    return undefined;
  }

  if (aggregation.sum !== undefined) {
    return { type: AggregationType.SUM };
  } else if (aggregation.drop !== undefined) {
    return { type: AggregationType.DROP };
  } else if (aggregation.default !== undefined) {
    return { type: AggregationType.DEFAULT };
  } else if (aggregation.last_value !== undefined) {
    return { type: AggregationType.LAST_VALUE };
  } else if (aggregation.explicit_bucket_histogram !== undefined) {
    const hist = aggregation.explicit_bucket_histogram;

    return {
      type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
      options: {
        recordMinMax: hist.record_min_max ?? undefined,
        boundaries: hist.boundaries || [],
      },
    };
  } else if (aggregation.base2_exponential_bucket_histogram !== undefined) {
    const hist = aggregation.base2_exponential_bucket_histogram;

    return {
      type: AggregationType.EXPONENTIAL_HISTOGRAM,
      options: {
        recordMinMax: hist.record_min_max ?? undefined,
        maxSize: hist.max_size ?? undefined,
      },
    };
  }

  return undefined;
}

function toAttributesProcessor(
  includeExclude: ConfigViewAttribIncludeExclude | undefined
): IAttributesProcessor | undefined {
  if (includeExclude === undefined) {
    return undefined;
  }

  const included = includeExclude.included || [];
  const excluded = includeExclude.excluded || [];
  // TODO: Wildcard support
  return {
    process: (incoming: Attributes) => {
      const newAttributes: Attributes = {};

      for (const include of included) {
        const value = incoming[include];
        if (value !== undefined) {
          newAttributes[include] = value;
        }
      }

      for (const exclude of excluded) {
        const value = incoming[exclude];

        if (value !== undefined) {
          delete newAttributes[exclude];
        }
      }

      return newAttributes;
    },
  };
}

function toInstrumentType(
  type: ConfigView['selector']['instrument_type']
): InstrumentType | undefined {
  if (type === undefined || type === null) {
    return undefined;
  }

  switch (type) {
    case 'counter':
      return InstrumentType.COUNTER;
    case 'gauge':
      return InstrumentType.GAUGE;
    case 'histogram':
      return InstrumentType.HISTOGRAM;
    case 'observable_counter':
      return InstrumentType.OBSERVABLE_COUNTER;
    case 'observable_gauge':
      return InstrumentType.OBSERVABLE_GAUGE;
    case 'observable_up_down_counter':
      return InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
    case 'up_down_counter':
      return InstrumentType.UP_DOWN_COUNTER;
    default: {
      diag.warn(`unknown instrument type '${type}'`);
      return undefined;
    }
  }
}

function toViewOptions(configView: ConfigView): ViewOptions {
  const attributeProcessor = toAttributesProcessor(
    configView.stream.attribute_keys
  );
  return {
    name: configView.stream.name ?? undefined,
    description: configView.stream.description ?? undefined,
    attributesProcessors: attributeProcessor ? [attributeProcessor] : undefined,
    aggregation: toViewAggregationOption(configView.stream.aggregation),
    aggregationCardinalityLimit:
      configView.stream.aggregation_cardinality_limit ?? undefined,
    instrumentType: toInstrumentType(configView.selector.instrument_type),
    instrumentName: configView.selector.instrument_name ?? undefined,
    instrumentUnit: configView.selector.unit ?? undefined,
    meterName: configView.selector.meter_name ?? undefined,
    meterVersion: configView.selector.meter_version ?? undefined,
    meterSchemaUrl: configView.selector.meter_schema_url ?? undefined,
  };
}

export function defaultMetricReaderFactory(
  options: MetricsOptions
): MetricReader[] {
  const cfgMeterProvider = getConfigMeterProvider();

  if (cfgMeterProvider === undefined) {
    return createExporters(options).map((exporter) => {
      return new PeriodicExportingMetricReader({
        exportIntervalMillis: options.exportIntervalMillis,
        exporter,
      });
    });
  }

  const readers: MetricReader[] = [];

  if (cfgMeterProvider === null) {
    return readers;
  }

  for (const reader of cfgMeterProvider.readers) {
    if (reader.pull !== undefined) {
      diag.warn('pull metric reader not supported');
    } else if (reader.periodic !== undefined) {
      const periodicReader = reader.periodic;
      const exporter = toMetricExporter(periodicReader.exporter);

      if (exporter !== undefined) {
        // TODO: Cardinality limits when OTel supports them.
        readers.push(
          new PeriodicExportingMetricReader({
            exporter,
            exportIntervalMillis: periodicReader.interval ?? undefined,
            exportTimeoutMillis: periodicReader.timeout ?? undefined,
          })
        );
      }
    }
  }

  return readers;
}

function buildMeterProvider(options: MetricsOptions): MeterProvider {
  const debugMetricsViews: ViewOptions[] = options.debugMetricsEnabled
    ? getDebugMetricsViews()
    : [];

  const readers = options.metricReaderFactory(options);

  const configMeterProvider = getConfigMeterProvider();

  if (configMeterProvider === undefined) {
    return new MeterProvider({
      resource: options.resource,
      views: [...(options.views || []), ...debugMetricsViews],
      readers,
    });
  }

  const cfgViews = configMeterProvider.views || [];

  let views: ViewOptions[] = [];

  if (options.views === undefined) {
    for (const cfgView of cfgViews) {
      views.push(toViewOptions(cfgView));
    }
  } else {
    views = options.views;
  }

  return new MeterProvider({
    resource: options.resource,
    views: [...views, ...debugMetricsViews],
    readers,
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
  const provider = buildMeterProvider(options);
  metrics.setGlobalMeterProvider(provider);

  async function stopGlobalMetrics() {
    metrics.disable();
    if (provider !== undefined) {
      await provider.forceFlush();
      await provider.shutdown();
    }
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
    options.accessToken || getNonEmptyConfigVar('SPLUNK_ACCESS_TOKEN') || '';

  const realm = options.realm || getNonEmptyConfigVar('SPLUNK_REALM') || '';

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

  const envResource = getDetectedResource();

  const serviceName = String(
    options.serviceName ||
      getNonEmptyConfigVar('OTEL_SERVICE_NAME') ||
      envResource.attributes?.[ATTR_SERVICE_NAME] ||
      defaultServiceName()
  );

  const resourceFactory =
    options.resourceFactory || ((resource: Resource) => resource);
  let resource = resourceFactory(
    resourceFromAttributes(envResource.attributes || {}).merge(
      configGetResource()
    )
  );

  resource = resource.merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    })
  );

  return {
    serviceName,
    accessToken,
    realm,
    resource,
    endpoint: options.endpoint,
    views: options.views,
    metricReaderFactory:
      options.metricReaderFactory ?? defaultMetricReaderFactory,
    exportIntervalMillis:
      options.exportIntervalMillis ||
      getConfigNumber('OTEL_METRIC_EXPORT_INTERVAL', 30_000),
    debugMetricsEnabled:
      options.debugMetricsEnabled ??
      getConfigBoolean('SPLUNK_DEBUG_METRICS_ENABLED', false),
    runtimeMetricsEnabled:
      options.runtimeMetricsEnabled ??
      getConfigBoolean('SPLUNK_RUNTIME_METRICS_ENABLED', true),
    runtimeMetricsCollectionIntervalMillis:
      options.runtimeMetricsCollectionIntervalMillis ||
      getConfigNumber('SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL', 5000),
  };
}
