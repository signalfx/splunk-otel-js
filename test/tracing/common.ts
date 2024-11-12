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
import { mock } from 'node:test';

import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ProxyTracerProvider } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { exporterHeaders, exporterUrl } from '../utils';

export function setupMocks() {
  const addSpanProcessorMock = mock.method(
    NodeTracerProvider.prototype,
    'addSpanProcessor'
  );

  return {
    addSpanProcessorMock,
  };
}

export function assertTracingPipeline(
  mocks: ReturnType<typeof setupMocks>,
  exportURL: string,
  serviceName: string,
  accessToken?: string
) {
  const { addSpanProcessorMock } = mocks;
  assert.equal(addSpanProcessorMock.mock.callCount(), 1);
  const processor = addSpanProcessorMock.mock.calls[0].arguments[0];
  assert(processor instanceof BatchSpanProcessor);
  const exporter = processor['_exporter'];
  assert(exporter instanceof OTLPTraceExporter);

  const proxy = trace.getTracerProvider() as ProxyTracerProvider;
  const provider = proxy.getDelegate() as NodeTracerProvider;

  assert.strictEqual(
    provider.resource.attributes[ATTR_SERVICE_NAME],
    serviceName
  );
  assert.strictEqual(exporterUrl(exporter), exportURL);

  if (accessToken) {
    assert.equal(exporterHeaders(exporter)['X-SF-TOKEN'], accessToken);
  }
}
