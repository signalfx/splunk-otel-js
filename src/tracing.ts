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

import { propagation } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';

import { Options, _setDefaultOptions } from './options';
import { _patchJaeger } from './jaeger';

export function startTracing(opts: Partial<Options> = {}): void {
  if (process.env.OTEL_TRACE_ENABLED === 'false') {
    return;
  }

  const options = _setDefaultOptions(opts);

  _patchJaeger(options.maxAttrLength);

  propagation.setGlobalPropagator(
    new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
  );

  const provider = new NodeTracerProvider(options.tracerConfig);

  registerInstrumentations({
    tracerProvider: provider,
    instrumentations: options.instrumentations,
  });

  provider.register();

  let processors = options.spanProcessorFactory(options);
  if (!Array.isArray(processors)) {
    processors = [processors];
  }

  for (const i in processors) {
    provider.addSpanProcessor(processors[i]);
  }
}
