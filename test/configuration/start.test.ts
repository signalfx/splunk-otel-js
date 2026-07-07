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
import { afterEach, beforeEach, describe, it, mock, Mock } from 'node:test';

import { diag, DiagLogLevel } from '@opentelemetry/api';
import { start, stop } from '../../src';
import * as logging from '../../src/logging';
import * as metrics from '../../src/metrics';
import * as profiling from '../../src/profiling';
import * as snapshots from '../../src/tracing/snapshots/Snapshots';
import * as tracing from '../../src/tracing';
import {
  getLoadedConfigurationString,
  resetConfiguration,
} from '../../src/configuration';
import { resetEffectiveState } from '../../src/opamp/effective-state';
import { cleanEnvironment } from '../utils';
import { exampleConfigPath } from './utils';
import { parse as parseYaml } from 'yaml';

describe('start with file configuration', () => {
  let signals: {
    logging?: Mock<typeof logging.startLogging>;
    tracing?: Mock<typeof tracing.startTracing>;
    profiling?: Mock<typeof profiling.startProfiling>;
    metrics?: Mock<typeof metrics.startMetrics>;
    snapshots?: Mock<typeof snapshots.startSnapshotProfiling>;
  } = {};

  beforeEach(() => {
    cleanEnvironment();

    signals = {
      logging: mock.method(logging, 'startLogging', () => ({
        stop: () => Promise.resolve(),
      })),
      metrics: mock.method(metrics, 'startMetrics', () => ({
        stop: () => Promise.resolve(),
      })),
      profiling: mock.method(profiling, 'startProfiling', () => ({
        stop: () => Promise.resolve(),
      })),
      tracing: mock.method(tracing, 'startTracing', () => true),
      snapshots: mock.method(snapshots, 'startSnapshotProfiling', () => {}),
    };
  });

  afterEach(async () => {
    await stop();
  });

  describe('signals', () => {
    it('should start all the signals provided in the config', () => {
      // Sanity check that file config is used over env vars
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = exampleConfigPath();
      process.env.SPLUNK_METRICS_ENABLED = 'false';
      process.env.SPLUNK_PROFILER_ENABLED = 'false';
      process.env.SPLUNK_TRACING_ENABLED = 'false';
      process.env.SPLUNK_AUTOMATIC_LOG_COLLECTION = 'false';

      start();

      assert.deepStrictEqual(signals.tracing?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.metrics?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.logging?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.profiling?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.snapshots?.mock.callCount(), 1);
    });

    it('should load the config file from OTEL_CONFIG_FILE', () => {
      process.env.OTEL_CONFIG_FILE = exampleConfigPath();
      process.env.SPLUNK_METRICS_ENABLED = 'false';
      process.env.SPLUNK_PROFILER_ENABLED = 'false';
      process.env.SPLUNK_TRACING_ENABLED = 'false';
      process.env.SPLUNK_AUTOMATIC_LOG_COLLECTION = 'false';

      start();

      assert.deepStrictEqual(signals.tracing?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.metrics?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.logging?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.profiling?.mock.callCount(), 1);
      assert.deepStrictEqual(signals.snapshots?.mock.callCount(), 1);
    });

    it('prefers OTEL_CONFIG_FILE over the deprecated OTEL_EXPERIMENTAL_CONFIG_FILE', () => {
      process.env.OTEL_CONFIG_FILE = exampleConfigPath();
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = '/does/not/exist.yaml';
      process.env.SPLUNK_METRICS_ENABLED = 'false';
      process.env.SPLUNK_PROFILER_ENABLED = 'false';
      process.env.SPLUNK_TRACING_ENABLED = 'false';
      process.env.SPLUNK_AUTOMATIC_LOG_COLLECTION = 'false';

      start();

      assert.deepStrictEqual(signals.tracing?.mock.callCount(), 1);
    });
  });

  describe('effective config gating', () => {
    beforeEach(() => {
      // Other tests in this suite load declarative config / record effective
      // state; clear both so this test sees the environment-format report.
      resetConfiguration();
      resetEffectiveState();
    });

    function envReport(): Map<string, string> {
      const map = new Map<string, string>();
      for (const line of getLoadedConfigurationString().content.split('\n')) {
        const eq = line.indexOf('=');
        map.set(line.slice(0, eq), line.slice(eq + 1));
      }
      return map;
    }

    it('reports the profiler disabled when disabled via the API despite env', () => {
      // Profiler is enabled in the environment but disabled programmatically,
      // so it never starts; OpAMP must not report it as enabled.
      process.env.SPLUNK_PROFILER_ENABLED = 'true';
      process.env.SPLUNK_PROFILER_MEMORY_ENABLED = 'true';

      start({ profiling: false });

      const map = envReport();
      assert.strictEqual(signals.profiling?.mock.callCount(), 0);
      assert.strictEqual(map.get('SPLUNK_PROFILER_ENABLED'), 'false');
      assert.strictEqual(map.get('SPLUNK_PROFILER_MEMORY_ENABLED'), 'false');
    });

    it('drops a declared provider for a signal disabled via the API', () => {
      // The file declares tracer/meter/logger providers, but tracing is
      // disabled programmatically so its pipeline never starts; the declarative
      // report must not advertise a trace exporter that is not running. Metrics
      // is enabled so its provider stays in the report, isolating the effect of
      // disabling tracing.
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = exampleConfigPath();
      process.env.SPLUNK_METRICS_ENABLED = 'true';

      start({ tracing: false });

      const body = parseYaml(getLoadedConfigurationString().content);
      assert.strictEqual(signals.tracing?.mock.callCount(), 0);
      assert.strictEqual(body.tracer_provider, undefined);
      assert.notStrictEqual(body.meter_provider, undefined);
    });
  });

  describe('log levels', () => {
    let setLoggerSpy: Mock<typeof diag.setLogger>;

    beforeEach(() => {
      cleanEnvironment();
      setLoggerSpy = mock.method(diag, 'setLogger');
    });

    afterEach(() => {
      mock.reset();
    });

    it('uses the defined log level', () => {
      // The example config file pins log_level: warn (overrides the env var below).
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = exampleConfigPath();
      process.env.OTEL_LOG_LEVEL = 'debug';
      start();
      assert.strictEqual(setLoggerSpy.mock.callCount(), 1);
      assert.strictEqual(
        setLoggerSpy.mock.calls[0].arguments[1],
        DiagLogLevel.WARN
      );
    });
  });
});
