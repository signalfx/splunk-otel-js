import { context, diag } from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import { collectMemoryInfo, MemoryInfo } from './memory';
import * as os from 'os';
import * as signalfx from 'signalfx';

interface MetricsOptions {
  accessToken: string;
  endpoint: string;
  exportInterval: number;
}

interface SignalFxOptions {
  client: signalfx.SignalClient,
  dimensions: object,
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
  }
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

export type StartMetricsOptions = Partial<MetricsOptions> & { signalfx?: Partial<SignalFxOptions> };

let _signalFxClient: signalfx.SignalClient | undefined;

export function startMetrics(opts: StartMetricsOptions = {}) {
  const options = _setDefaultOptions(opts);

  _signalFxClient = options.sfxClient;
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
      _signalFxClient = undefined;
      clearInterval(interval);
    }
  };
}

export function getSignalFxClient(): signalfx.SignalClient | undefined {
  return _signalFxClient;
}

function gcSizeMetric(info: NativeCounters, type: GcType, timestamp: number) {
  return {
    metric: 'nodejs.memory.gc.size',
    value: info.gc[type].collected.sum,
    timestamp,
    dimensions: { gctype: type }
  };
}

function gcDurationMetric(info: NativeCounters, type: GcType, timestamp: number) {
  return {
    metric: 'nodejs.memory.gc.pause',
    value: info.gc[type].duration.sum,
    timestamp,
    dimensions: { gctype: type }
  };
}

function gcCountMetric(info: NativeCounters, type: GcType, timestamp: number) {
  return {
    metric: 'nodejs.memory.gc.count',
    value: info.gc[type].duration.count,
    timestamp,
    dimensions: { gctype: type }
  };
}

function _createSignalFxMetricsRegistry(client: signalfx.SignalClient): MetricsRegistry {
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

      for (const metric of [
        gcSizeMetric(info, 'all', timestamp),
        gcSizeMetric(info, 'scavenge', timestamp),
        gcSizeMetric(info, 'mark_sweep_compact', timestamp),
        gcSizeMetric(info, 'incremental_marking', timestamp),
        gcSizeMetric(info, 'process_weak_callbacks', timestamp),

        gcDurationMetric(info, 'all', timestamp),
        gcDurationMetric(info, 'scavenge', timestamp),
        gcDurationMetric(info, 'mark_sweep_compact', timestamp),
        gcDurationMetric(info, 'incremental_marking', timestamp),
        gcDurationMetric(info, 'process_weak_callbacks', timestamp),

        gcCountMetric(info, 'all', timestamp),
        gcCountMetric(info, 'scavenge', timestamp),
        gcCountMetric(info, 'mark_sweep_compact', timestamp),
        gcCountMetric(info, 'incremental_marking', timestamp),
        gcCountMetric(info, 'process_weak_callbacks', timestamp),
      ]) {
        cumulativeCounters.push(metric);
      }
    },
    export: () => {
      context.with(suppressTracing(context.active()), () => {
        console.log('CLIENT SEND');
        client.send({
          cumulative_counters: cumulativeCounters,
          gauges,
        });
      });

      gauges = [];
      cumulativeCounters = [];
    }
  }
}

function _loadExtension(): CountersExtension | undefined {
  let extension;
  try {
    extension = require("./native");
  } catch (e) {
    diag.error('Unable to load native metrics extension. Event loop and GC metrics will not be reported', e);
  }

  return extension;
}

export function _setDefaultOptions(options: StartMetricsOptions = {}): MetricsOptions & { sfxClient: signalfx.SignalClient } {
  const accessToken = options.accessToken || process.env.SPLUNK_ACCESS_TOKEN || '';
  const endpoint = options.endpoint || process.env.SPLUNK_METRICS_ENDPOINT || 'http://localhost:9943';
  const dimensions = Object.assign(options.signalfx?.dimensions || {}, {
    host: os.hostname(),
    metric_source: 'splunk-otel-js',
    node_version: process.versions.node,
  });

  const sfxClient = options.signalfx?.client || new signalfx.Ingest(accessToken, {
    ingestEndpoint: endpoint,
    dimensions,
  });

  return {
    accessToken,
    endpoint,
    exportInterval: options.exportInterval || _getEnvNumber('SPLUNK_METRICS_EXPORT_INTERVAL', 5000),
    sfxClient,
  };
}

function _getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  const numberValue = parseInt(value);

  if (isNaN(numberValue)) {
    return defaultValue;
  }

  return numberValue;
}