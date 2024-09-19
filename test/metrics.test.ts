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

import { metrics } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { Resource } from '@opentelemetry/resources';
import {
  AggregationTemporality,
  DataPointType,
  InstrumentType,
  MetricData,
  View,
} from '@opentelemetry/sdk-metrics';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import { hrtime } from 'process';
import { parseOptionsAndConfigureInstrumentations } from '../src/instrumentations';
import { _setDefaultOptions, startMetrics } from '../src/metrics';
import { cleanEnvironment, TestMetricReader } from './utils';
import { strict as assert } from 'assert';
import { describe, it, after, beforeEach } from 'node:test';
import { inspect } from 'util';

function emptyCounter() {
  return {
    min: 0,
    max: 0,
    average: 0,
    sum: 0,
    count: 0,
  };
}

const emptyGcCounter = () => ({
  collected: emptyCounter(),
  duration: emptyCounter(),
});

const emptyStats = () => ({
  eventLoopLag: emptyCounter(),
  gc: {
    all: emptyGcCounter(),
    scavenge: emptyGcCounter(),
    mark_sweep_compact: emptyGcCounter(),
    incremental_marking: emptyGcCounter(),
    process_weak_callbacks: emptyGcCounter(),
  },
});

describe('metrics', () => {
  describe('native counters collection', () => {
    const { metrics } = require('../src/native_ext');

    it('is possible to get native counters', async () => {
      const stats = metrics.collect();
      assert.deepStrictEqual(stats, emptyStats());

      metrics.start();

      await new Promise((resolve) => setTimeout(resolve, 10));
      const stats2 = metrics.collect();
      console.log(inspect(stats2, {showHidden: false, depth: null, colors: true}));
      console.log('------------------------------');
      console.log(inspect(stats, {showHidden: false, depth: null, colors: true}));
      assert.notDeepStrictEqual(stats2, stats);
    });

    it('is possible to reset native counters', () => {
      metrics.reset();
      assert.deepStrictEqual(metrics.collect(), emptyStats());
    });

    it('does not compute event loop lag to be less than the actual execution time', async () => {
      metrics.reset();
      const begin = hrtime();

      let duration = hrtime(begin);

      // Spin for 10ms
      while (duration[0] < 1 && duration[1] < 10_000_000) {
        duration = hrtime(begin);
      }

      await new Promise((resolve) => setTimeout(resolve, 10));
      const stats = metrics.collect();
      assert(
        stats.eventLoopLag.max >= duration[1],
        `event loop max below actual execution duration max=${stats.eventLoopLag.max} exec=${duration}`
      );
    });
  });

  describe('options', () => {
    beforeEach(cleanEnvironment);
    after(cleanEnvironment);

    it('has expected defaults', () => {
      const options = _setDefaultOptions();
      assert.deepEqual(options.serviceName, '@splunk/otel');
      assert.deepEqual(options.accessToken, '');
      assert.deepEqual(options.exportIntervalMillis, 30000);
      assert.deepEqual(
        options.resource.attributes[SemanticResourceAttributes.SERVICE_NAME],
        '@splunk/otel'
      );
      assert.deepEqual(options.runtimeMetricsEnabled, true);
      assert.deepEqual(options.runtimeMetricsCollectionIntervalMillis, 5000);
      assert(
        options.metricReaderFactory(options)[0]['_exporter'] instanceof
          OTLPMetricExporter,
        'Expected the default metric exporter to be OTLP gRPC'
      );
      assert.deepEqual(options.debugMetricsEnabled, false);
    });

    it('is possible to set options via env vars', () => {
      process.env.SPLUNK_ACCESS_TOKEN = 'foo';
      process.env.OTEL_SERVICE_NAME = 'bigmetric';
      process.env.OTEL_METRIC_EXPORT_INTERVAL = '1000';
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'key1=val1,key2=val2';
      process.env.SPLUNK_RUNTIME_METRICS_ENABLED = 'true';
      process.env.SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL = '1200';
      process.env.SPLUNK_DEBUG_METRICS_ENABLED = 'true';

      const options = _setDefaultOptions();
      assert.deepEqual(options.serviceName, 'bigmetric');
      assert.deepEqual(options.accessToken, 'foo');
      assert.deepEqual(options.exportIntervalMillis, 1000);
      assert.deepEqual(options.resource.attributes['key1'], 'val1');
      assert.deepEqual(options.resource.attributes['key2'], 'val2');
      assert.deepEqual(
        options.resource.attributes[SemanticResourceAttributes.SERVICE_NAME],
        'bigmetric'
      );
      assert.deepEqual(options.runtimeMetricsEnabled, true);
      assert.deepEqual(options.runtimeMetricsCollectionIntervalMillis, 1200);
      assert.deepEqual(options.debugMetricsEnabled, true);
    });
  });

  describe('startMetrics', () => {
    let reader: TestMetricReader;

    beforeEach(() => {
      cleanEnvironment();
      reader = new TestMetricReader(AggregationTemporality.CUMULATIVE);
    });

    after(cleanEnvironment);

    // Custom metrics and runtime metrics are done with 1 test as OTel meter provider can't be reset
    it('is possible to use metrics', async () => {
      const resource = new Resource({
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'test',
      });
      const { metricsOptions } = parseOptionsAndConfigureInstrumentations({
        metrics: {
          serviceName: 'foo',
          resourceFactory: (defaultResource: Resource) => {
            return defaultResource.merge(resource);
          },
          views: [
            new View({ name: 'clicks.xyz', instrumentName: 'test-counter' }),
          ],
          runtimeMetricsEnabled: true,
          runtimeMetricsCollectionIntervalMillis: 1,
          metricReaderFactory: () => {
            return [reader];
          },
        },
      });

      startMetrics(metricsOptions);

      const counter = metrics.getMeter('custom').createCounter('test-counter');
      counter.add(42);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const metricData = await reader.collect();

      assert.deepEqual(
        metricData.resourceMetrics.resource.attributes[
          SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT
        ],
        'test'
      );

      assert.deepEqual(
        metricData.resourceMetrics.resource.attributes[
          SemanticResourceAttributes.SERVICE_NAME
        ],
        'foo'
      );

      // One is the 'custom' meter, the other one is runtime metrics meter
      assert.deepEqual(metricData.resourceMetrics.scopeMetrics.length, 2);

      const customMetrics = metricData.resourceMetrics.scopeMetrics.find(
        (scopeMetrics) => {
          return scopeMetrics.scope.name === 'custom';
        }
      );

      assert.deepEqual(customMetrics.metrics[0].descriptor.name, 'clicks.xyz');

      const runtimeIlMetrics = metricData.resourceMetrics.scopeMetrics.find(
        (scopeMetrics) => {
          return scopeMetrics.scope.name === 'splunk-otel-js-runtime-metrics';
        }
      );

      assert.notEqual(runtimeIlMetrics, undefined);

      const runtimeMetrics = runtimeIlMetrics.metrics;
      assert.equal(runtimeMetrics.length, 8);

      const expectedDescriptors = new Map([
        [
          'process.runtime.nodejs.memory.heap.total',
          { unit: 'By', type: InstrumentType.OBSERVABLE_GAUGE },
        ],
        [
          'process.runtime.nodejs.memory.heap.used',
          { unit: 'By', type: InstrumentType.OBSERVABLE_GAUGE },
        ],
        [
          'process.runtime.nodejs.memory.rss',
          { unit: 'By', type: InstrumentType.OBSERVABLE_GAUGE },
        ],
        [
          'process.runtime.nodejs.event_loop.lag.max',
          { unit: 'ns', type: InstrumentType.OBSERVABLE_GAUGE },
        ],
        [
          'process.runtime.nodejs.event_loop.lag.min',
          { unit: 'ns', type: InstrumentType.OBSERVABLE_GAUGE },
        ],
        [
          'process.runtime.nodejs.memory.gc.size',
          { unit: 'By', type: InstrumentType.COUNTER },
        ],
        [
          'process.runtime.nodejs.memory.gc.pause',
          { unit: 'By', type: InstrumentType.COUNTER },
        ],
        [
          'process.runtime.nodejs.memory.gc.count',
          { unit: '1', type: InstrumentType.COUNTER },
        ],
      ]);

      const validGcTypes = new Set([
        'all',
        'scavenge',
        'mark_sweep_compact',
        'incremental_marking',
        'process_weak_callbacks',
      ]);

      const isValidGcAttribute = (v: unknown) => {
        if (typeof v !== 'string') return false;
        return validGcTypes.has(v);
      };

      const isSumMetric = (v: MetricData) =>
        v.descriptor.name.includes('memory.gc');

      for (const runtimeMetric of runtimeMetrics) {
        const expected = expectedDescriptors.get(runtimeMetric.descriptor.name);
        assert(expected);

        assert.deepEqual(runtimeMetric.descriptor.unit, expected.unit);

        if (isSumMetric(runtimeMetric)) {
          assert.deepEqual(runtimeMetric.dataPointType, DataPointType.SUM);
        } else {
          assert.deepEqual(runtimeMetric.dataPointType, DataPointType.GAUGE);
        }

        if (runtimeMetric.descriptor.name.includes('memory.gc')) {
          assert(
            runtimeMetric.dataPoints.every((dp) =>
              isValidGcAttribute(dp.attributes['gc.type'])
            )
          );
        }
      }
    });
  });
});
