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
import {
  getEffectiveState,
  recordEffectiveState,
  resetEffectiveState,
} from '../../src/opamp/effective-state';
import {
  _setDefaultOptions as setDefaultTracingOptions,
  otlpSpanExporterFactory,
} from '../../src/tracing/options';
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
      resetEffectiveState();
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

    it('reflects resolved/effective values and drops extras', () => {
      process.env.SPLUNK_PROFILER_ENABLED = 'true';
      process.env.SPLUNK_PROFILER_CALL_STACK_INTERVAL = '1001';
      // Not in the required set — must be dropped.
      process.env.OTEL_SERVICE_NAME = 'my-service';

      const config = getLoadedConfigurationString();
      const map = parseEnvBody(config.content);

      assert.strictEqual(map.get('SPLUNK_PROFILER_ENABLED'), 'true');
      assert.strictEqual(
        map.get('SPLUNK_PROFILER_CALL_STACK_INTERVAL'),
        '1001'
      );
      assert(!map.has('OTEL_SERVICE_NAME'), 'extra keys must not be reported');
    });

    it('reports endpoints as null when no exporter has started', () => {
      // Endpoints are sourced from what an exporter actually started with, not
      // re-derived from the environment. With no exporter running there is no
      // active endpoint to report.
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4318';
      process.env.SPLUNK_REALM = 'us0';

      const map = parseEnvBody(getLoadedConfigurationString().content);
      assert.strictEqual(map.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'), 'null');
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_METRICS_ENDPOINT'),
        'null'
      );
      assert.strictEqual(map.get('OTEL_EXPORTER_OTLP_LOGS_ENDPOINT'), 'null');
    });
  });

  describe('runtime-effective values (state holder)', () => {
    beforeEach(() => {
      cleanEnvironment();
      resetConfiguration();
      resetEffectiveState();
    });

    it('prefers recorded runtime values over env/config derivation', () => {
      // Simulate values a component reported as it actually started, e.g. an
      // endpoint and call-stack interval passed via the programmatic API.
      recordEffectiveState({
        tracesEndpoint: 'http://programmatic:4318/v1/traces',
        callStackInterval: 9999,
        memoryProfilerEnabled: true,
      });

      const map = parseEnvBody(getLoadedConfigurationString().content);
      assert.strictEqual(
        map.get('OTEL_EXPORTER_OTLP_TRACES_ENDPOINT'),
        'http://programmatic:4318/v1/traces'
      );
      assert.strictEqual(
        map.get('SPLUNK_PROFILER_CALL_STACK_INTERVAL'),
        '9999'
      );
      assert.strictEqual(map.get('SPLUNK_PROFILER_MEMORY_ENABLED'), 'true');
    });

    it('reports the profiler as disabled when it failed to start', () => {
      // The env says enabled, but the component recorded that it did not
      // actually start (e.g. native extension unavailable).
      process.env.SPLUNK_PROFILER_ENABLED = 'true';
      recordEffectiveState({ profilerEnabled: false });

      const map = parseEnvBody(getLoadedConfigurationString().content);
      assert.strictEqual(map.get('SPLUNK_PROFILER_ENABLED'), 'false');
    });

    it('reports memory profiling disabled when the profiler failed to start', () => {
      // Both flags are requested via env, but the native extension was
      // unavailable so neither the CPU nor memory profiler started. Memory
      // profiling must not fall back to the configured value.
      process.env.SPLUNK_PROFILER_ENABLED = 'true';
      process.env.SPLUNK_PROFILER_MEMORY_ENABLED = 'true';
      // Matches what startProfiling() records on the missing-extension path.
      recordEffectiveState({
        profilerEnabled: false,
        memoryProfilerEnabled: false,
      });

      const map = parseEnvBody(getLoadedConfigurationString().content);
      assert.strictEqual(map.get('SPLUNK_PROFILER_ENABLED'), 'false');
      assert.strictEqual(map.get('SPLUNK_PROFILER_MEMORY_ENABLED'), 'false');
    });

    it('drops a declared profiler from the yaml view when it failed to start', () => {
      recordEffectiveState({ profilerEnabled: false });
      setGlobalConfiguration(
        loadConfiguration(
          'file_format: "1.0-rc.2"\ndistribution:\n  splunk:\n' +
            '    profiling:\n      always_on:\n        cpu_profiler:\n' +
            '          sampling_interval: 1001\n'
        )
      );

      const body = parseYaml(getLoadedConfigurationString().content);
      assert(
        body.distribution === undefined ||
          body.distribution.splunk?.profiling?.always_on?.cpu_profiler ===
            undefined,
        'cpu_profiler must be absent when it did not start'
      );
    });
  });

  // Exercises the real exporter factory (not recordEffectiveState directly) so
  // the recorded endpoint matches the URL the SDK exporter actually uses.
  describe('endpoint recorded by the exporter factory', () => {
    beforeEach(() => {
      cleanEnvironment();
      resetConfiguration();
      resetEffectiveState();
    });

    it('records the programmatic endpoint with the signal path appended', () => {
      otlpSpanExporterFactory(
        setDefaultTracingOptions({ endpoint: 'http://collector:4318' })
      );
      assert.strictEqual(
        getEffectiveState().tracesEndpoint,
        'http://collector:4318/v1/traces'
      );
    });

    it('records the OTEL_EXPORTER_OTLP_ENDPOINT base env var with the path appended', () => {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4318';
      otlpSpanExporterFactory(setDefaultTracingOptions());
      assert.strictEqual(
        getEffectiveState().tracesEndpoint,
        'http://collector:4318/v1/traces'
      );
    });

    it('appends the signal path to a path-prefixed base endpoint', () => {
      // The SDK appends /v1/<signal> to OTEL_EXPORTER_OTLP_ENDPOINT even when it
      // already has a path prefix, unlike a signal-specific endpoint.
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4318/base/';
      otlpSpanExporterFactory(setDefaultTracingOptions());
      assert.strictEqual(
        getEffectiveState().tracesEndpoint,
        'http://collector:4318/base/v1/traces'
      );
    });

    it('records the signal-specific endpoint verbatim', () => {
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
        'http://collector:4318/v1/traces';
      otlpSpanExporterFactory(setDefaultTracingOptions());
      assert.strictEqual(
        getEffectiveState().tracesEndpoint,
        'http://collector:4318/v1/traces'
      );
    });

    it('records the collector default when nothing is configured', () => {
      otlpSpanExporterFactory(setDefaultTracingOptions());
      assert.strictEqual(
        getEffectiveState().tracesEndpoint,
        'http://localhost:4318/v1/traces'
      );
    });

    it('records the grpc default port when grpc protocol is selected', () => {
      process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL = 'grpc';
      otlpSpanExporterFactory(setDefaultTracingOptions());
      assert.strictEqual(
        getEffectiveState().tracesEndpoint,
        'http://localhost:4317'
      );
    });
  });

  describe('effective declarative config', () => {
    beforeEach(() => {
      cleanEnvironment();
      resetConfiguration();
      resetEffectiveState();
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
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '/usr/otel/agent.yaml';
      const config = loadAndReport(SPEC_EXAMPLE_YAML);

      assert.strictEqual(config.type, 'yaml');
      // AgentConfigFile name matches the file that was actually loaded
      // (OTEL_EXPERIMENTAL_CONFIG_FILE), including the path.
      assert.strictEqual(config.name, '/usr/otel/agent.yaml');

      const body = parseYaml(config.content);
      assert.strictEqual(body.otel_config_file, null);
      assert.strictEqual(
        body.otel_experimental_config_file,
        '/usr/otel/agent.yaml'
      );
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

    it('reports a bare callgraphs block as enabled with the default interval', () => {
      // A bare `callgraphs:` parses as null but the runtime enables snapshots
      // (SPLUNK_SNAPSHOT_PROFILER_ENABLED derives from callgraphs !== undefined),
      // so it must be reported, not dropped.
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ndistribution:\n  splunk:\n' +
          '    profiling:\n      callgraphs:\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.distribution.splunk.profiling.callgraphs.sampling_interval,
        1
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

    it('appends the signal path to a host-only traces otlp_http endpoint', () => {
      // The traces exporter factory calls ensureResourcePath, so a host-only
      // endpoint actually exports to /v1/traces; the report must match.
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http:\n' +
          '            endpoint: http://collector:4318\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://collector:4318/v1/traces'
      );
    });

    it('leaves a fully-pathed traces endpoint unchanged', () => {
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http:\n' +
          '            endpoint: http://collector:4318/custom\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://collector:4318/custom'
      );
    });

    it('reports a host-only logs otlp_http endpoint verbatim', () => {
      // Unlike traces/metrics, the logs exporter factory does not append a
      // resource path, so the report must not invent one either.
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\nlogger_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http:\n' +
          '            endpoint: http://collector:4318\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.logger_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://collector:4318'
      );
    });

    it('fills the default gRPC endpoint when an otlp_grpc exporter omits it', () => {
      // The SDK defaults an omitted gRPC endpoint to http://localhost:4317
      // (no signal-specific path), so the report must not say null.
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_grpc: {}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_grpc.endpoint,
        'http://localhost:4317'
      );
    });

    it('reports the signal-specific env endpoint when an http exporter omits it', () => {
      // The factory passes url: undefined, so the SDK resolves the endpoint
      // from OTEL_EXPORTER_OTLP_TRACES_ENDPOINT. The report must reflect that
      // rather than the localhost default.
      process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT =
        'http://collector:4318/v1/traces';

      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http: {}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://collector:4318/v1/traces'
      );
    });

    it('reports the base env endpoint with the signal path when an http exporter omits it', () => {
      // With only OTEL_EXPORTER_OTLP_ENDPOINT set, the SDK appends the signal
      // path; the report must match what telemetry actually uses, not localhost.
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4318';

      const config = loadAndReport(
        'file_format: "1.0-rc.2"\nmeter_provider:\n  readers:\n' +
          '    - periodic:\n        exporter:\n          otlp_http: {}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.meter_provider.readers[0].periodic.exporter.otlp_http.endpoint,
        'http://collector:4318/v1/metrics'
      );
    });

    it('reports the base env endpoint with /v1/logs when a logs http exporter omits it', () => {
      // Even though a configured logs endpoint is used verbatim, an omitted one
      // resolves through the SDK precedence, which appends /v1/logs to the base.
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4318';

      const config = loadAndReport(
        'file_format: "1.0-rc.2"\nlogger_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http: {}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.logger_provider.processors[0].batch.exporter.otlp_http.endpoint,
        'http://collector:4318/v1/logs'
      );
    });

    it('reports the base env endpoint when a gRPC exporter omits it', () => {
      // gRPC has no resource path: the SDK uses the base endpoint as-is.
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://collector:4317';

      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_grpc: {}\n'
      );

      const body = parseYaml(config.content);
      assert.strictEqual(
        body.tracer_provider.processors[0].batch.exporter.otlp_grpc.endpoint,
        'http://collector:4317'
      );
    });

    it('uses a defaulted AgentConfigFile name when no path env var is set', () => {
      const config = loadAndReport('file_format: "1.0-rc.2"\n');
      assert.strictEqual(config.type, 'yaml');
      assert(config.name.length > 0, 'a defaulted name must be provided');
    });

    it('names the AgentConfigFile after the file actually loaded', () => {
      // The distro loads OTEL_EXPERIMENTAL_CONFIG_FILE; the body must not be
      // attributed to a different OTEL_CONFIG_FILE path that was never read.
      process.env.OTEL_CONFIG_FILE = '/stable/never-loaded.yaml';
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '/experimental/loaded.yaml';

      const config = loadAndReport('file_format: "1.0-rc.2"\n');
      assert.strictEqual(config.name, '/experimental/loaded.yaml');
    });

    it('reports every exporter when a signal has multiple processors', () => {
      // All active exporters/endpoints for a signal are reported.
      const config = loadAndReport(
        'file_format: "1.0-rc.2"\ntracer_provider:\n  processors:\n' +
          '    - batch:\n        exporter:\n          otlp_http:\n' +
          '            endpoint: http://a:4318/v1/traces\n' +
          '    - simple:\n        exporter:\n          otlp_grpc:\n' +
          '            endpoint: http://b:4317\n'
      );

      const processors = parseYaml(config.content).tracer_provider.processors;
      assert.strictEqual(processors.length, 2);
      assert.strictEqual(
        processors[0].batch.exporter.otlp_http.endpoint,
        'http://a:4318/v1/traces'
      );
      assert.strictEqual(
        processors[1].simple.exporter.otlp_grpc.endpoint,
        'http://b:4317'
      );
    });

    it('drops a declared provider for a signal disabled at runtime', () => {
      // The file declares all three signal providers, but tracing and logging
      // were disabled (e.g. start({ tracing: false })) so their pipelines never
      // started. Only the still-active meter_provider must be reported.
      recordEffectiveState({ tracingEnabled: false, loggingEnabled: false });

      const config = loadAndReport(SPEC_EXAMPLE_YAML);
      const body = parseYaml(config.content);

      assert.strictEqual(body.tracer_provider, undefined);
      assert.strictEqual(body.logger_provider, undefined);
      assert.notStrictEqual(body.meter_provider, undefined);
    });

    it('reports a declared provider when its signal stays enabled', () => {
      // Recording one signal as disabled must not suppress the others.
      recordEffectiveState({ tracingEnabled: true });

      const config = loadAndReport(SPEC_EXAMPLE_YAML);
      const body = parseYaml(config.content);

      assert.notStrictEqual(body.tracer_provider, undefined);
    });
  });
});
