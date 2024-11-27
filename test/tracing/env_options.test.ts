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
import { assertTracingPipeline, setupMocks } from './common';

import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';
import { trace } from '@opentelemetry/api';
import { ParentBasedSampler } from '@opentelemetry/sdk-trace-base';

test('Tracing: set up with env options', async () => {
  const mocks = setupMocks();

  const url = 'url-from-env:3030';
  const serviceName = 'env-service';
  const accessToken = 'zxcvb';

  process.env.OTEL_EXPORTER_OTLP_ENDPOINT = url;
  process.env.OTEL_SERVICE_NAME = serviceName;
  process.env.SPLUNK_ACCESS_TOKEN = accessToken;
  process.env.OTEL_TRACES_SAMPLER = 'parentbased_always_on';

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  assertTracingPipeline(mocks, `${url}/v1/traces`, serviceName, accessToken);

  const provider = trace.getTracerProvider();
  assert(provider.getTracer('test')['_sampler'] instanceof ParentBasedSampler);

  await stopTracing();
});
