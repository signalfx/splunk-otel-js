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

import { diag } from '@opentelemetry/api';
import { start, stop } from '../../src';
import * as logging from '../../src/logging';
import * as metrics from '../../src/metrics';
import * as profiling from '../../src/profiling';
import * as tracing from '../../src/tracing';
import { cleanEnvironment } from '../utils';
import { exampleConfigPath } from './utils';

describe('start with file configuration', () => {
  let signals: {
    logging?: Mock<typeof logging.startLogging>;
    tracing?: Mock<typeof tracing.startTracing>;
    profiling?: Mock<typeof profiling.startProfiling>;
    metrics?: Mock<typeof metrics.startMetrics>;
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
    });
  });

  describe('log levels', () => {
    let infoSpy: Mock<typeof console.info>;
    let warnSpy: Mock<typeof console.warn>;
    let debugSpy: Mock<typeof console.debug>;

    beforeEach(() => {
      cleanEnvironment();
      infoSpy = mock.method(console, 'info');
      warnSpy = mock.method(console, 'warn');
      debugSpy = mock.method(console, 'debug');
    });

    afterEach(() => {
      mock.reset();
    });

    it('uses the defined log level', () => {
      // The test config file has debug log level set
      process.env.OTEL_EXPERIMENTAL_CONFIG_FILE = exampleConfigPath();
      process.env.OTEL_LOG_LEVEL = 'warn';
      start();
      diag.debug('debug');
      diag.info('info');
      diag.warn('log level test - warn');
      assert.strictEqual(debugSpy.mock.callCount(), 0);
      assert.strictEqual(infoSpy.mock.callCount(), 0);
      assert.ok(warnSpy.mock.callCount() > 1);
    });
  });
});
