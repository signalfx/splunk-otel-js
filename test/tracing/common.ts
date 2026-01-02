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

import { ProxyTracerProvider, trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { exporterHeaders, exporterUrl, getSpanProcessors } from '../utils';

export async function assertTracingPipeline(
  exportURL: string,
  serviceName: string,
  accessToken?: string
) {
  const provider = trace.getTracerProvider() as ProxyTracerProvider;
  const processors = getSpanProcessors(provider);
  const processor = processors[0];
  assert(processor instanceof BatchSpanProcessor);
  const exporter = processor['_exporter'];
  assert(exporter instanceof OTLPTraceExporter);

  assert.strictEqual(
    provider.getDelegate()['_resource'].attributes[ATTR_SERVICE_NAME],
    serviceName
  );
  assert.strictEqual(exporterUrl(exporter), exportURL);

  const headers = await exporterHeaders(exporter);
  if (accessToken) {
    assert.equal(headers['X-SF-TOKEN'], accessToken);
  }
}
