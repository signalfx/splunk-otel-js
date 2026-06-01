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
  resetConfiguration,
  setGlobalConfiguration,
} from '../../src/configuration';
import { cleanEnvironment } from '../utils';

import { parse as parseYaml } from 'yaml';

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
      resetConfiguration();
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
  });

  describe('effective declarative config', () => {
    beforeEach(() => {
      cleanEnvironment();
      resetConfiguration();
    });

    // Mirrors the worked example in the GDI specification's "Effective
    // Declarative Config" section.
    const SPEC_EXAMPLE_YAML = `
file_format: "1.0-rc.2"
tracer_provider:
  processors:
    - batch:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/traces
meter_provider:
  readers:
    - periodic:
        exporter:
          otlp_grpc:
            endpoint: http://localhost:4318/v1/metrics
logger_provider:
  processors:
    - simple:
        exporter:
          otlp_http:
            endpoint: http://localhost:4318/v1/logs
distribution:
  splunk:
    profiling:
      always_on:
        cpu_profiler:
          sampling_interval: 1001
        memory_profiler:
`;

    function loadAndReport(yamlContent: string) {
      setGlobalConfiguration(loadConfiguration(yamlContent));
      return getLoadedConfigurationString();
    }

    it('reports a filtered minimal view of the required fields', () => {
      process.env.OTEL_CONFIG_FILE = '/usr/otel/agent.yaml';
      const config = loadAndReport(SPEC_EXAMPLE_YAML);

      assert.strictEqual(config.type, 'yaml');
      // AgentConfigFile name matches OTEL_CONFIG_FILE, including the path.
      assert.strictEqual(config.name, '/usr/otel/agent.yaml');

      const body = parseYaml(config.content);
      assert.strictEqual(body.otel_config_file, '/usr/otel/agent.yaml');
      assert.strictEqual(body.otel_experimental_config_file, null);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://localhost:4318/v1/traces'
      );
      assert.strictEqual(
        body.meter_provider.readers[0].periodic.exporter.otlp_grpc.endpoint,
        'http://localhost:4318/v1/metrics'
      );
      assert.strictEqual(
        body.logger_provider.processors[0].simple.exporter.otlp_http.endpoint,
        'http://localhost:4318/v1/logs'
      );
      assert.strictEqual(
        body.distribution.splunk.profiling.always_on.cpu_profiler
          .sampling_interval,
        1001
      );
      assert('memory_profiler' in body.distribution.splunk.profiling.always_on);
      // No callgraphs were configured, so the feature is absent (inactive).
      assert(!('callgraphs' in body.distribution.splunk.profiling));
    });

    it('drops fields that are not part of the required set', () => {
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\nlog_level: debug\n' +
          'tracer_provider:\n  processors:\n    - batch:\n' +
          '        exporter:\n          otlp_http:\n' +
          '            endpoint: http://localhost:4318/v1/traces\n'
      );

      const body = parseYaml(config.content);
      assert(!('file_format' in body), 'file_format must be filtered out');
      assert(!('log_level' in body), 'log_level must be filtered out');
      assert('tracer_provider' in body);
    });

    it('reports callgraphs.sampling_interval when configured', () => {
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ndistribution:\n  splunk:\n' +
          '    profiling:\n      callgraphs:\n        sampling_interval: 10\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.distribution.splunk.profiling.callgraphs.sampling_interval,
        10
      );
    });

    it('reports evaluated env-variable templates, not the template text', () => {
      process.env.MY_ENDPOINT = 'http://collector.example:4318/v1/traces';
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http:\n' +
          '            endpoint: ${MY_ENDPOINT}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://collector.example:4318/v1/traces'
      );
    });

    it('fills the default endpoint when an otlp_http exporter omits it', () => {
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http: {}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://localhost:4318/v1/traces'
      );
    });

    it('uses a defaulted AgentConfigFile name when no path env var is set', () => {
      const config = loadAndReport('file_format: "1.0-rc.2"\n');
      assert.strictEqual(config.type, 'yaml');
      assert(config.name.length > 0, 'a defaulted name must be provided');
    });
  });
});
