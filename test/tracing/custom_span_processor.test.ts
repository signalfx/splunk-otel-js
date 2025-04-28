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

import { trace } from '@opentelemetry/api';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';
import { getSpanProcessors } from '../utils';

test('Tracing: set up with span processor', async () => {
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      spanProcessorFactory: () => {
        return new SimpleSpanProcessor(new ConsoleSpanExporter());
      },
    },
  });

  startTracing(tracingOptions);

  const [p1] = getSpanProcessors(trace.getTracerProvider());

  assert(p1 instanceof SimpleSpanProcessor);
  const exp1 = p1['_exporter'];
  assert(exp1 instanceof ConsoleSpanExporter);
  await stopTracing();
});
