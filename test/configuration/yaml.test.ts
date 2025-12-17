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
import { describe, test } from 'node:test';
import { strict as assert } from 'assert';

import { loadConfiguration } from '../../src/configuration';
import { join } from 'path';

describe('YAML config file', () => {
  test('missing file', () => {
    try {
      const _res = loadConfiguration(join(__dirname, 'missing-no.yml'));
      assert(false, "loadFile didn't throw an error");
    } catch (e) {
      assert(e.message.includes('does not exist'));
    }
  });

  test('config types match the yaml  structure', () => {
    const config = loadConfiguration(join(__dirname, 'example-config.yaml'));
    assert.ok(config);

    assert.deepStrictEqual(config.log_level, 'warn');
    assert.deepStrictEqual(config.attribute_limits, {
      attribute_value_length_limit: 4096,
      attribute_count_limit: 128,
    });
    assert.deepStrictEqual(config.propagator, {
      composite: [
        { tracecontext: null },
        { baggage: null },
        { b3: null },
        { b3multi: null },
      ],
      composite_list: 'tracecontext,baggage,b3,b3multi,xray',
    });
    assert.deepStrictEqual(config.distribution?.splunk, {
      use_bundled_instrumentations: true,
      package_name_filter: ['MyApiGw'],
      runtime_metrics: {
        collection_interval: 30000,
      },
      instrumentations: {
        http: {
          response_header_enabled: true,
          capture_uri_parameters: ['userId'],
        },
        redis: {
          include_command_args: true,
        },
      },
      profiling: {
        exporter: {
          otlp_http: {
            endpoint: 'collector:4318/v1/logs',
          },
        },
        always_on: {
          cpu_profiler: {
            sampling_interval: 10,
          },
          memory_profiler: null,
        },
        callgraphs: {
          sampling_interval: 10,
          selection_probability: 0.01,
        },
      },
    });
  });
});
