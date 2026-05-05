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
import { cleanEnvironment } from '../utils';
import { exampleConfigPath } from './utils';

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
