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
import { _setDefaultOptions } from '../../src/profiling';
import * as otel from '@opentelemetry/api';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { strict as assert } from 'assert';
import { before, describe, it } from 'node:test';
import { loadAndSetExampleConfig } from './utils';
import { startMetrics } from '../../src/metrics';
import {
  AggregationTemporality,
  InstrumentType,
  MeterProvider,
  PeriodicExportingMetricReader,
  PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPMetricExporter as GrpcOTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { ConsoleMetricExporter } from '../../src';

const INSTRUMENT_TYPES = [
  InstrumentType.COUNTER,
  InstrumentType.OBSERVABLE_COUNTER,
  InstrumentType.GAUGE,
  InstrumentType.HISTOGRAM,
  InstrumentType.OBSERVABLE_GAUGE,
  InstrumentType.UP_DOWN_COUNTER,
  InstrumentType.OBSERVABLE_UP_DOWN_COUNTER,
];

function assertDeltaTemporality(exporter: PushMetricExporter) {
  // asserts on separate lines so we get line numbers in case of failure,
  // otherwise tests erroring with 1 != 0 don't give enough information.
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(InstrumentType.COUNTER),
    AggregationTemporality.DELTA
  );
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(InstrumentType.OBSERVABLE_COUNTER),
    AggregationTemporality.DELTA
  );
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(InstrumentType.GAUGE),
    AggregationTemporality.DELTA
  );
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(InstrumentType.HISTOGRAM),
    AggregationTemporality.DELTA
  );
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(InstrumentType.OBSERVABLE_GAUGE),
    AggregationTemporality.DELTA
  );
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(InstrumentType.UP_DOWN_COUNTER),
    AggregationTemporality.CUMULATIVE
  );
  assert.deepStrictEqual(
    exporter.selectAggregationTemporality?.(
      InstrumentType.OBSERVABLE_UP_DOWN_COUNTER
    ),
    AggregationTemporality.CUMULATIVE
  );
}

function assertCumulativeTemporality(exporter: PushMetricExporter) {
  INSTRUMENT_TYPES.every(
    (t) =>
      exporter.selectAggregationTemporality?.(t) ===
      AggregationTemporality.CUMULATIVE
  );
}

describe('metrics via config file', () => {
  before(() => {
    loadAndSetExampleConfig();
  });

  it('sets up metrics options', () => {
    const { metricsOptions } = parseOptionsAndConfigureInstrumentations();

    // Not interested in endpoint, views as the config pipeline sets them up differently
    assert.deepStrictEqual(metricsOptions.serviceName, 'test_service');
    assert.deepStrictEqual(
      metricsOptions.resource.attributes['string_key'],
      'test_value'
    );
    assert.deepStrictEqual(metricsOptions.runtimeMetricsEnabled, true);
    assert.deepStrictEqual(
      metricsOptions.runtimeMetricsCollectionIntervalMillis,
      30000
    );
  });

  it('sets up the metrics provider', () => {
    const { metricsOptions } = parseOptionsAndConfigureInstrumentations();
    startMetrics(metricsOptions);

    const provider = otel.metrics.getMeterProvider();
    assert(provider instanceof MeterProvider);

    const state = provider['_sharedState'];

    const resAttribs = state['resource'].attributes;
    assert.deepStrictEqual(resAttribs['service.name'], 'test_service');
    assert.deepStrictEqual(resAttribs['string_key'], 'test_value');

    const collectors = state['metricCollectors'];

    assert.deepStrictEqual(collectors.length, 3);

    const [r1, r2, r3] = collectors.map((c: any) => c['_metricReader']);
    {
      assert.ok(r1 instanceof PeriodicExportingMetricReader);
      assert.deepStrictEqual(r1['_exportInterval'], 60000);
      assert.deepStrictEqual(r1['_exportTimeout'], 30000);

      const exporter = r1['_exporter'];
      const transport =
        exporter['_delegate']['_transport']['_transport']['_parameters'];

      assert.ok(exporter instanceof OTLPMetricExporter);

      assertDeltaTemporality(exporter);

      assert.deepStrictEqual(transport['timeoutMillis'], 10000);
      assert.deepStrictEqual(transport['compression'], 'gzip');
      assert.deepStrictEqual(
        transport['url'],
        'http://localhost:4318/v1/metrics'
      );
      assert.deepStrictEqual(transport.headers(), {
        'Content-Type': 'application/x-protobuf',
        'api-key': '1234',
      });
    }

    {
      assert.ok(r2 instanceof PeriodicExportingMetricReader);

      const exporter = r2['_exporter'];
      assert.ok(exporter instanceof GrpcOTLPMetricExporter);
      assertCumulativeTemporality(exporter);

      const transport = exporter['_delegate']['_transport']['_parameters'];
      assert.deepStrictEqual(transport['address'], 'localhost:4320');
      assert.deepStrictEqual(transport['compression'], 'gzip');

      const metadata = transport.metadata();
      assert.deepStrictEqual(metadata.get('api-token'), ['abc']);
      assert.deepStrictEqual(exporter['_delegate']['_timeout'], 15000);
    }

    {
      assert.ok(r3 instanceof PeriodicExportingMetricReader);

      const exporter = r3['_exporter'];
      assert.ok(exporter instanceof ConsoleMetricExporter);
    }

    const views = state['viewRegistry']['_registeredViews'];

    assert.deepStrictEqual(views.length, 1);

    const [view] = views;

    assert.deepStrictEqual(view['name'], 'new_instrument_name');
    assert.deepStrictEqual(view['description'], 'new_description');
    assert.deepStrictEqual(view['aggregationCardinalityLimit'], 2000);

    assert.deepStrictEqual(
      view['aggregation']['_boundaries'],
      [
        0.0, 5.0, 10.0, 25.0, 50.0, 75.0, 100.0, 250.0, 500.0, 750.0, 1000.0,
        2500.0, 5000.0, 7500.0, 10000.0,
      ]
    );

    assert.deepStrictEqual(view['aggregation']['_recordMinMax'], true);

    const instrumentSelector = view['instrumentSelector'];
    assert.deepStrictEqual(
      instrumentSelector.getType(),
      InstrumentType.HISTOGRAM
    );
    assert.deepStrictEqual(
      instrumentSelector.getNameFilter().match('my-instrument'),
      true
    );
    assert.deepStrictEqual(
      instrumentSelector.getUnitFilter().match('ms'),
      true
    );

    const meterSelector = view['meterSelector'];
    assert.deepStrictEqual(
      meterSelector.getNameFilter().match('my-meter'),
      true
    );
  });
});
