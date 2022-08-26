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

import { context, diag } from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import { collectMemoryInfo, MemoryInfo } from './memory';
import {
  assertNoExtraneousProperties,
  defaultServiceName,
  getEnvNumber,
} from '../utils';
import { detect as detectResource } from '../resource';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as signalfx from 'signalfx';

export interface MetricsOptions {
  accessToken: string;
  realm?: string;
  endpoint: string;
  serviceName: string;
  // Metrics-specific configuration options:
  exportInterval: number;
}

interface SignalFxOptions {
  client: signalfx.SignalClient;
  dimensions: object;
}

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

type GcType = keyof NativeCounters['gc'];

interface CountersExtension {
  start(): void;
  reset(): void;
  collect(): NativeCounters;
}

interface MetricsRegistry {
  addNativeInfo(counters: NativeCounters): void;
  addMemoryInfo(counters: MemoryInfo): void;
  export(): void;
}

export type StartMetricsOptions = Partial<MetricsOptions> & {
  signalfx?: Partial<SignalFxOptions>;
};

export const allowedMetricsOptions = [
  'accessToken',
  'realm',
  'endpoint',
  'exportInterval',
  'serviceName',
  'signalfx',
];

export function startMetrics(opts: StartMetricsOptions = {}) {
  assertNoExtraneousProperties(opts, allowedMetricsOptions);

  const options = _setDefaultOptions(opts);

  const signalFxClient = options.sfxClient;
  const registry = _createSignalFxMetricsRegistry(options.sfxClient);

  const extension = _loadExtension();

  let interval: NodeJS.Timer;
  if (extension !== undefined) {
    extension.start();
    interval = setInterval(() => {
      registry.addMemoryInfo(collectMemoryInfo());
      registry.addNativeInfo(extension.collect());
      extension.reset();
      registry.export();
    }, options.exportInterval);
  } else {
    interval = setInterval(() => {
      registry.addMemoryInfo(collectMemoryInfo());
      registry.export();
    }, options.exportInterval);
  }

  interval.unref();

  return {
    stopMetrics: () => {
      clearInterval(interval);
    },
    getSignalFxClient: () => signalFxClient,
  };
}

interface CumulativeRegistry {
  add(key: string, value: number): number;
}

function newCumulativeRegistry(): CumulativeRegistry {
  const metrics = new Map<string, number>();
  return {
    add: (key: string, value: number): number => {
      if (metrics.has(key)) {
        const newValue = metrics.get(key)! + value;
        metrics.set(key, newValue);
        return newValue;
      }

      metrics.set(key, value);
      return value;
    },
  };
}

function gcSizeMetric(
  reg: CumulativeRegistry,
  type: GcType,
  counters: NativeCounters,
  timestamp: number
) {
  const key = `gc.size.${type}`;
  return {
    metric: 'nodejs.memory.gc.size',
    value: reg.add(key, counters.gc[type].collected.sum),
    timestamp,
    dimensions: { gctype: type },
  };
}

function gcPauseMetric(
  reg: CumulativeRegistry,
  type: GcType,
  counters: NativeCounters,
  timestamp: number
) {
  const key = `gc.pause.${type}`;
  return {
    metric: 'nodejs.memory.gc.pause',
    value: reg.add(key, counters.gc[type].duration.sum),
    timestamp,
    dimensions: { gctype: type },
  };
}

function gcCountMetric(
  reg: CumulativeRegistry,
  type: GcType,
  counters: NativeCounters,
  timestamp: number
) {
  const key = `gc.count.${type}`;
  return {
    metric: 'nodejs.memory.gc.count',
    value: reg.add(key, counters.gc[type].collected.count),
    timestamp,
    dimensions: { gctype: type },
  };
}

function _createSignalFxMetricsRegistry(
  client: signalfx.SignalClient
): MetricsRegistry {
  const registry = newCumulativeRegistry();
  let gauges: signalfx.SignalMetric[] = [];
  let cumulativeCounters: signalfx.SignalMetric[] = [];
  return {
    addMemoryInfo: (info: MemoryInfo) => {
      const timestamp = Date.now();
      gauges.push({
        metric: 'nodejs.memory.heap.total',
        value: info.heapTotal,
        timestamp,
      });

      gauges.push({
        metric: 'nodejs.memory.heap.used',
        value: info.heapUsed,
        timestamp,
      });

      gauges.push({
        metric: 'nodejs.memory.rss',
        value: info.rss,
        timestamp,
      });
    },
    addNativeInfo: (info: NativeCounters) => {
      const timestamp = Date.now();
      gauges.push({
        metric: 'nodejs.event_loop.lag.max',
        value: info.eventLoopLag.max,
        timestamp,
      });

      gauges.push({
        metric: 'nodejs.event_loop.lag.min',
        value: info.eventLoopLag.min,
        timestamp,
      });

      cumulativeCounters.push(
        gcSizeMetric(registry, 'all', info, timestamp),
        gcSizeMetric(registry, 'scavenge', info, timestamp),
        gcSizeMetric(registry, 'mark_sweep_compact', info, timestamp),
        gcSizeMetric(registry, 'incremental_marking', info, timestamp),
        gcSizeMetric(registry, 'process_weak_callbacks', info, timestamp),

        gcPauseMetric(registry, 'all', info, timestamp),
        gcPauseMetric(registry, 'scavenge', info, timestamp),
        gcPauseMetric(registry, 'mark_sweep_compact', info, timestamp),
        gcPauseMetric(registry, 'incremental_marking', info, timestamp),
        gcPauseMetric(registry, 'process_weak_callbacks', info, timestamp),

        gcCountMetric(registry, 'all', info, timestamp),
        gcCountMetric(registry, 'scavenge', info, timestamp),
        gcCountMetric(registry, 'mark_sweep_compact', info, timestamp),
        gcCountMetric(registry, 'incremental_marking', info, timestamp),
        gcCountMetric(registry, 'process_weak_callbacks', info, timestamp)
      );
    },
    export: () => {
      context.with(suppressTracing(context.active()), () => {
        client.send({
          cumulative_counters: cumulativeCounters,
          gauges,
        });
      });

      gauges = [];
      cumulativeCounters = [];
    },
  };
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

export function _setDefaultOptions(
  options: StartMetricsOptions = {}
): MetricsOptions & { sfxClient: signalfx.SignalClient } {
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

    if (!endpoint) {
      endpoint = `https://ingest.${realm}.signalfx.com`;
    }
  }

  if (!endpoint) {
    endpoint = 'http://localhost:9943';
  }

  const resource = detectResource();

  const serviceName = String(
    options.serviceName ||
      process.env.OTEL_SERVICE_NAME ||
      resource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
      defaultServiceName
  );

  const dimensions = Object.assign(
    {
      service: serviceName,
      metric_source: 'splunk-otel-js',
      node_version: process.versions.node,
    },
    options.signalfx?.dimensions || {}
  );

  const sfxClient =
    options.signalfx?.client ||
    new signalfx.Ingest(accessToken, {
      ingestEndpoint: endpoint,
      dimensions,
    });

  return {
    serviceName: serviceName,
    accessToken,
    endpoint,
    exportInterval:
      options.exportInterval ||
      getEnvNumber('SPLUNK_METRICS_EXPORT_INTERVAL', 5000),
    sfxClient,
  };
}
