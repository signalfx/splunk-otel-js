/*
 * Copyright 2021 Splunk Inc.
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
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

import { EnvResourceDetector } from './resource';
import { Options, _setDefaultOptions } from './options';
import { _patchJaeger } from './jaeger';

export function startTracing(opts: Partial<Options> = {}): void {
  if (process.env.OTEL_TRACE_ENABLED === 'false') {
    return;
  }

  propagation.setGlobalPropagator(
    new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
  );

  const options = _setDefaultOptions(opts);

  _patchJaeger(options.maxAttrLength);

  const provider = new NodeTracerProvider({
    resource: new EnvResourceDetector().detect(),
  });

  registerInstrumentations({ tracerProvider: provider });

  provider.register({ contextManager: new AsyncHooksContextManager() });

  const jaegerOptions = {
    serviceName: options.serviceName!,
    endpoint: options.endpoint,
    tags: [],
    username: '',
    password: '',
  };

  const accessToken = options.accessToken || process.env.SPLK_ACCESS_TOKEN;
  if (accessToken) {
    jaegerOptions.username = 'auth';
    jaegerOptions.password = accessToken;
  }

  provider.addSpanProcessor(
    new options.spanProcessor(new JaegerExporter(jaegerOptions))
  );
}
