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
  AggregationTemporality,
  DataPointType,
  Histogram,
  InstrumentDescriptor,
  ScopeMetrics,
  PushMetricExporter,
  ResourceMetrics,
  InstrumentType,
} from '@opentelemetry/sdk-metrics-base';
import { ValueType } from '@opentelemetry/api-metrics';
import {
  ExportResult,
  ExportResultCode,
  hrTimeToTimeStamp,
} from '@opentelemetry/core';

function logDescriptor(descriptor: InstrumentDescriptor) {
  const valueType = descriptor.valueType === ValueType.INT ? 'INT' : 'DOUBLE';
  console.dir({ ...descriptor, valueType });
}

function logScopeMetrics(scopeMetrics: ScopeMetrics, index: number) {
  const { scope, metrics } = scopeMetrics;

  console.log(`ScopeMetrics #${index}`);
  console.log(
    `InstrumentationScope name=${scope.name} version=${
      scope.version || ''
    } schemaUrl=${scope.schemaUrl || ''}`
  );

  for (let i = 0; i < metrics.length; i++) {
    const { descriptor, dataPoints, dataPointType } = metrics[i];
    console.log(`Metric #${i}, descriptor:`);
    logDescriptor(descriptor);
    const dataPointTypeName =
      dataPointType === DataPointType.HISTOGRAM
        ? 'HistogramDataPoints'
        : 'NumberDataPoints';

    for (let j = 0; j < dataPoints.length; j++) {
      const dp = dataPoints[j];
      console.log(`${dataPointTypeName} #${j}`);
      console.log(`StartTimestamp ${hrTimeToTimeStamp(dp.startTime)}`);
      console.log(`Timestamp ${hrTimeToTimeStamp(dp.endTime)}`);

      if (
        dataPointType === DataPointType.SUM ||
        dataPointType === DataPointType.GAUGE
      ) {
        const value = dp.value as number;
        console.log(`Value: ${value.toFixed(6)}`);
      } else {
        const value = dp.value as Histogram;
        const { buckets } = value;
        const { boundaries, counts } = buckets;
        console.log(`Count: ${value.count}`);
        if (value.sum !== undefined) {
          console.log(`Sum: ${value.sum.toFixed(6)}`);
        }
        if (value.min !== undefined) {
          console.log(`Min: ${value.min.toFixed(6)}`);
        }
        if (value.max !== undefined) {
          console.log(`Max: ${value.max.toFixed(6)}`);
        }
        console.log('Bucket counts:');
        for (let boundIdx = -1; boundIdx < boundaries.length; boundIdx++) {
          const lb = boundaries[boundIdx] ?? -Infinity;
          const ub = boundaries[boundIdx + 1] ?? Infinity;
          const count = counts[boundIdx + 1];
          console.log(`  [${lb}, ${ub}) -> ${count}`);
        }
      }
    }
  }
}

export interface ConsoleMetricExporterOptions {
  temporalityPreference?: AggregationTemporality;
}

export class ConsoleMetricExporter implements PushMetricExporter {
  private _aggregationTemporality: AggregationTemporality;

  constructor(options: ConsoleMetricExporterOptions = {}) {
    this._aggregationTemporality =
      options.temporalityPreference ?? AggregationTemporality.CUMULATIVE;
  }

  export(
    metrics: ResourceMetrics,
    resultCallback: (result: ExportResult) => void
  ) {
    console.log('Resource metrics:');
    console.dir(metrics.resource);

    for (let i = 0; i < metrics.scopeMetrics.length; i++) {
      logScopeMetrics(metrics.scopeMetrics[i], i);
    }

    resultCallback({
      code: ExportResultCode.SUCCESS,
    });
  }

  selectAggregationTemporality(
    _instrumentType: InstrumentType
  ): AggregationTemporality {
    return this._aggregationTemporality;
  }

  async forceFlush() {}

  async shutdown() {}
}
