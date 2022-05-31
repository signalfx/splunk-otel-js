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
import { gte } from 'semver';

import { context, propagation, trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';

import { configureHttpInstrumentation } from '../instrumentations/http';
import { configureLogInjection } from '../instrumentations/logging';
import { Options, _setDefaultOptions } from './options';
import { configureRedisInstrumentation } from '../instrumentations/redis';
import { parseEnvBooleanString } from '../utils';

/**
 * We disallow calling `startTracing` twice because:
 * 1. This is very rarely the user intention;
 * 2. Causes unexpected applied configuration to OTel libs;
 * 3. There's no way to reliably clean up before applying new configuration.
 * However, having a mechanism to allow that in tests is useful even if it
 * leaks and is inperfect in terms of the end result.
 */
const allowDoubleStart = parseEnvBooleanString(
  process.env.TEST_ALLOW_DOUBLE_START
);
let isStarted = false;

let unregisterInstrumentations: (() => void) | null = null;

export { Options as TracingOptions };
export function startTracing(opts: Partial<Options> = {}): boolean {
  assert(!isStarted || allowDoubleStart, 'Splunk APM already started');
  isStarted = true;

  const options = _setDefaultOptions(opts);

  // propagator
  propagation.setGlobalPropagator(options.propagatorFactory(options));

  // context manager
  const ContextManager = gte(process.version, '14.8.0')
    ? AsyncLocalStorageContextManager
    : AsyncHooksContextManager;
  const contextManager = new ContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);

  // tracer provider
  const provider = new NodeTracerProvider(options.tracerConfig);

  configureInstrumentations(options);

  // instrumentations
  unregisterInstrumentations = registerInstrumentations({
    tracerProvider: provider,
    instrumentations: options.instrumentations,
  });

  // processors
  let processors = options.spanProcessorFactory(options);
  if (!Array.isArray(processors)) {
    processors = [processors];
  }

  for (const i in processors) {
    provider.addSpanProcessor(processors[i]);
  }

  // register global provider
  trace.setGlobalTracerProvider(provider);

  return true;
}

export function stopTracing() {
  unregisterInstrumentations?.();
  unregisterInstrumentations = null;

  propagation.disable();
  context.disable();
  trace.disable();
}

function configureInstrumentations(options: Options) {
  for (const instrumentation of options.instrumentations) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instr = instrumentation as any;

    switch (instr['instrumentationName']) {
      case '@opentelemetry/instrumentation-http':
        configureHttpInstrumentation(instr, options);
        break;
      case '@opentelemetry/instrumentation-redis':
        configureRedisInstrumentation(instr, options);
        break;
      case '@opentelemetry/instrumentation-bunyan':
      case '@opentelemetry/instrumentation-pino':
      case '@opentelemetry/instrumentation-winston':
        configureLogInjection(instr);
        break;
    }
  }
}
