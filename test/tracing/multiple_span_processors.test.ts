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
import { ProxyTracerProvider, trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing } from '../../src/tracing';

test('Tracing: set up with multiple span processors', async () => {
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      spanProcessorFactory: () => {
        return [
          new SimpleSpanProcessor(new ConsoleSpanExporter()),
          new BatchSpanProcessor(new InMemorySpanExporter()),
        ];
      },
    },
  });

  startTracing(tracingOptions);

  const proxy = trace.getTracerProvider() as ProxyTracerProvider;
  const provider = proxy.getDelegate() as NodeTracerProvider;

  const [p1, p2] = provider['_activeSpanProcessor']['_spanProcessors'];

  assert(p1 instanceof SimpleSpanProcessor);
  const exp1 = p1['_exporter'];
  assert(exp1 instanceof ConsoleSpanExporter);

  assert(p2 instanceof BatchSpanProcessor);
  const exp2 = p2['_exporter'];
  assert(exp2 instanceof InMemorySpanExporter);
});
