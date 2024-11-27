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
import { AlwaysOnSampler } from '@opentelemetry/sdk-trace-base';

test('Tracing: set up with defaults', async () => {
  const mocks = setupMocks();
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  assertTracingPipeline(
    mocks,
    'http://localhost:4318/v1/traces',
    '@splunk/otel'
  );

  const provider = trace.getTracerProvider();
  assert(provider.getTracer('test')['_sampler'] instanceof AlwaysOnSampler);

  await stopTracing();
});
