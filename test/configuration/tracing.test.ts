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
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { strict as assert } from 'assert';
import { before, describe, it } from 'node:test';
import { loadAndSetExampleConfig } from './utils';
import { startTracing } from '../../src/tracing';
import * as otel from '@opentelemetry/api';
import { SplunkBatchSpanProcessor } from '../../src/tracing/SplunkBatchSpanProcessor';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { OTLPTraceExporter as GrpcOTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ConsoleSpanExporter,
  ParentBasedSampler,
  SimpleSpanProcessor,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';
import {
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { AWSXRayPropagator } from '@opentelemetry/propagator-aws-xray';

describe('tracing via config file', () => {
  before(() => {
    loadAndSetExampleConfig();
  });

  it('sets up tracing options', () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();

    assert.deepStrictEqual(
      tracingOptions.tracerConfig?.resource?.attributes['string_key'],
      'test_value'
    );
    assert.deepStrictEqual(tracingOptions.serviceName, 'test_service');
    assert.deepStrictEqual(tracingOptions.serverTimingEnabled, false);
    assert.deepStrictEqual(tracingOptions.captureHttpRequestUriParams, [
      'userId',
    ]);

    const tracerConfig = tracingOptions.tracerConfig;

    assert.deepStrictEqual(tracerConfig.generalLimits, {
      attributeValueLengthLimit: 4090,
      attributeCountLimit: 110,
    });

    assert.deepStrictEqual(tracerConfig.spanLimits, {
      attributeValueLengthLimit: 2500,
      attributeCountLimit: 150,
      eventCountLimit: 151,
      linkCountLimit: 152,
      attributePerEventCountLimit: 153,
      attributePerLinkCountLimit: 154,
    });

    const propagators =
      tracingOptions.propagatorFactory(tracingOptions)['_propagators'];

    assert.deepStrictEqual(propagators.length, 5);

    assert.ok(propagators[0] instanceof W3CTraceContextPropagator);
    assert.ok(propagators[1] instanceof W3CBaggagePropagator);
    assert.ok(propagators[2] instanceof B3Propagator);
    assert.ok(propagators[3] instanceof B3Propagator);
    assert.ok(propagators[4] instanceof AWSXRayPropagator);

    assert.deepStrictEqual(propagators[2]['_fields'], ['b3']);
    assert.deepStrictEqual(propagators[3]['_fields'], [
      'x-b3-traceid',
      'x-b3-spanid',
      'x-b3-flags',
      'x-b3-sampled',
      'x-b3-parentspanid',
    ]);
  });

  it('sets up the tracing pipeline', async () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();

    startTracing(tracingOptions);

    const provider = otel.trace.getTracerProvider()['_delegate'];
    const providerConfig = provider['_config'];

    assert.deepStrictEqual(providerConfig['generalLimits'], {
      attributeValueLengthLimit: 4090,
      attributeCountLimit: 110,
    });

    assert.deepStrictEqual(providerConfig['spanLimits'], {
      attributeValueLengthLimit: 2500,
      attributeCountLimit: 150,
      eventCountLimit: 151,
      linkCountLimit: 152,
      attributePerEventCountLimit: 153,
      attributePerLinkCountLimit: 154,
    });

    const spanProcessors = providerConfig['spanProcessors'];

    assert.deepStrictEqual(spanProcessors.length, 3);

    const [p1, p2, p3] = spanProcessors;

    {
      assert.ok(p1 instanceof SplunkBatchSpanProcessor);
      assert.deepStrictEqual(p1['_maxExportBatchSize'], 215);
      assert.deepStrictEqual(p1['_maxQueueSize'], 3000);
      assert.deepStrictEqual(p1['_scheduledDelayMillis'], 4000);
      assert.deepStrictEqual(p1['_exportTimeoutMillis'], 32000);

      const exporter = p1['_exporter'];

      assert.ok(exporter instanceof OTLPTraceExporter);
      const exporterParams =
        exporter['_delegate']['_transport']['_transport']['_parameters'];

      assert.deepStrictEqual(exporterParams['timeoutMillis'], 11000);
      assert.deepStrictEqual(exporterParams['compression'], 'gzip');
      assert.deepStrictEqual(await exporterParams.headers(), {
        'api-key': '1234',
        'Content-Type': 'application/x-protobuf',
      });
      assert.deepStrictEqual(
        exporterParams['url'],
        'http://localhost:4318/v1/traces'
      );
    }

    {
      assert.ok(p2 instanceof SplunkBatchSpanProcessor);
      assert.deepStrictEqual(p2['_maxExportBatchSize'], 512);
      assert.deepStrictEqual(p2['_maxQueueSize'], 2048);
      assert.deepStrictEqual(p2['_scheduledDelayMillis'], 5000);
      assert.deepStrictEqual(p2['_exportTimeoutMillis'], 30000);

      const exporter = p2['_exporter'];

      assert.deepStrictEqual(exporter['_delegate']['_timeout'], 12000);
      assert.ok(exporter instanceof GrpcOTLPTraceExporter);

      const transport = exporter['_delegate']['_transport']['_parameters'];
      assert.deepStrictEqual(transport['address'], 'localhost:4317');
      assert.deepStrictEqual(transport['compression'], 'gzip');

      const metadata = transport.metadata();
      assert.deepStrictEqual(metadata.get('api-key'), ['1234']);
    }

    {
      assert.ok(p3 instanceof SimpleSpanProcessor);
      const exporter = p3['_exporter'];
      assert.ok(exporter instanceof ConsoleSpanExporter);
    }

    const tracer = otel.trace.getTracer('test-tracer');

    const sampler = tracer['_sampler'];
    assert.ok(sampler instanceof ParentBasedSampler);

    assert.ok(sampler['_root'] instanceof TraceIdRatioBasedSampler);
    assert.deepStrictEqual(sampler['_root']['_ratio'], 0.0001);
    assert.ok(sampler['_remoteParentSampled'] instanceof AlwaysOnSampler);
    assert.ok(sampler['_remoteParentNotSampled'] instanceof AlwaysOnSampler);
    assert.ok(sampler['_localParentSampled'] instanceof AlwaysOffSampler);
    assert.ok(sampler['_localParentNotSampled'] instanceof AlwaysOffSampler);
  });
});
