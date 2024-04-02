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
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  SpanExporter,
  SpanProcessor,
  InMemorySpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

import { strict as assert } from 'assert';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as os from 'os';

import * as instrumentations from '../src/instrumentations';
import {
  _setDefaultOptions,
  allowedTracingOptions,
  defaultPropagatorFactory,
  otlpSpanExporterFactory,
  defaultSpanProcessorFactory,
  Options,
} from '../src/tracing/options';
import * as utils from './utils';

const assertVersion = (versionAttr) => {
  assert.equal(typeof versionAttr, 'string');
  assert(
    /[0-9]+\.[0-9]+\.[0-9]+/.test(versionAttr),
    `${versionAttr} is not a valid version`
  );
};
const assertContainerId = (containerIdAttr) => {
  assert.equal(typeof containerIdAttr, 'string');
  assert(
    /^[abcdef0-9]+$/i.test(containerIdAttr),
    `${containerIdAttr} is not an hex string`
  );
};
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
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
      // Mock the default `getInstrumentations` in case some instrumentations (e.g. http) are part of dev dependencies.
      sandbox.stub(instrumentations, 'getInstrumentations').returns([]);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('has expected defaults', () => {
      const options = _setDefaultOptions();

      assertVersion(
        options.tracerConfig.resource.attributes['splunk.distro.version']
      );

      const expectedAttributes = new Set([
        SemanticResourceAttributes.HOST_ARCH,
        SemanticResourceAttributes.HOST_NAME,
        SemanticResourceAttributes.OS_TYPE,
        SemanticResourceAttributes.OS_VERSION,
        SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME,
        SemanticResourceAttributes.PROCESS_PID,
        SemanticResourceAttributes.PROCESS_RUNTIME_NAME,
        SemanticResourceAttributes.PROCESS_RUNTIME_VERSION,
        'splunk.distro.version',
      ]);

      expectedAttributes.forEach((processAttribute) => {
        assert(
          options.tracerConfig.resource.attributes[processAttribute],
          `${processAttribute} missing`
        );
      });

      // Container ID is checked in a different test,
      // this avoids collisions with stubbing fs methods.
      delete options.tracerConfig.resource.attributes[
        SemanticResourceAttributes.CONTAINER_ID
      ];

      // resource attributes for process, host and os are different at each run, iterate through them, make sure they exist and then delete
      Object.keys(options.tracerConfig.resource.attributes)
        .filter((attribute) => {
          return expectedAttributes.has(attribute);
        })
        .forEach((processAttribute) => {
          delete options.tracerConfig.resource.attributes[processAttribute];
        });

      assert.deepStrictEqual(
        Object.keys(options).sort(),
        allowedTracingOptions.sort()
      );

      assert.deepStrictEqual(options.realm, undefined);

      /*
        let the OTel exporter package itself
        resolve the default for endpoint.
      */
      assert.deepStrictEqual(options.endpoint, undefined);
      // The service name is retrieved from package.json,
      // since tests run at the source directory, it is detected as such.
      assert.deepStrictEqual(options.serviceName, '@splunk/otel');
      assert.deepStrictEqual(options.accessToken, '');
      assert.deepStrictEqual(options.serverTimingEnabled, true);
      assert.deepStrictEqual(options.instrumentations, []);
      assert.deepStrictEqual(options.tracerConfig, {
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: '@splunk/otel',
        }),
      });

      assert.deepStrictEqual(
        options.spanProcessorFactory,
        defaultSpanProcessorFactory
      );
      assert.deepStrictEqual(
        options.propagatorFactory,
        defaultPropagatorFactory
      );
      assert.deepStrictEqual(options.captureHttpRequestUriParams, []);

      const exporters = options.spanExporterFactory(options);

      assert(Array.isArray(exporters));
      assert.deepStrictEqual(exporters.length, 1);

      const [exporter] = exporters;

      assert(exporter instanceof OTLPTraceExporter);

      sinon.assert.calledWithMatch(logger.warn, MATCH_SERVICE_NAME_WARNING);
    });

    it('reads the container when setting default options', () => {
      sandbox.stub(os, 'platform').returns('linux');
      sandbox
        .stub(fs, 'readFileSync')
        .withArgs('/proc/self/cgroup', 'utf8')
        .returns(
          '1:blkio:/docker/a4d00c9dd675d67f866c786181419e1b44832d4696780152e61afd44a3e02856\n'
        );
      const options = _setDefaultOptions();
      assertContainerId(
        options.tracerConfig.resource.attributes[
          SemanticResourceAttributes.CONTAINER_ID
        ]
      );
    });
  });

  it('accepts and applies configuration', () => {
    const testInstrumentation = new TestInstrumentation('inst', '1.0');
    const idGenerator = new TestIdGenerator();

    const options = _setDefaultOptions({
      realm: 'rlm',
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
    });

    assert.deepStrictEqual(options, {
      realm: 'rlm',
      endpoint: 'custom-endpoint',
      serviceName: 'custom-service-name',
      accessToken: 'custom-access-token',
      serverTimingEnabled: true,
      captureHttpRequestUriParams: [],
      instrumentations: [testInstrumentation],
      tracerConfig: {
        resource: new Resource({ attr1: 'value' }),
        idGenerator: idGenerator,
      },
      spanExporterFactory: testSpanExporterFactory,
      spanProcessorFactory: testSpanProcessorFactory,
      propagatorFactory: testPropagatorFactory,
    });

    sinon.assert.neverCalledWithMatch(logger.warn, MATCH_SERVICE_NAME_WARNING);
    sinon.assert.neverCalledWithMatch(
      logger.warn,
      MATCH_NO_INSTRUMENTATIONS_WARNING
    );
  });

  describe('OTEL_TRACES_EXPORTER', () => {
    it('accepts a single key', () => {
      process.env.OTEL_TRACES_EXPORTER = 'console';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);

      assert(Array.isArray(exporters));
      assert.deepStrictEqual(exporters.length, 1);
      assert(exporters[0] instanceof ConsoleSpanExporter);
    });

    it('accepts multiple keys', () => {
      process.env.OTEL_TRACES_EXPORTER = 'otlp,console';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);

      assert(Array.isArray(exporters));
      assert.deepStrictEqual(exporters.length, 2);

      assert(exporters[0] instanceof OTLPTraceExporter);
      assert(exporters[1] instanceof ConsoleSpanExporter);
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

  describe('Splunk Realm', () => {
    beforeEach(utils.cleanEnvironment);

    it('throws when setting SPLUNK_REALM without an access token', () => {
      process.env.SPLUNK_REALM = 'us0';
      assert.throws(
        _setDefaultOptions,
        /Splunk realm is set, but access token is unset/
      );
    });

    it('will use OTLP over HTTP by default when realm and access token are set', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';

      const options = _setDefaultOptions();
      // let's exporter factory set the endpoint
      assert.deepStrictEqual(options.endpoint, undefined);

      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      assert.deepStrictEqual(exporters.length, 1);

      const [exporter] = exporters;
      assert(exporter instanceof OTLPHttpTraceExporter);
      assert.deepStrictEqual(
        exporter.url,
        `https://ingest.us0.signalfx.com/v2/trace/otlp`
      );
    });

    it('throws when setting the realm with an incompatible OTEL_TRACES_EXPORTER', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';
      process.env.OTEL_TRACES_EXPORTER = 'otlp-grpc';

      assert.throws(
        _setDefaultOptions,
        /requires OTEL_TRACES_EXPORTER to be either otlp or be left undefined/
      );
    });

    it('warns when specifying an invalid protocol for realm transport and defaults to HTTP', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';

      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);

      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPHttpTraceExporter);
      assert.deepStrictEqual(
        exporter.url,
        'https://ingest.us0.signalfx.com/v2/trace/otlp'
      );
      sinon.assert.calledWith(
        logger.warn,
        `OTLP span exporter factory: defaulting protocol to 'http/protobuf' instead of grpc due to realm being defined.`
      );
    });

    it('warns when realm and endpoint are both set', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'http://localhost:4317';

      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      sinon.assert.calledWith(
        logger.warn,
        'OTLP span exporter factory: Realm value ignored (full endpoint URL has been specified).'
      );
      assert(
        exporter instanceof OTLPTraceExporter,
        'Expected exporter to be instance of OTLPTraceExporter'
      );
      assert.deepStrictEqual(exporter.url, 'localhost:4317');
    });
  });

  describe('OTLP span exporter factory', () => {
    beforeEach(() => {
      beforeEach(utils.cleanEnvironment);
    });

    it('throws when called with an unsupported OTLP protocol', () => {
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/json';
      const options = _setDefaultOptions();
      assert.throws(() => {
        options.spanExporterFactory(options);
      }, 'OTLP span exporter factory: expected OTLP protocol to be either grpc or http/protobuf, got http/json.');
    });

    it('is possible to use OTEL_EXPORTER_OTLP_PROTOCOL', () => {
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPHttpTraceExporter);
    });

    it('prefers OTEL_EXPORTER_OTLP_TRACES_PROTOCOL over OTEL_EXPORTER_OTLP_PROTOCOL', () => {
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/protobuf';
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'grpc';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPHttpTraceExporter);
    });

    it('is possible to use OTEL_EXPORTER_OTLP_ENDPOINT', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'foobar:4200';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPTraceExporter);
      assert.deepStrictEqual(exporter.url, 'foobar:4200');
    });

    it('prefers OTEL_EXPORTER_OTLP_TRACES_ENDPOINT over OTEL_EXPORTER_OTLP_ENDPOINT', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'foobar:4200';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'barfoo:2400';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPTraceExporter);
      assert.deepStrictEqual(exporter.url, 'barfoo:2400');
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

function testSpanProcessorFactory(options: Options) {
  const exporters = options.spanExporterFactory(options);

  if (Array.isArray(exporters)) {
    return exporters.map((e) => new SimpleSpanProcessor(e));
  }

  return new SimpleSpanProcessor(exporters);
}

function testPropagatorFactory(options: Options): api.TextMapPropagator {
  return new W3CBaggagePropagator();
}
