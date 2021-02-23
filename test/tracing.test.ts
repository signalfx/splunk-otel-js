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

import * as assert from 'assert';
import * as sinon from 'sinon';
import * as URL from 'url';
import { BatchSpanProcessor } from '@opentelemetry/tracing';
import { NodeTracerProvider } from '@opentelemetry/node';
import { startTracing } from '../src/tracing';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

describe('tracing', () => {
  const addSpanProcessorMock = sinon.stub(
    NodeTracerProvider.prototype,
    'addSpanProcessor'
  );

  function assertTracingPipeline(
    exportURL: string,
    serviceName: string,
    accessToken?: string
  ) {
    sinon.assert.calledOnce(addSpanProcessorMock);
    const processor = addSpanProcessorMock.getCall(0).args[0];

    assert(processor instanceof BatchSpanProcessor);
    const exporter = processor['_exporter'];
    assert(exporter instanceof JaegerExporter);

    const sender = exporter['_sender'];
    assert.deepEqual(sender['_url'], URL.parse(exportURL)); // eslint-disable-line node/no-deprecated-api

    if (accessToken) {
      assert.equal(sender['_username'], 'auth');
      assert.equal(sender['_password'], accessToken);
    }

    const process = exporter['_process'];
    assert.equal(process.serviceName, serviceName);
  }

  beforeEach(() => {
    addSpanProcessorMock.reset();
  });

  it('setups tracing with defaults', () => {
    startTracing();
    assertTracingPipeline(
      'http://localhost:9080/v1/trace',
      'unnamed-node-service'
    );
  });

  it('setups tracing with custom options', () => {
    const endpoint = 'https://custom-endpoint:1111/path';
    const serviceName = 'test-node-service';
    const accessToken = '1234';
    startTracing({ endpoint, serviceName, accessToken });
    assertTracingPipeline(endpoint, serviceName, accessToken);
  });

  it('setups tracing with custom options from env', () => {
    const url = 'https://url-from-env:3030/trace-path';
    const serviceName = 'env-service';
    const accessToken = 'zxcvb';

    process.env.SPLK_TRACE_EXPORTER_URL = '';
    process.env.SPLK_SERVICE_NAME = '';
    process.env.SPLK_ACCESS_TOKEN = '';
    const envExporterStub = sinon
      .stub(process.env, 'SPLK_TRACE_EXPORTER_URL')
      .value(url);
    const envServiceStub = sinon
      .stub(process.env, 'SPLK_SERVICE_NAME')
      .value(serviceName);
    const envAccessStub = sinon
      .stub(process.env, 'SPLK_ACCESS_TOKEN')
      .value(accessToken);

    startTracing();
    assertTracingPipeline(url, serviceName, accessToken);

    envExporterStub.restore();
    envServiceStub.restore();
    envAccessStub.restore();
  });
});
