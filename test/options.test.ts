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

import * as api from '@opentelemetry/api';
import { W3CBaggagePropagator } from '@opentelemetry/core';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  SimpleSpanProcessor,
  SpanExporter,
  SpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace-base';

import * as assert from 'assert';
import * as sinon from 'sinon';

import * as instrumentations from '../src/instrumentations';
import {
  _setDefaultOptions,
  defaultPropagatorFactory,
  otlpSpanExporterFactory,
  splunkSpanExporterFactory,
  defaultSpanProcessorFactory,
  Options,
} from '../src/tracing/options';
import * as utils from './utils';

/*
  service.name attribute is not set, your service is unnamed and will be difficult to identify.
  Set your service name using the OTEL_RESOURCE_ATTRIBUTES environment variable.
  E.g. OTEL_RESOURCE_ATTRIBUTES="service.name=<YOUR_SERVICE_NAME_HERE>"
*/
const MATCH_SERVICE_NAME_WARNING = sinon.match(/service\.name.*not.*set/i);
// No instrumentations set to be loaded. Install an instrumentation package to enable auto-instrumentation.
const MATCH_NO_INSTRUMENTATIONS_WARNING = sinon.match(
  /no.*instrumentation.*install.*package/i
);
// List of resource attributes we expect to see detected
const expectedAttributes = new Set([
  // SemanticResourceAttributes.CONTAINER_ID,
  SemanticResourceAttributes.HOST_ARCH,
  SemanticResourceAttributes.HOST_NAME,
  SemanticResourceAttributes.OS_TYPE,
  SemanticResourceAttributes.OS_VERSION,
  SemanticResourceAttributes.PROCESS_COMMAND,
  SemanticResourceAttributes.PROCESS_COMMAND_LINE,
  SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME,
  SemanticResourceAttributes.PROCESS_EXECUTABLE_PATH,
  SemanticResourceAttributes.PROCESS_PID,
  SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION,
  SemanticResourceAttributes.PROCESS_RUNTIME_NAME,
  SemanticResourceAttributes.PROCESS_RUNTIME_VERSION,
  'splunk.distro.version',
]);

describe('options', () => {
  let logger;

  beforeEach(utils.cleanEnvironment);

  beforeEach(() => {
    logger = {
      warn: sinon.spy(),
    };
    api.diag.setLogger(logger, api.DiagLogLevel.ALL);
    // Setting logger logs stuff. Cleaning that up.
    logger.warn.resetHistory();
  });

  afterEach(() => {
    api.diag.disable();
  });

  describe('defaults', () => {
    let getInstrumentationsStub;
    beforeEach(() => {
      // Mock the default `getInstrumentations` in case some instrumentations (e.g. http) are part of dev dependencies.
      getInstrumentationsStub = sinon
        .stub(instrumentations, 'getInstrumentations')
        .returns([]);
    });

    afterEach(() => {
      getInstrumentationsStub.restore();
    });

    it('has expected defaults', () => {
      const options = _setDefaultOptions();

      assert(
        /[0-9]+\.[0-9]+\.[0-9]+/.test(
          options.tracerConfig.resource.attributes['splunk.distro.version']
        )
      );

      // resource attributes for process, host and os are different at each run, iterate through them, make sure they exist and then delete
      Object.keys(options.tracerConfig.resource.attributes)
        .filter(attribute => {
          return expectedAttributes.has(attribute);
        })
        .forEach(processAttribute => {
          assert(options.tracerConfig.resource.attributes[processAttribute]);
          delete options.tracerConfig.resource.attributes[processAttribute];
        });

      assert.deepStrictEqual(options, {
        /*
          let the OTel exporter package itself
          resolve the default for endpoint.
        */
        endpoint: undefined,
        serviceName: 'unnamed-node-service',
        accessToken: '',
        serverTimingEnabled: true,
        instrumentations: [],
        tracerConfig: {
          resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: 'unnamed-node-service',
          }),
        },
        spanExporterFactory: otlpSpanExporterFactory,
        spanProcessorFactory: defaultSpanProcessorFactory,
        propagatorFactory: defaultPropagatorFactory,
        captureHttpRequestUriParams: [],
      });

      sinon.assert.calledWithMatch(logger.warn, MATCH_SERVICE_NAME_WARNING);
      sinon.assert.calledWithMatch(
        logger.warn,
        MATCH_NO_INSTRUMENTATIONS_WARNING
      );
    });
  });

  it('accepts and applies configuration', () => {
    const testInstrumentation = new TestInstrumentation('inst', '1.0');
    const idGenerator = new TestIdGenerator();

    const options = _setDefaultOptions({
      endpoint: 'custom-endpoint',
      serviceName: 'custom-service-name',
      accessToken: 'custom-access-token',
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
      captureHttpRequestUriParams: ['timestamp'],
    });

    assert.deepStrictEqual(options, {
      endpoint: 'custom-endpoint',
      serviceName: 'custom-service-name',
      accessToken: 'custom-access-token',
      serverTimingEnabled: true,
      instrumentations: [testInstrumentation],
      tracerConfig: {
        resource: new Resource({ attr1: 'value' }),
        idGenerator: idGenerator,
      },
      spanExporterFactory: testSpanExporterFactory,
      spanProcessorFactory: testSpanProcessorFactory,
      propagatorFactory: testPropagatorFactory,
      captureHttpRequestUriParams: ['timestamp'],
    });

    sinon.assert.neverCalledWithMatch(logger.warn, MATCH_SERVICE_NAME_WARNING);
    sinon.assert.neverCalledWithMatch(
      logger.warn,
      MATCH_NO_INSTRUMENTATIONS_WARNING
    );
  });

  describe('OTEL_TRACES_EXPORTER', () => {
    it('accepts a valid key', () => {
      process.env.OTEL_TRACES_EXPORTER = 'jaeger-thrift-splunk';
      const options = _setDefaultOptions();
      assert.strictEqual(
        options.spanExporterFactory,
        splunkSpanExporterFactory
      );
    });

    it('throws on invalid key', () => {
      process.env.OTEL_TRACES_EXPORTER = 'invalid-key';
      assert.throws(_setDefaultOptions, /OTEL_TRACES_EXPORTER/);
    });
  });

  it('prefers service name from env resource info over the default service name', () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.name=foobar';
    const options = _setDefaultOptions();
    delete process.env.OTEL_RESOURCE_ATTRIBUTES;

    assert.deepStrictEqual(
      options.tracerConfig.resource.attributes[
        SemanticResourceAttributes.SERVICE_NAME
      ],
      'foobar'
    );
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

function testPropagatorFactory(options: Options): api.TextMapPropagator {
  return new HttpBaggagePropagator();
}
