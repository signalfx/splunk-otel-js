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
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { InstrumentationBase } from '@opentelemetry/instrumentation';
import {
  emptyResource,
  Resource,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import {
  ATTR_CONTAINER_ID,
  ATTR_HOST_ARCH,
  ATTR_HOST_NAME,
  ATTR_OS_TYPE,
  ATTR_OS_VERSION,
  ATTR_PROCESS_EXECUTABLE_NAME,
  ATTR_PROCESS_PID,
  ATTR_PROCESS_RUNTIME_NAME,
  ATTR_PROCESS_RUNTIME_VERSION,
  ATTR_SERVICE_NAME,
} from '@opentelemetry/semantic-conventions/incubating';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  SpanExporter,
  InMemorySpanExporter,
  AlwaysOffSampler,
} from '@opentelemetry/sdk-trace-base';

import { strict as assert } from 'assert';
import { afterEach, beforeEach, describe, it, mock } from 'node:test';
import * as os from 'os';
import * as instrumentations from '../src/instrumentations';
import type { TracingOptions } from '../src/tracing';
import {
  _setDefaultOptions,
  defaultPropagatorFactory,
  defaultSpanProcessorFactory,
} from '../src/tracing/options';
import * as utils from './utils';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { SplunkBatchSpanProcessor } from '../src/tracing/SplunkBatchSpanProcessor';
import { NextJsSpanProcessor } from '../src/tracing/NextJsSpanProcessor';

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

