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

import { NodeTracerProvider } from '@opentelemetry/node';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

const defaultEndpoint = 'http://localhost:9080/v1/trace';
const defaultServiceName = 'unnamed-node-service';

interface Options {
  endpoint?: string;
  serviceName?: string;
  accessToken?: string;
}

export function startTracing(options: Options = {}): void {
  const provider = new NodeTracerProvider({});

  registerInstrumentations({
    tracerProvider: provider,
  });

  provider.register();

  const jaegerOptions = {
    serviceName:
      options.serviceName ||
      process.env.SPLK_SERVICE_NAME ||
      defaultServiceName,
    endpoint:
      options.endpoint ||
      process.env.SPLK_TRACE_EXPORTER_URL ||
      defaultEndpoint,
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
    new BatchSpanProcessor(new JaegerExporter(jaegerOptions))
  );
}
