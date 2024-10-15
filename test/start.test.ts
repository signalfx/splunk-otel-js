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
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import { diag } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { start, stop } from '../src';
import * as logging from '../src/logging';
import * as metrics from '../src/metrics';
import * as profiling from '../src/profiling';
import * as tracing from '../src/tracing';

import * as utils from './utils';

const CONFIG = {};

const accessToken = 'accessToken';
const endpoint = 'endpoint';
const serviceName = 'serviceName';
CONFIG.general = {
  accessToken,
  endpoint,
  serviceName,
};

const exportIntervalMillis = 'exportInterval';
CONFIG.metrics = {
  exportIntervalMillis,
};

const callstackInterval = 'callstackInterval';
const collectionDuration = 'collectionDuration';
const resource = Resource.empty();
CONFIG.profiling = {
  callstackInterval,
  collectionDuration,
  resource,
};

const captureHttpRequestUriParams = 'captureHttpRequestUriParams';
const instrumentations = 'instrumentations';
const propagatorFactory = 'propagatorFactory';
const serverTimingEnabled = 'serverTimingEnabled';
const spanExporterFactory = 'spanExporterFactory';
const spanProcessorFactory = 'spanProcessorFactory';
const tracerConfig = 'tracerConfig';
CONFIG.tracing = {
  captureHttpRequestUriParams,
  instrumentations,
  propagatorFactory,
  serverTimingEnabled,
  spanExporterFactory,
  spanProcessorFactory,
  tracerConfig,
};

