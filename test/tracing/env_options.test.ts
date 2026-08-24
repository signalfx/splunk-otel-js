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

import { strict as assert } from 'assert';
import { test } from 'node:test';
import { assertTracingPipeline } from './common';

import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';
import { context, trace, TraceFlags } from '@opentelemetry/api';
import { TraceIdRatioBasedSampler } from '@opentelemetry/sdk-trace-base';

test('Tracing: honors standard sampler env options', async () => {
  const url = 'url-from-env:3030';
  const serviceName = 'env-service';
  const accessToken = 'zxcvb';

  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = url;
  process.env.OTEL_SERVICE_NAME = serviceName;
  process.env.SPLUNK_ACCESS_TOKEN = accessToken;
  process.env.OTEL_TRACES_SAMPLER = 'traceidratio';
  process.env.OTEL_TRACES_SAMPLER_ARG = '1.0';

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  await assertTracingPipeline(`${url}/v1/traces`, serviceName, accessToken);

  const provider = trace.getTracerProvider();
  assert(
    provider.getTracer('test')['_sampler'] instanceof TraceIdRatioBasedSampler
  );

  const unsampledRemoteParent = trace.setSpanContext(context.active(), {
    traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
    spanId: '00f067aa0ba902b7',
    traceFlags: TraceFlags.NONE,
    isRemote: true,
  });
  const span = trace
    .getTracer('test')
    .startSpan('child', {}, unsampledRemoteParent);

  assert.equal(span.spanContext().traceFlags & TraceFlags.SAMPLED, 1);
  span.end();

  await stopTracing();
});
