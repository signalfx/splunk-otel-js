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
import * as assert from 'assert';
import * as sinon from 'sinon';
import * as utils from './utils';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { OTLPMetricExporter as OTLPHttpProtoMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { _setDefaultOptions } from '../src/metrics';
import { ConsoleMetricExporter } from '../src/metrics/ConsoleMetricExporter';

describe('metrics options', () => {
  let logger;
  beforeEach(() => {
    logger = {
      warn: sinon.spy(),
    };
    api.diag.setLogger(logger, api.DiagLogLevel.ALL);
    // Setting logger logs stuff. Cleaning that up.
    logger.warn.resetHistory();
  });

  describe('OTEL_METRICS_EXPORTER', () => {
    it('accepts a single key', () => {
      process.env.OTEL_METRICS_EXPORTER = 'console';
      const options = _setDefaultOptions();
      const readers = options.metricReaderFactory(options);

      assert.deepStrictEqual(readers.length, 1);
      assert(readers[0] instanceof PeriodicExportingMetricReader);
      assert(readers[0]['_exporter'] instanceof ConsoleMetricExporter);
    });

    it('accepts multiple keys', () => {
      process.env.OTEL_METRICS_EXPORTER = 'otlp,console';
      const options = _setDefaultOptions();
      const readers = options.metricReaderFactory(options);

      assert.deepStrictEqual(readers.length, 2);

      assert(readers[0]['_exporter'] instanceof OTLPMetricExporter);
      assert(readers[1]['_exporter'] instanceof ConsoleMetricExporter);
    });

    it('throws on invalid key', () => {
      process.env.OTEL_METRICS_EXPORTER = 'invalid-key';

      const options = _setDefaultOptions();
      assert.throws(() => {
        options.metricReaderFactory(options);
      }, /OTEL_METRICS_EXPORTER/);
    });
  });

  describe('OTLP metric reader factory', () => {
    beforeEach(() => {
      beforeEach(utils.cleanEnvironment);
    });

    it('throws when called with an unsupported OTLP protocol', () => {
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/json';
      const options = _setDefaultOptions();
      assert.throws(() => {
        options.metricReaderFactory(options);
      }, 'Metrics: expected OTLP protocol to be either grpc or http/protobuf, got http/json.');
    });

    it('is possible to use OTEL_EXPORTER_OTLP_PROTOCOL', () => {
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'http/protobuf';
      const options = _setDefaultOptions();
      const [reader] = options.metricReaderFactory(options);
      assert(reader['_exporter'] instanceof OTLPHttpProtoMetricExporter);
    });

    it('prefers OTEL_EXPORTER_OTLP_METRICS_PROTOCOL over OTEL_EXPORTER_OTLP_PROTOCOL', () => {
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'http/protobuf';
      process.env.OTEL_EXPORTER_OTLP_PROTOCOL = 'grpc';
      const options = _setDefaultOptions();
      const [reader] = options.metricReaderFactory(options);
      assert(reader['_exporter'] instanceof OTLPHttpProtoMetricExporter);
    });

    it('is possible to use OTEL_EXPORTER_OTLP_ENDPOINT', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'foobar:4200';
      const options = _setDefaultOptions();
      const [reader] = options.metricReaderFactory(options);
      const exporter = reader['_exporter'];
      assert(exporter instanceof OTLPMetricExporter);
      assert.deepStrictEqual(exporter['_otlpExporter'].url, 'foobar:4200');
    });
  });

  describe('Splunk Realm', () => {
    beforeEach(utils.cleanEnvironment);

    it('warns when specifying an invalid protocol for realm transport and defaults to HTTP', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';
      process.env.OTEL_EXPORTER_OTLP_METRICS_PROTOCOL = 'grpc';

      const options = _setDefaultOptions();
      const [reader] = options.metricReaderFactory(options);
      const exporter = reader['_exporter'];

      assert(exporter instanceof OTLPHttpProtoMetricExporter);
      assert.deepStrictEqual(
        exporter['_otlpExporter'].url,
        'https://ingest.us0.signalfx.com/v2/datapoint/otlp'
      );
      sinon.assert.calledWith(
        logger.warn,
        `OTLP metric exporter: defaulting protocol to 'http/protobuf' instead of 'grpc' due to realm being defined.`
      );
    });

    it('throws when realm is set without an access token', () => {
      process.env.SPLUNK_REALM = 'eu0';
      assert.throws(
        _setDefaultOptions,
        /To send metrics to the Observability Cloud/
      );
    });

    it('chooses the correct endpoint when realm is set', () => {
      process.env.SPLUNK_REALM = 'eu0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';

      const options = _setDefaultOptions();
      const [reader] = options.metricReaderFactory(options);
      const exporter = reader['_exporter'];
      assert(exporter instanceof OTLPHttpProtoMetricExporter);

      assert.deepStrictEqual(
        exporter['_otlpExporter'].headers['X-SF-TOKEN'],
        'abc'
      );

      assert.deepStrictEqual(
        exporter['_otlpExporter'].url,
        'https://ingest.eu0.signalfx.com/v2/datapoint/otlp'
      );
    });

    it('warns when realm and endpoint are both set', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.SPLUNK_ACCESS_TOKEN = 'abc';
      process.env.SPLUNK_METRICS_ENDPOINT = 'http://localhost:4317';

      const options = _setDefaultOptions();
      const [reader] = options.metricReaderFactory(options);
      const exporter = reader['_exporter'];
      sinon.assert.calledWith(
        logger.warn,
        'OTLP metric exporter factory: realm ignored due to explicit endpoint being set.'
      );
      assert(exporter instanceof OTLPMetricExporter);
      assert.deepStrictEqual(exporter['_otlpExporter'].url, 'localhost:4317');
    });
  });
});