describe('start', () => {
  const signals = {};

  const assertCalled = (
    fns,
    signals: ('tracing' | 'metrics' | 'profiling' | 'logging')[]
  ) => {
    const metrics = signals.includes('metrics');
    const tracing = signals.includes('tracing');
    const profiling = signals.includes('profiling');
    const logging = signals.includes('logging');

    if (metrics) {
      assert(fns.metrics.mock.callCount() === 1);
    } else {
      assert(fns.metrics.mock.callCount() === 0);
    }
    if (profiling) {
      assert(fns.profiling.mock.callCount() === 1);
    } else {
      assert(fns.profiling.mock.callCount() === 0);
    }
    if (tracing) {
      assert(fns.tracing.mock.callCount() === 1);
    } else {
      assert(fns.tracing.mock.callCount() === 0);
    }
    if (logging) {
      assert(fns.logging.mock.callCount() === 1);
    } else {
      assert(fns.logging.mock.callCount() === 0);
    }
  };

  beforeEach(utils.cleanEnvironment);

  beforeEach(() => {
    signals.stop = {
      logging: mock.fn(),
      metrics: mock.fn(),
      profiling: mock.fn(),
      tracing: mock.method(tracing, 'stopTracing', () => {}),
    };

    signals.start = {
      logging: mock.method(logging, 'startLogging', () => {
        return { stop: signals.stop.logging };
      }),
      metrics: mock.method(metrics, 'startMetrics', () => {
        return { stop: signals.stop.metrics };
      }),
      profiling: mock.method(profiling, 'startProfiling', () => {
        return { stop: signals.stop.profiling };
      }),
      tracing: mock.method(tracing, 'startTracing', () => true),
    };
  });

  afterEach(() => {
    stop();
    // sinon.restore(); //FIXME hmmm
  });

  describe('toggling signals', () => {
    it('should run only enable tracing by default', () => {
      start();
      assertCalled(signals.start, ['tracing']);

      stop();
      assertCalled(signals.stop, ['tracing']);
    });

    it('should allow toggling signals via boolean', () => {
      start({
        metrics: true,
        profiling: true,
        tracing: false,
        logging: true,
      });
      assertCalled(signals.start, ['metrics', 'profiling', 'logging']);

      stop();
      assertCalled(signals.stop, ['metrics', 'profiling', 'logging']);
    });

    it('should allow toggling signals via env', () => {
      process.env.SPLUNK_METRICS_ENABLED = 'y';
      process.env.SPLUNK_PROFILER_ENABLED = '1';
      process.env.SPLUNK_TRACING_ENABLED = 'no';
      process.env.SPLUNK_AUTOMATIC_LOG_COLLECTION = 'true';

      start();
      assertCalled(signals.start, ['profiling', 'metrics', 'logging']);

      stop();
      assertCalled(signals.stop, ['profiling', 'metrics', 'logging']);
    });

    it('should throw if start called multiple times', () => {
      start();
      assert.throws(() => start());

      assertCalled(signals.start, ['tracing']);

      stop();
      assertCalled(signals.stop, ['tracing']);
    });

    it('does not add extra configuration arguments to signals', () => {
      start({
        accessToken: 'xyz',
        endpoint: 'localhost:1111',
        serviceName: 'test',
        logLevel: 'debug',
        profiling: true,
        metrics: true,
        logging: true,
      });

      utils.calledOnceWithMatch(signals.start.tracing, {
        accessToken: 'xyz',
        endpoint: 'localhost:1111',
        serviceName: 'test',
        serverTimingEnabled: true,
        captureHttpRequestUriParams: [],
      });

      utils.calledOnceWithMatch(signals.start.profiling, {
        endpoint: 'localhost:1111',
        serviceName: 'test',
      });

      utils.calledOnceWithMatch(signals.start.metrics, {
        accessToken: 'xyz',
        endpoint: 'localhost:1111',
        serviceName: 'test',
      });

      utils.calledOnceWithMatch(signals.start.logging, {
        //accessToken: 'xyz',// FIXME logging doesn't use accessToken atm cause no ingest
        endpoint: 'localhost:1111',
        serviceName: 'test',
      });
    });
  });

  describe('configuration', () => {
    it('works with partial configurations', () => {
      start({
        ...CONFIG.general,
        profiling: {},
        tracing: {},
        metrics: {},
        logging: {},
      });

      assertCalled(signals.start, [
        'tracing',
        'profiling',
        'metrics',
        'logging',
      ]);
    });

    it('works if all the configuration options are passed', () => {
      start({
        ...CONFIG.general,
        profiling: {
          endpoint: CONFIG.general.endpoint,
          serviceName: CONFIG.general.serviceName,
          ...CONFIG.profiling,
        },
        tracing: {
          ...CONFIG.general,
          ...CONFIG.tracing,
        },
        metrics: {
          ...CONFIG.general,
          ...CONFIG.metrics,
        },
      });

      assertCalled(signals.start, ['tracing', 'profiling', 'metrics']);
    });

    it('throws if invalid configuration options are passed', () => {
      assert.throws(
        () =>
          start({
            extraneous: 'extraneous',
          }),
        /extraneous/
      );

      assertCalled(signals.start, []);
    });
  });

  describe('diagnostic logging', () => {
    let logSpy;
    let infoSpy;
    let debugSpy;

    beforeEach(() => {
      utils.cleanEnvironment();
      logSpy = mock.method(console, 'log');
      infoSpy = mock.method(console, 'info');
      debugSpy = mock.method(console, 'debug');
    });

    afterEach(() => {
      logSpy.mock.resetCalls();
      infoSpy.mock.resetCalls();
      debugSpy.mock.resetCalls();
    });

    it('does not enable diagnostic logging by default', () => {
      start();
      diag.info('42');
      assert(logSpy.mock.callCount() === 0);
    });

    it('does not enable diagnostic logging via explicit config', () => {
      start({ logLevel: 'none' });
      diag.info('42');
      assert(logSpy.mock.callCount() === 0);
    });

    it('is possible to enable diag logging via config', () => {
      start({ logLevel: 'debug' });
      diag.debug('42');
      utils.calledWithExactly(debugSpy, '42');
    });

    it('is possible to enable diag logging via env vars', () => {
      process.env.OTEL_LOG_LEVEL = 'info';
      start();
      diag.info('42');
      utils.calledWithExactly(infoSpy, '42');
    });

    it('prefers programmatic config over env var', () => {
      process.env.OTEL_LOG_LEVEL = 'debug';
      start({ logLevel: 'info' });
      diag.debug('42');
      assert(debugSpy.mock.callCount() === 0);
    });
  });
});
