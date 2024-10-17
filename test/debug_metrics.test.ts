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

import { AggregationTemporality } from '@opentelemetry/sdk-metrics';
import { strict as assert } from 'assert';
import { after, test } from 'node:test';
import { start, stop } from '../src';
import { TestMetricReader } from './utils';

test('debug metrics', async () => {
  const reader: TestMetricReader = new TestMetricReader(
    AggregationTemporality.CUMULATIVE
  );

  after(async () => {
    await stop();
  });

  start({
    serviceName: 'debugmetrics',
    tracing: false,
    profiling: {
      collectionDuration: 100,
      callstackInterval: 10,
      memoryProfilingEnabled: true,
      exporterFactory: () => {
        return [
          {
            send: () => {},
            sendHeapProfile: () => {},
          },
        ];
      },
    },
    metrics: {
      debugMetricsEnabled: true,
      metricReaderFactory: () => {
        return [reader];
      },
    },
  });

  await new Promise((resolve) => setTimeout(resolve, 1_000));

  const metricData = await reader.collect();
  const scopeMetrics = metricData.resourceMetrics.scopeMetrics.find(
    (sm) => sm.scope.name === 'splunk-otel-js-debug-metrics'
  );

  assert.notStrictEqual(scopeMetrics, undefined);

  const { metrics: debugMetrics } = scopeMetrics!;

  const allowedNames = new Set([
    'splunk.profiler.cpu.start.duration',
    'splunk.profiler.cpu.stop.duration',
    'splunk.profiler.cpu.process.duration',
    'splunk.profiler.heap.collect.duration',
    'splunk.profiler.heap.process.duration',
  ]);

  assert.deepStrictEqual(debugMetrics.length, allowedNames.size);

  for (const { descriptor, dataPoints } of debugMetrics) {
    assert(
      allowedNames.has(descriptor.name),
      `invalid metric name ${descriptor.name}`
    );
    assert.deepStrictEqual(descriptor.type, 'HISTOGRAM');
    assert.deepStrictEqual(descriptor.unit, 'ns');
    assert(
      dataPoints[0].value['count'] > 0,
      'expected datapoint count to be more than 0'
    );
  }
});
