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
import { beforeEach, describe, test } from 'node:test';
import { strict as assert } from 'assert';

import { loadConfiguration } from '../../src/configuration';
import { join } from 'path';
import { cleanEnvironment } from '../utils';

describe('YAML environment variable substitution', () => {
  beforeEach(() => {
    cleanEnvironment();
  });

  test('config types match the yaml  structure', () => {
    process.env.SPLUNK_ACCESS_TOKEN = 'hehe123';
    process.env.SPLUNK_REALM = 'eu0';
    process.env.SPLUNK_TRACE_RESPONSE_HEADER_ENABLED = 'true';
    process.env.SPLUNK_SNAPSHOT_SAMPLING_INTERVAL = '15';
    process.env.SPLUNK_SNAPSHOT_SELECTION_PROBABILITY = '0.02';
    process.env.OTEL_SERVICE_NAME = 'foobar42';

    const config = loadConfiguration(
      join(__dirname, 'example-env-config.yaml')
    );
    assert.ok(config);

    assert.deepStrictEqual(
      config.tracer_provider?.processors[0].batch?.exporter.otlp_http?.endpoint,
      'https://ingest.eu0.signalfx.com/v2/trace/otlp'
    );
    assert.deepStrictEqual(
      config.tracer_provider?.processors[0].batch?.exporter.otlp_http?.headers,
      [{ name: 'X-SF-TOKEN', value: 'hehe123' }]
    );

    assert.deepStrictEqual(
      config.distribution?.splunk?.instrumentations?.['http']
        .trace_response_header_enabled,
      true
    );

    assert.deepStrictEqual(
      config.distribution?.splunk?.profiling?.callgraphs?.sampling_interval,
      15
    );

    assert.deepStrictEqual(
      config.distribution?.splunk?.profiling?.callgraphs?.selection_probability,
      0.02
    );

    assert.deepStrictEqual(
      config.distribution?.splunk?.use_bundled_instrumentations,
      false
    );

    assert.deepStrictEqual(config.resource?.attributes?.[0].value, 'foobar42');
  });
});
