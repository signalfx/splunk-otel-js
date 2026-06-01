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
import { describe, it, beforeEach } from 'node:test';
import {
  getLoadedConfigurationString,
  loadConfiguration,
} from '../../src/configuration';
import { cleanEnvironment } from '../utils';

// The exact set of keys mandated by the GDI specification's "Effective
// Environment Config" section. The reported body must contain these and only
// these, one occurrence each.
const REQUIRED_ENV_KEYS = [
  'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
  'OTEL_EXPORTER_OTLP_METRICS_ENDPOINT',
  'OTEL_EXPORTER_OTLP_LOGS_ENDPOINT',
  'SPLUNK_PROFILER_ENABLED',
  'SPLUNK_PROFILER_MEMORY_ENABLED',
  'SPLUNK_SNAPSHOT_PROFILER_ENABLED',
  'SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL',
  'SPLUNK_PROFILER_CALL_STACK_INTERVAL',
  'OTEL_CONFIG_FILE',
  'OTEL_EXPERIMENTAL_CONFIG_FILE',
];

function parseEnvBody(content: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of content.split('\n')) {
    const eq = line.indexOf('=');
    map.set(line.slice(0, eq), line.slice(eq + 1));
  }
  return map;
}

describe('EffectiveConfig', () => {
  describe('getLoadedConfigurationString', () => {
    beforeEach(() => {
      cleanEnvironment();
    });

    it('reports the environment format named "environment"', () => {
      const config = getLoadedConfigurationString();

      assert.strictEqual(config.type, 'env');
      assert.strictEqual(config.name, 'environment');
    });

    it('reports exactly the required keys with defaults when nothing is set', () => {
      const config = getLoadedConfigurationString();
      const map = parseEnvBody(config.content);

      assert.deepStrictEqual(
        [...map.keys()].sort(),
        [...REQUIRED_ENV_KEYS].sort(),
        'should report exactly the required keys, no extras'
      );

      // Defaults per spec / distro resolution.
      assert.strictEqual(map.get('SPLUNK_PROFILER_ENABLED'), 'false');
      assert.strictEqual(map.get('SPLUNK_PROFILER_MEMORY_ENABLED'), 'false');
      assert.strictEqual(map.get('SPLUNK_SNAPSHOT_PROFILER_ENABLED'), 'false');
      assert.strictEqual(
        map.get('SPLUNK_SNAPSHOT_PROFILER_SAMPLING_INTERVAL'),
        '1'
      );
      assert.strictEqual(
        map.get('SPLUNK_PROFILER_CALL_STACK_INTERVAL'),
        '1000'
      );
      // Unset string-valued keys report the literal `null`.
      assert.strictEqual(map.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'), 'null');
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT'),
        'null'
      );
      assert.strictEqual(map.get('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'), 'null');
      assert.strictEqual(map.get('OTEL_CONFIG_FILE'), 'null');
      assert.strictEqual(map.get('OTEL_EXPERIMENTAL_CONFIG_FILE'), 'null');
    });

    it('reflects resolved/effective values, not raw env passthrough', () => {
      process.env.SPLUNK_PROFILER_ENABLED = 'true';
      process.env.SPLUNK_PROFILER_CALL_STACK_INTERVAL = '1001';
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
        'http://localhost:4318/v1/traces';
      // Not in the required set — must be dropped.
      process.env.OTEL_SERVICE_NAME = 'my-service';

      const config = getLoadedConfigurationString();
      const map = parseEnvBody(config.content);

      assert.strictEqual(map.get('SPLUNK_PROFILER_ENABLED'), 'true');
      assert.strictEqual(
        map.get('SPLUNK_PROFILER_CALL_STACK_INTERVAL'),
        '1001'
      );
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'),
        'http://localhost:4318/v1/traces'
      );
      assert(!map.has('OTEL_SERVICE_NAME'), 'extra keys must not be reported');
    });

    it('resolves endpoints from the shared OTLP endpoint and realm', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4318';
      let config = getLoadedConfigurationString();
      let map = parseEnvBody(config.content);
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'),
        'http://collector:4318'
      );
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT'),
        'http://collector:4318'
      );

      cleanEnvironment();
      process.env.SPLUNK_REALM = 'us0';
      config = getLoadedConfigurationString();
      map = parseEnvBody(config.content);
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'),
        'https://ingest.us0.observability.splunkcloud.com/v2/trace/otlp'
      );
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT'),
        'https://ingest.us0.observability.splunkcloud.com/v2/datapoint/otlp'
      );
      // Logs have no realm-based default.
      assert.strictEqual(map.get('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'), 'null');
    });

    it('returns yaml type when yaml configuration is loaded', () => {
      process.env.MY_LOG_LEVEL = 'warn';
      const yamlContent =
        'file_format: "1.0-rc.2"\nlog_level: ${MY_LOG_LEVEL}\n';
      loadConfiguration(yamlContent);

      const config = getLoadedConfigurationString();

      assert.strictEqual(config.type, 'yaml');
      assert.strictEqual(
        config.content,
        'file_format: "1.0-rc.2"\nlog_level: warn\n'
      );
    });
  });
});
