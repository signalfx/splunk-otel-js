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

import { describe, it } from 'node:test';
import { strict as assert } from 'assert';
import { parseOptionsAndConfigureInstrumentations } from '../src/instrumentations';
import { Resource } from '@opentelemetry/resources';
import { exporterUrl } from './utils';

describe('common options', () => {
  it('passes resource creation function to signals', () => {
    const opts = parseOptionsAndConfigureInstrumentations({
      resource: (envResource) => {
        return envResource.merge(
          new Resource({
            'test.attribute': 'foobar',
          })
        );
      },
    });

    assert.strictEqual(
      opts.tracingOptions.tracerConfig.resource?.attributes['test.attribute'],
      'foobar'
    );

    assert.strictEqual(
      opts.profilingOptions.resource.attributes['test.attribute'],
      'foobar'
    );

    assert.strictEqual(
      opts.profilingOptions.resource.attributes['test.attribute'],
      'foobar'
    );

    assert.strictEqual(
      opts.profilingOptions.resource.attributes['test.attribute'],
      'foobar'
    );
  });

  it('passes realm and accessToken to signals', () => {
    const opts = parseOptionsAndConfigureInstrumentations({
      realm: 'eu0',
      accessToken: '123',
    });

    assert.strictEqual(opts.tracingOptions.realm, 'eu0');
    assert.strictEqual(opts.tracingOptions.accessToken, '123');
    assert.strictEqual(opts.metricsOptions.realm, 'eu0');
    assert.strictEqual(opts.metricsOptions.accessToken, '123');
  });

  it('prefers signal specific options', () => {
    const opts = parseOptionsAndConfigureInstrumentations({
      realm: 'eu0',
      accessToken: 'abc',
      resource: () => new Resource({ test: 'common' }),
      tracing: {
        realm: 'us0',
        accessToken: 'a',
        resourceFactory: () => new Resource({ test: 'tracing' }),
      },
      metrics: {
        realm: 'us1',
        accessToken: 'b',
        resourceFactory: () => new Resource({ test: 'metrics' }),
      },
      logging: {
        resourceFactory: () => new Resource({ test: 'logging' }),
      },
      profiling: {
        resourceFactory: () => new Resource({ test: 'profiling' }),
      },
    });

    assert.strictEqual(opts.tracingOptions.realm, 'us0');
    assert.strictEqual(opts.tracingOptions.accessToken, 'a');
    assert.strictEqual(
      opts.tracingOptions.tracerConfig.resource?.attributes['test'],
      'tracing'
    );

    assert.strictEqual(opts.metricsOptions.realm, 'us1');
    assert.strictEqual(opts.metricsOptions.accessToken, 'b');
    assert.strictEqual(
      opts.metricsOptions.resource.attributes['test'],
      'metrics'
    );

    assert.strictEqual(
      opts.loggingOptions.resource.attributes['test'],
      'logging'
    );

    assert.strictEqual(
      opts.profilingOptions.resource.attributes['test'],
      'profiling'
    );
  });

  it('sets the exporter endpoint resource paths automatically', () => {
    const { tracingOptions, metricsOptions, loggingOptions, profilingOptions } =
      parseOptionsAndConfigureInstrumentations({
        endpoint: 'http://localhost:4318',
      });

    const spanExporter = tracingOptions.spanExporterFactory(tracingOptions)[0];
    assert.strictEqual(
      exporterUrl(spanExporter),
      'http://localhost:4318/v1/traces'
    );

    const metricsExporter =
      metricsOptions.metricReaderFactory(metricsOptions)[0]['_exporter'];
    assert.strictEqual(
      exporterUrl(metricsExporter),
      'http://localhost:4318/v1/metrics'
    );

    const logsExporter =
      loggingOptions.logRecordProcessorFactory(loggingOptions)[0]['_exporter'];
    assert.strictEqual(
      exporterUrl(logsExporter),
      'http://localhost:4318/v1/logs'
    );

    const profilingUrl =
      profilingOptions.exporterFactory(profilingOptions)[0]['_endpoint'];
    assert.strictEqual(profilingUrl, 'http://localhost:4318/v1/logs');
  });
});
