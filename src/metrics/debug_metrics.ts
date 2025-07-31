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

import { Histogram, metrics, Meter } from '@opentelemetry/api';
import { ViewOptions, AggregationType } from '@opentelemetry/sdk-metrics';

interface Meters {
  meter: Meter;
  cpuProfilerStartDuration: Histogram;
  cpuProfilerStopDuration: Histogram;
  cpuProfilerProcessingStepDuration: Histogram;
  heapProfilerCollectDuration: Histogram;
  heapProfilerProcessingStepDuration: Histogram;
}

let meters: Meters | undefined;

const instrumentCpuProfilerStart = 'splunk.profiler.cpu.start.duration';
const instrumentCpuProfilerStop = 'splunk.profiler.cpu.stop.duration';
const instrumentCpuProfilerProcess = 'splunk.profiler.cpu.process.duration';
const instrumentHeapProfilerCollect = 'splunk.profiler.heap.collect.duration';
const instrumentHeapProfilerProcess = 'splunk.profiler.heap.process.duration';

export function enableDebugMetrics() {
  const meter = metrics.getMeter('splunk-otel-js-debug-metrics');
  const opts = { unit: 'ns' };
  const cpuProfilerStartDuration = meter.createHistogram(
    instrumentCpuProfilerStart,
    opts
  );
  const cpuProfilerStopDuration = meter.createHistogram(
    instrumentCpuProfilerStop,
    opts
  );
  const cpuProfilerProcessingStepDuration = meter.createHistogram(
    instrumentCpuProfilerProcess,
    opts
  );
  const heapProfilerCollectDuration = meter.createHistogram(
    instrumentHeapProfilerCollect,
    opts
  );
  const heapProfilerProcessingStepDuration = meter.createHistogram(
    instrumentHeapProfilerProcess,
    opts
  );

  meters = {
    meter,
    cpuProfilerStartDuration,
    cpuProfilerStopDuration,
    cpuProfilerProcessingStepDuration,
    heapProfilerCollectDuration,
    heapProfilerProcessingStepDuration,
  };
}

export function recordCpuProfilerMetrics(metrics: {
  profilerStartDuration: number;
  profilerStopDuration: number;
  profilerProcessingStepDuration: number;
}) {
  if (meters === undefined) {
    return;
  }

  meters.cpuProfilerStartDuration.record(metrics.profilerStartDuration);
  meters.cpuProfilerStopDuration.record(metrics.profilerStopDuration);
  meters.cpuProfilerProcessingStepDuration.record(
    metrics.profilerProcessingStepDuration
  );
}

export function recordHeapProfilerMetrics(metrics: {
  profilerCollectDuration: number;
  profilerProcessingStepDuration: number;
}) {
  if (meters === undefined) {
    return;
  }

  meters.heapProfilerCollectDuration.record(metrics.profilerCollectDuration);
  meters.heapProfilerProcessingStepDuration.record(
    metrics.profilerProcessingStepDuration
  );
}

export function getDebugMetricsViews(): ViewOptions[] {
  return [
    instrumentCpuProfilerStart,
    instrumentCpuProfilerStop,
    instrumentCpuProfilerProcess,
  ].map((instrumentName) => ({
    instrumentName,
    aggregation: {
      type: AggregationType.EXPLICIT_BUCKET_HISTOGRAM,
      options: {
        boundaries: [1e6, 1e8, 1e9, 1e10],
        recordMinMax: true,
      },
    },
  }));
}
