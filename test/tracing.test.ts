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
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

import { startTracing } from '../src/tracing';
import * as jaeger from '../src/jaeger';

describe('tracing', () => {
  const addSpanProcessorMock = sinon.stub(
    NodeTracerProvider.prototype,
    'addSpanProcessor'
  );

  const patchJaegerMock = sinon.stub(jaeger, '_patchJaeger');

  beforeEach(() => {
    addSpanProcessorMock.reset();
    patchJaegerMock.reset();
  });

  function assertTracingPipeline(
    exportURL: string,
    serviceName: string,
    accessToken?: string,
    maxAttrLength?: number
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

    assert.equal(maxAttrLength, patchJaegerMock.getCall(0).args[0]);
  }

  it('does not setup tracing OTEL_TRACE_ENABLED=false', () => {
    process.env.OTEL_TRACE_ENABLED = 'false';
    startTracing();
    sinon.assert.notCalled(addSpanProcessorMock);
    delete process.env.OTEL_TRACE_ENABLED;
  });

  it('setups tracing with defaults', () => {
    startTracing();
    assertTracingPipeline(
      'http://localhost:9080/v1/trace',
      'unnamed-node-service',
      '',
      1200
    );
  });

  it('setups tracing with custom options', () => {
    const endpoint = 'https://custom-endpoint:1111/path';
    const serviceName = 'test-node-service';
    const accessToken = '1234';
    const maxAttrLength = 50;
    startTracing({ endpoint, serviceName, accessToken, maxAttrLength });
    assertTracingPipeline(endpoint, serviceName, accessToken, maxAttrLength);
  });

  it('setups tracing with custom options from env', () => {
    const url = 'https://url-from-env:3030/trace-path';
    const serviceName = 'env-service';
    const accessToken = 'zxcvb';
    const maxAttrLength = 101;

    process.env.SPLK_TRACE_EXPORTER_URL = '';
    process.env.SPLK_SERVICE_NAME = '';
    process.env.SPLK_ACCESS_TOKEN = '';
    process.env.SPLK_MAX_ATTR_LENGTH = '42';
    const envExporterStub = sinon
      .stub(process.env, 'SPLK_TRACE_EXPORTER_URL')
      .value(url);
    const envServiceStub = sinon
      .stub(process.env, 'SPLK_SERVICE_NAME')
      .value(serviceName);
    const envAccessStub = sinon
      .stub(process.env, 'SPLK_ACCESS_TOKEN')
      .value(accessToken);
    const envMaxAttrLength = sinon
      .stub(process.env, 'SPLK_MAX_ATTR_LENGTH')
      .value(maxAttrLength);

    startTracing();
    assertTracingPipeline(url, serviceName, accessToken, maxAttrLength);
    envExporterStub.restore();
    envServiceStub.restore();
    envAccessStub.restore();
    envMaxAttrLength.restore();
  });
});
