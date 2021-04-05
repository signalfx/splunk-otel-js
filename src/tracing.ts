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
  context,
  isSpanContextValid,
  propagation,
  trace,
} from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import {
  HttpInstrumentationConfig,
  HttpResponseCustomAttributeFunction,
} from '@opentelemetry/instrumentation-http';
import { ServerResponse } from 'http';

import { Options, _setDefaultOptions } from './options';
import { _patchJaeger } from './jaeger';
import { gte } from 'semver';
import {
  AsyncHooksContextManager,
  AsyncLocalStorageContextManager,
} from '@opentelemetry/context-async-hooks';

export function startTracing(opts: Partial<Options> = {}): void {
  if (process.env.OTEL_TRACE_ENABLED === 'false') {
    return;
  }

  const options = _setDefaultOptions(opts);

  _patchJaeger(options.maxAttrLength);

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
  registerInstrumentations({
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function configureHttpInstrumentation(instrumentation: any, options: Options) {
  if (!options.serverTimingEnabled) {
    return;
  }

  if (
    typeof instrumentation['setConfig'] !== 'function' ||
    typeof instrumentation['_getConfig'] !== 'function'
  ) {
    return;
  }

  const responseHook: HttpResponseCustomAttributeFunction = (
    span,
    response
  ) => {
    if (response instanceof ServerResponse) {
      const spanContext = span.context();

      if (isSpanContextValid(spanContext)) {
        const { traceId, spanId } = spanContext;

        response.setHeader('Access-Control-Expose-Headers', 'Server-Timing');
        response.setHeader(
          'Server-Timing',
          `traceparent;desc="00-${traceId}-${spanId}-01"`
        );
      }
    }
  };

  let config = instrumentation._getConfig() as HttpInstrumentationConfig;

  if (config === undefined) {
    config = { responseHook };
  } else if (config.responseHook !== undefined) {
    const original = config.responseHook;
    config.responseHook = function (this: unknown, span, response) {
      responseHook(span, response);
      original.call(this, span, response);
    };
  } else {
    config.responseHook = responseHook;
  }

  instrumentation.setConfig(config);
}

function configureInstrumentations(options: Options) {
  for (const instrumentation of options.instrumentations) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instr = instrumentation as any;
    if (
      instr['instrumentationName'] === '@opentelemetry/instrumentation-http'
    ) {
      configureHttpInstrumentation(instr, options);
    }
  }
}
