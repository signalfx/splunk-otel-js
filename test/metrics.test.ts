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

import * as assert from 'assert';
import * as os from 'os';
import { Resource } from '@opentelemetry/resources';
import { metrics } from '@opentelemetry/api-metrics';
import {
  AggregationTemporality,
  DataPoint,
  DataPointType,
  InstrumentType,
  MetricReader,
} from '@opentelemetry/sdk-metrics-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import * as utils from './utils';
import { hrtime } from 'process';
import { startMetrics, _setDefaultOptions } from '../src/metrics';

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

class TestMetricReader extends MetricReader {
  protected async onForceFlush() {}
  protected async onShutdown() {}
}

describe('metrics', () => {
  describe('native counters collection', () => {
    const { metrics } = require('../src/native_ext');

    it('is possible to get native counters', done => {
      const stats = metrics.collect();
      assert.deepStrictEqual(stats, emptyStats());

      metrics.start();

      setTimeout(() => {
        assert.notDeepStrictEqual(metrics.collect(), stats);
        done();
      }, 10);
    });

    it('is possible to reset native counters', () => {
      metrics.reset();
      assert.deepStrictEqual(metrics.collect(), emptyStats());
    });

    it('does not compute event loop lag to be less than the actual execution time', done => {
      metrics.reset();
      const begin = hrtime();

      let duration = hrtime(begin);

      // Spin for 10ms
      while (duration[0] < 1 && duration[1] < 10_000_000) {
        duration = hrtime(begin);
      }

      setTimeout(() => {
        const stats = metrics.collect();
        assert(
          stats.eventLoopLag.max >= duration[1],
          `event loop max below actual execution duration max=${stats.eventLoopLag.max} exec=${duration}`
        );
        done();
      }, 10);
    });
  });

  describe('options', () => {
    beforeEach(utils.cleanEnvironment);
    after(utils.cleanEnvironment);

    it('has expected defaults', () => {
      const options = _setDefaultOptions();
      assert.deepEqual(options.serviceName, 'unnamed-node-service');
      assert.deepEqual(options.accessToken, '');
      assert.deepEqual(options.exportIntervalMillis, 30000);
      assert.deepEqual(
        options.resource,
        new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: 'unnamed-node-service',
        })
      );
      assert.deepEqual(options.runtimeMetricsEnabled, false);
      assert.deepEqual(options.runtimeMetricsCollectionIntervalMillis, 5000);
    });

    it('is possible to set options via env vars', () => {
      process.env.SPLUNK_ACCESS_TOKEN = 'foo';
      process.env.OTEL_SERVICE_NAME = 'bigmetric';
      process.env.OTEL_METRIC_EXPORT_INTERVAL = '1000';
      process.env.OTEL_RESOURCE_ATTRIBUTES = 'key1=val1,key2=val2';
      process.env.SPLUNK_RUNTIME_METRICS_ENABLED = 'true';
      process.env.SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL = '1200';

      const options = _setDefaultOptions();
      assert.deepEqual(options.serviceName, 'bigmetric');
      assert.deepEqual(options.accessToken, 'foo');
      assert.deepEqual(options.exportIntervalMillis, 1000);
      assert.deepEqual(
        options.resource,
        new Resource({
          key1: 'val1',
          key2: 'val2',
          [SemanticResourceAttributes.SERVICE_NAME]: 'bigmetric',
        })
      );
      assert.deepEqual(options.runtimeMetricsEnabled, true);
      assert.deepEqual(options.runtimeMetricsCollectionIntervalMillis, 1200);
    });
  });

  describe('startMetrics', () => {
    let reader: TestMetricReader;

    beforeEach(() => {
      utils.cleanEnvironment();
      reader = new TestMetricReader(AggregationTemporality.CUMULATIVE);
    });

    after(utils.cleanEnvironment);

    // Custom metrics and runtime metrics are done with 1 test as OTel meter provider can't be reset
    it('is possible to use metrics', async () => {
      const resource = new Resource({
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'test',
      });

      startMetrics({
        serviceName: 'foo',
        resource,
        runtimeMetricsEnabled: true,
        runtimeMetricsCollectionIntervalMillis: 1,
        metricReaderFactory: () => {
          return [reader];
        },
      });

      const counter = metrics.getMeter('custom').createCounter('test-counter');
      counter.add(42);

      await new Promise(resolve => setTimeout(resolve, 10));

      const metricData = await reader.collect();

      assert.deepEqual(
        metricData.resource,
        new Resource({
          [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: 'test',
          [SemanticResourceAttributes.SERVICE_NAME]: 'foo',
        })
      );

      // One is the 'custom' meter, the other one is runtime metrics meter
      assert.deepEqual(metricData.instrumentationLibraryMetrics.length, 2);

      const runtimeIlMetrics = metricData.instrumentationLibraryMetrics.find(
        ilMetrics => {
          return (
            ilMetrics.instrumentationLibrary.name ===
            'splunk-otel-js-runtime-metrics'
          );
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

      for (const runtimeMetric of runtimeMetrics) {
        const expected = expectedDescriptors.get(runtimeMetric.descriptor.name);
        assert(expected);

        assert.deepEqual(runtimeMetric.descriptor.unit, expected.unit);

        assert(runtimeMetric.dataPointType === DataPointType.SINGULAR);

        if (runtimeMetric.descriptor.name.includes('memory.gc')) {
          assert(
            runtimeMetric.dataPoints.every(dp =>
              isValidGcAttribute(dp.attributes['gc.type'])
            )
          );
        }
      }
    });
  });
});
