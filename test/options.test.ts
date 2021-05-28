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

import { TextMapGetter, TextMapPropagator } from '@opentelemetry/api';
import { HttpBaggage } from '@opentelemetry/core';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import {
  SimpleSpanProcessor,
  SpanExporter,
  SpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/tracing';

import * as assert from 'assert';
import * as sinon from 'sinon';

import * as instrumentations from '../src/instrumentations';
import {
  _setDefaultOptions,
  defaultSpanProcessorFactory,
  defaultSpanExporterFactory,
  Options,
  defaultPropagatorFactory,
} from '../src/options';

describe('options', () => {
  it('verify default options', () => {
    // Mock the default `getInstrumentations` in case some instrumentations (e.g. http) are part of dev dependencies.
    const getInstrumentationsStub = sinon
      .stub(instrumentations, 'getInstrumentations')
      .returns([]);
    const options = _setDefaultOptions();
    assert.deepStrictEqual(options, {
      endpoint: 'http://localhost:9080/v1/trace',
      serviceName: 'unnamed-node-service',
      accessToken: '',
      serverTimingEnabled: true,
      logInjectionEnabled: false,
      maxAttrLength: 1200,
      instrumentations: [],
      tracerConfig: {
        resource: new Resource({}),
      },
      spanExporterFactory: defaultSpanExporterFactory,
      spanProcessorFactory: defaultSpanProcessorFactory,
      propagatorFactory: defaultPropagatorFactory,
    });
    getInstrumentationsStub.restore();
  });

  it('verify custom options', () => {
    const testInstrumentation = new TestInstrumentation('inst', '1.0');
    const idGenerator = new TestIdGenerator();

    const options = _setDefaultOptions({
      endpoint: 'custom-endpoint',
      serviceName: 'custom-service-name',
      accessToken: 'custom-access-token',
      maxAttrLength: 4000,
      logInjectionEnabled: true,
      instrumentations: [testInstrumentation],
      tracerConfig: {
        resource: new Resource({
          attr1: 'value',
        }),
        idGenerator: idGenerator,
      },
      spanExporterFactory: testSpanExporterFactory,
      spanProcessorFactory: testSpanProcessorFactory,
      propagatorFactory: testPropagatorFactory,
    });

    assert.deepStrictEqual(options, {
      endpoint: 'custom-endpoint',
      serviceName: 'custom-service-name',
      accessToken: 'custom-access-token',
      maxAttrLength: 4000,
      serverTimingEnabled: true,
      logInjectionEnabled: true,
      instrumentations: [testInstrumentation],
      tracerConfig: {
        resource: new Resource({ attr1: 'value' }),
        idGenerator: idGenerator,
      },
      spanExporterFactory: testSpanExporterFactory,
      spanProcessorFactory: testSpanProcessorFactory,
      propagatorFactory: testPropagatorFactory,
    });
  });
});

class TestInstrumentation extends InstrumentationBase {
  init() {}
}

class TestIdGenerator {
  generateTraceId(): string {
    return '';
  }

  generateSpanId(): string {
    return '';
  }
}

function testSpanExporterFactory(): SpanExporter {
  return new InMemorySpanExporter();
}

function testSpanProcessorFactory(options: Options): SpanProcessor {
  return new SimpleSpanProcessor(options.spanExporterFactory(options));
}

function testPropagatorFactory(options: Options): TextMapPropagator {
  return new HttpBaggage();
}
