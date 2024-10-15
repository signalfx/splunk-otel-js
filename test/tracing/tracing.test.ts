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
import { before, beforeEach, describe, it, mock } from 'node:test';

import { trace } from '@opentelemetry/api';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';
import * as utils from '../utils';

describe('tracing:otlp', () => {
  let addSpanProcessorMock;

  before(() => {
    addSpanProcessorMock = mock.method(
      NodeTracerProvider.prototype,
      'addSpanProcessor'
    );
  });

  beforeEach(() => {
    utils.cleanEnvironment();
    addSpanProcessorMock.mock.resetCalls();
  });

  function assertTracingPipeline(
    exportURL: string,
    serviceName: string,
    accessToken?: string
  ) {
    assert.equal(addSpanProcessorMock.mock.callCount(), 1);
    const processor = addSpanProcessorMock.mock.calls[0].arguments[0];
    assert(processor instanceof BatchSpanProcessor);
    const exporter = processor['_exporter'];
    assert(exporter instanceof OTLPTraceExporter);

    assert.deepEqual(exporter.url, exportURL);

    if (accessToken) {
      assert.equal(
        exporter['_transport']['_parameters']
          ['metadata']()
          .get('x-sf-token')[0],
        accessToken
      );
    }
  }

  it('setups tracing with defaults', () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
    startTracing(tracingOptions);
    assertTracingPipeline('localhost:4317', 'unnamed-node-service', '');
    stopTracing();
  });

  it('setups tracing with custom options', () => {
    const endpoint = 'custom-endpoint:1111';
    const serviceName = 'test-node-service';
    const accessToken = '1234';
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
      tracing: {
        endpoint,
        serviceName,
        accessToken,
      },
    });

    startTracing(tracingOptions);
    assertTracingPipeline(endpoint, serviceName, accessToken);
    stopTracing();
  });

  it('setups tracing with custom options from env', () => {
    const url = 'url-from-env:3030';
    const serviceName = 'env-service';
    const accessToken = 'zxcvb';

    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = url;
    process.env.OTEL_SERVICE_NAME = serviceName;
    process.env.SPLUNK_ACCESS_TOKEN = accessToken;

    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
    startTracing(tracingOptions);
    assertTracingPipeline(url, serviceName, accessToken);
    stopTracing();
  });

  it('sets up tracing with a single processor', () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
      tracing: {
        spanProcessorFactory: () => {
          return new SimpleSpanProcessor(new ConsoleSpanExporter());
        },
      },
    });

    startTracing(tracingOptions);

    assert.equal(addSpanProcessorMock.mock.callCount(), 1);
    const p1 = addSpanProcessorMock.mock.calls[0].arguments[0];

    assert(p1 instanceof SimpleSpanProcessor);
    const exp1 = p1['_exporter'];
    assert(exp1 instanceof ConsoleSpanExporter);
    stopTracing();
  });

  it('sets up tracing with multiple processors', () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
      tracing: {
        spanProcessorFactory: function (options) {
          return [
            new SimpleSpanProcessor(new ConsoleSpanExporter()),
            new BatchSpanProcessor(new InMemorySpanExporter()),
          ];
        },
      },
    });

    startTracing(tracingOptions);

    assert.equal(addSpanProcessorMock.mock.callCount(), 2);
    const p1 = addSpanProcessorMock.mock.calls[0].arguments[0];

    assert(p1 instanceof SimpleSpanProcessor);
    const exp1 = p1['_exporter'];
    assert(exp1 instanceof ConsoleSpanExporter);

    const p2 = addSpanProcessorMock.mock.calls[1].arguments[0];
    assert(p2 instanceof BatchSpanProcessor);
    const exp2 = p2['_exporter'];
    assert(exp2 instanceof InMemorySpanExporter);

    stopTracing();
  });

  it('flushes when stopped', async () => {
    const createSpan = (
      expectRecording = true,
      tracer = trace.getTracer('test-tracer')
    ) => {
      const span = tracer.startSpan('test-span');
      assert.equal(span.isRecording(), expectRecording);
      span.end();
    };
    const exporter = new InMemorySpanExporter();
    const exportFn = mock.method(exporter, 'export');
    const shutdownFn = mock.method(exporter, 'shutdown');

    const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
      tracing: {
        spanExporterFactory: () => exporter,
      },
    });

    startTracing(tracingOptions);

    const storedTracer = trace.getTracer('test-tracer');
    createSpan();

    assert.equal(exportFn.mock.callCount(), 0);
    assert.equal(shutdownFn.mock.callCount(), 0);
    await stopTracing();

    createSpan(false);
    // note that if the tracer is created and stored before stopping tracing, the spans
    // are "recorded", but the SpanProcessor which is now shut down will just dump them.
    createSpan(true, storedTracer);

    assert.equal(exportFn.mock.callCount(), 1);
    assert.equal(shutdownFn.mock.callCount(), 1);

    exportFn.mock.restore();
    shutdownFn.mock.restore();
  });
});