describe('options', () => {
  let logger;

  beforeEach(utils.cleanEnvironment);

  beforeEach(() => {
    logger = {
      warn: mock.fn(),
    };
    api.diag.setLogger(logger, api.DiagLogLevel.ALL);
    // Setting logger logs stuff. Cleaning that up.
    logger.warn.mock.resetCalls();
  });

  afterEach(() => {
    api.diag.disable();
  });

  describe('defaults', () => {
    let instrMock;
    beforeEach(() => {
      // Mock the default `getInstrumentations` in case some instrumentations (e.g. http) are part of dev dependencies.
      instrMock = mock.method(
        instrumentations,
        'getInstrumentations',
        () => []
      );
    });

    afterEach(() => {
      instrMock.mock.restore();
    });

    it('has expected defaults', () => {
      const options = _setDefaultOptions();

      const resAttrs =
        options.tracerConfig.resource?.attributes || emptyResource();

      assertVersion(resAttrs['telemetry.distro.version']);

      assert.strictEqual(resAttrs['telemetry.distro.name'], 'splunk-nodejs');

      const expectedAttributes = new Set([
        ATTR_HOST_ARCH,
        ATTR_HOST_NAME,
        ATTR_OS_TYPE,
        ATTR_OS_VERSION,
        ATTR_PROCESS_EXECUTABLE_NAME,
        ATTR_PROCESS_PID,
        ATTR_PROCESS_RUNTIME_NAME,
        ATTR_PROCESS_RUNTIME_VERSION,
        'telemetry.distro.version',
        'telemetry.distro.name',
      ]);

      expectedAttributes.forEach((processAttribute) => {
        assert(resAttrs[processAttribute], `${processAttribute} missing`);
      });

      assert.deepStrictEqual(resAttrs[ATTR_SERVICE_NAME], '@splunk/otel');

      // Container ID is checked in a different test,
      // this avoids collisions with stubbing fs methods.
      delete resAttrs[ATTR_CONTAINER_ID];

      // resource attributes for process, host and os are different at each run, iterate through them, make sure they exist and then delete
      Object.keys(resAttrs)
        .filter((attribute) => {
          return expectedAttributes.has(attribute);
        })
        .forEach((processAttribute) => {
          delete options.tracerConfig.resource?.attributes[processAttribute];
        });

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
    });

    it('reads the container when setting default options', async () => {
      mock.method(os, 'platform', () => 'linux');

      mock.method(containerDetector, 'detect', () => {
        return {
          attributes: {
            [ATTR_CONTAINER_ID]:
              '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcde',
          },
        };
      });

      const options = _setDefaultOptions();
      const resource = options.tracerConfig.resource || emptyResource();
      await resource.waitForAsyncAttributes?.();
      assertContainerId(resource.attributes[ATTR_CONTAINER_ID]);
    });
  });

  it('accepts and applies configuration', () => {
    const testInstrumentation = new TestInstrumentation('inst', '1.0', {});
    const idGenerator = new TestIdGenerator();

    const resourceFactory = (resource: Resource) => {
      return resource;
    };

    const options = _setDefaultOptions({
      realm: 'rlm',
      endpoint: 'custom-endpoint',
      serviceName: 'custom-service-name',
      accessToken: 'custom-access-token',
      instrumentations: [testInstrumentation],
      tracerConfig: {
        resource: resourceFromAttributes({ attr1: 'value1' }),
        sampler: new AlwaysOffSampler(),
        idGenerator: idGenerator,
      },
      resourceFactory,
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
      enableTraceContextPropagation: false,
      instrumentations: [testInstrumentation],
      tracerConfig: {
        resource: resourceFromAttributes({ attr1: 'value1' }),
        sampler: new AlwaysOffSampler(),
        idGenerator: idGenerator,
        generalLimits: {
          attributeCountLimit: 128,
          attributeValueLengthLimit: 12000,
        },
        spanLimits: {
          attributeCountLimit: 128,
          attributeValueLengthLimit: 12000,
          attributePerEventCountLimit: 128,
          attributePerLinkCountLimit: 128,
          eventCountLimit: 128,
          linkCountLimit: 1000,
        },
      },
      spanExporterFactory: testSpanExporterFactory,
      spanProcessorFactory: testSpanProcessorFactory,
      propagatorFactory: testPropagatorFactory,
    });

    assert(logger.warn.mock.calls.length === 0);
  });

  it('is possible to provide additional resource attributes', () => {
    const options = _setDefaultOptions({
      resourceFactory: (resource) => {
        return resource.merge(
          resourceFromAttributes({ 'splunk.distro.version': 'v9001', abc: 42 })
        );
      },
    });

    assert.strictEqual(
      options.tracerConfig.resource?.attributes['splunk.distro.version'],
      'v9001'
    );
    assert.strictEqual(options.tracerConfig.resource?.attributes['abc'], 42);
  });

  describe('OTEL_TRACES_EXPORTER', () => {
    beforeEach(utils.cleanEnvironment);

    it('accepts a single key', () => {
      process.env.OTEL_TRACES_EXPORTER = 'console';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);

      assert(Array.isArray(exporters));
      assert.deepStrictEqual(exporters.length, 1);
      assert(exporters[0] instanceof ConsoleSpanExporter);
    });

    it('can be set to none', () => {
      process.env.OTEL_TRACES_EXPORTER = 'none';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);

      assert(Array.isArray(exporters));
      assert.deepStrictEqual(exporters.length, 0);
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

  describe('SPLUNK_NEXTJS_FIX_ENABLED', () => {
    beforeEach(utils.cleanEnvironment);

    it('does not add a nextjs span processor by default', () => {
      const options = _setDefaultOptions();
      const processors = options.spanProcessorFactory(options);
      assert(Array.isArray(processors));

      assert.deepStrictEqual(processors.length, 1);
      assert(processors[0] instanceof SplunkBatchSpanProcessor);
    });

    it('enables nextjs span processor', () => {
      process.env.SPLUNK_NEXTJS_FIX_ENABLED = 'true';

      const options = _setDefaultOptions();
      const processors = options.spanProcessorFactory(options);
      assert(Array.isArray(processors));

      assert.deepStrictEqual(processors.length, 2);
      assert(processors[0] instanceof NextJsSpanProcessor);
      assert(processors[1] instanceof SplunkBatchSpanProcessor);
    });
  });

  it('prefers service name from env resource info over the default service name', () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'service.name=foobar';
    const options = _setDefaultOptions();
    delete process.env.OTEL_RESOURCE_ATTRIBUTES;

    assert.deepStrictEqual(
      options.tracerConfig.resource?.attributes[ATTR_SERVICE_NAME],
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
      assert(exporter instanceof OTLPTraceExporter);
      assert.deepStrictEqual(
        utils.exporterUrl(exporter),
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
      assert(exporter instanceof OTLPTraceExporter);
      assert.deepStrictEqual(
        utils.exporterUrl(exporter),
        'https://ingest.us0.signalfx.com/v2/trace/otlp'
      );
      const oneLogMatches = logger.warn.mock.calls.some((call) =>
        call.arguments[0].includes(
          `OTLP span exporter factory: defaulting protocol to 'http/protobuf' instead of grpc due to realm being defined.`
        )
      );
      assert(oneLogMatches);
    });

    it('warns when realm and endpoint are both set', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
        'http://myendpoint:4333/v1/my-traces';

      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;

      const oneLogMatches = logger.warn.mock.calls.some((call) =>
        call.arguments[0].includes(
          `OTLP span exporter factory: Realm value ignored (full endpoint URL has been specified).`
        )
      );
      assert(oneLogMatches);

      assert(
        exporter instanceof OTLPTraceExporter,
        'Expected exporter to be instance of OTLPTraceExporter'
      );
      assert.deepStrictEqual(
        utils.exporterUrl(exporter),
        'http://myendpoint:4333/v1/my-traces'
      );
    });
  });

  describe('OTLP span exporter factory', () => {
    beforeEach(utils.cleanEnvironment);

    it('throws when called with an unsupported OTLP protocol', () => {
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'http/json';
      const options = _setDefaultOptions();
      assert.throws(() => {
        options.spanExporterFactory(options);
      }, 'OTLP span exporter factory: expected OTLP protocol to be either grpc or http/protobuf, got http/json.');
    });

    it('is possible to use OTEL_EXPORTER_OTLP_PROTOCOL', () => {
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'grpc';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPGrpcTraceExporter);
    });

    it('prefers OTEL_EXPORTER_OTLP_TRACES_PROTOCOL over OTEL_EXPORTER_OTLP_PROTOCOL', () => {
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPGrpcTraceExporter);
    });

    it('is possible to use OTEL_EXPORTER_OTLP_ENDPOINT', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'foobar:4200';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPTraceExporter);
      assert.deepStrictEqual(
        utils.exporterUrl(exporter),
        'foobar:4200/v1/traces'
      );
    });

    it('prefers OTEL_EXPORTER_OTLP_TRACES_ENDPOINT over OTEL_EXPORTER_OTLP_ENDPOINT', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'foobar:4200';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT = 'barfoo:2400';
      const options = _setDefaultOptions();
      const exporters = options.spanExporterFactory(options);
      assert(Array.isArray(exporters));
      const [exporter] = exporters;
      assert(exporter instanceof OTLPTraceExporter);
      assert.deepStrictEqual(utils.exporterUrl(exporter), 'barfoo:2400');
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

function testSpanProcessorFactory(options: TracingOptions) {
  const exporters = options.spanExporterFactory(options);

  if (Array.isArray(exporters)) {
    return exporters.map((e) => new SimpleSpanProcessor(e));
  }

  return new SimpleSpanProcessor(exporters);
}

function testPropagatorFactory(
  _options: TracingOptions
): api.TextMapPropagator {
  return new W3CBaggagePropagator();
}
