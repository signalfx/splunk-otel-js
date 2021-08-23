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

import * as assert from 'assert';
import * as sinon from 'sinon';
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
  InMemorySpanExporter,
} from '@opentelemetry/tracing';
import { NodeTracerProvider } from '@opentelemetry/node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

import { startTracing, stopTracing } from '../../src/tracing';
import * as jaeger from '../../src/jaeger';
import * as utils from '../utils';

describe('tracing:jaeger-thrift-splunk', () => {
  let patchJaegerMock;
  let addSpanProcessorMock;

  before(() => {
    patchJaegerMock = sinon.stub(jaeger, '_patchJaeger');
    addSpanProcessorMock = sinon.stub(
      NodeTracerProvider.prototype,
      'addSpanProcessor'
    );
  });

  beforeEach(() => {
    utils.cleanEnvironment();
    process.env.OTEL_TRACES_EXPORTER = 'jaeger-thrift-splunk';
    patchJaegerMock.reset();
    addSpanProcessorMock.reset();
  });

  after(() => {
    patchJaegerMock.restore();
    addSpanProcessorMock.restore();
  });

  function assertTracingPipeline(
    exportURL: string,
    serviceName: string,
    accessToken?: string,
    maxAttrLength?: number,
    logsInjection: boolean
  ) {
    sinon.assert.calledOnce(addSpanProcessorMock);
    const processor = addSpanProcessorMock.getCall(0).args[0];

    assert(processor instanceof BatchSpanProcessor);
    const exporter = processor['_exporter'];
    assert(exporter instanceof JaegerExporter);

    const config = exporter['_localConfig'];
    assert.deepEqual(config['endpoint'], exportURL);

    if (accessToken) {
      assert.equal(config['username'], 'auth');
      assert.equal(config['password'], accessToken);
    }

    assert.equal(config['serviceName'], serviceName);

    assert.equal(maxAttrLength, patchJaegerMock.getCall(0).args[0]);
  }

  it('setups tracing with defaults', () => {
    startTracing();
    assertTracingPipeline(
      'http://localhost:9080/v1/trace',
      'unnamed-node-service',
      '',
      1200,
      false
    );
    stopTracing();
  });

  it('setups tracing with custom options', () => {
    const endpoint = 'https://custom-endpoint:1111/path';
    const serviceName = 'test-node-service';
    const accessToken = '1234';
    const maxAttrLength = 50;
    const logInjectionEnabled = true;
    startTracing({
      endpoint,
      serviceName,
      accessToken,
      maxAttrLength,
      logInjectionEnabled,
    });
    assertTracingPipeline(
      endpoint,
      serviceName,
      accessToken,
      maxAttrLength,
      logInjectionEnabled
    );
    stopTracing();
  });

  it('setups tracing with custom options from env', () => {
    const url = 'https://url-from-env:3030/trace-path';
    const serviceName = 'env-service';
    const accessToken = 'zxcvb';
    const maxAttrLength = 101;
    const logInjectionEnabled = true;

    process.env.OTEL_EXPORTER_JAEGER_ENDPOINT = url;
    process.env.OTEL_SERVICE_NAME = serviceName;
    process.env.SPLUNK_ACCESS_TOKEN = accessToken;
    process.env.SPLUNK_MAX_ATTR_LENGTH = maxAttrLength.toString();
    process.env.SPLUNK_LOGS_INJECTION = logInjectionEnabled.toString();

    startTracing();
    assertTracingPipeline(
      url,
      serviceName,
      accessToken,
      maxAttrLength,
      logInjectionEnabled
    );
    stopTracing();
  });
});
