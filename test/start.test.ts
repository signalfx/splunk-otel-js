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
import * as assert from 'assert';
import * as sinon from 'sinon';

import * as metrics from '../src/metrics';
import * as profiling from '../src/profiling';
import * as tracing from '../src/tracing';
import * as logging from '../src/logging';
import { start, stop } from '../src';
import { Resource } from '@opentelemetry/resources';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

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

const exportInterval = 'exportInterval';
CONFIG.metrics = {
  exportInterval,
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
      sinon.assert.calledOnce(fns.metrics);
    } else {
      sinon.assert.notCalled(fns.metrics);
    }
    if (profiling) {
      sinon.assert.calledOnce(fns.profiling);
    } else {
      sinon.assert.notCalled(fns.profiling);
    }
    if (tracing) {
      sinon.assert.calledOnce(fns.tracing);
    } else {
      sinon.assert.notCalled(fns.tracing);
    }
    if (logging) {
      sinon.assert.calledOnce(fns.logging);
    } else {
      sinon.assert.notCalled(fns.logging);
    }
  };

  beforeEach(utils.cleanEnvironment);

  beforeEach(() => {
    signals.stop = {
      logging: sinon.spy(),
      metrics: sinon.spy(),
      profiling: sinon.spy(),
      tracing: sinon.stub(tracing, 'stopTracing').callsFake(() => {}),
    };

    signals.start = {
      logging: sinon.stub(logging, 'startLogging').callsFake(() => {
        return { stop: signals.stop.logging };
      }),
      metrics: sinon.stub(metrics, 'startMetrics').callsFake(() => {
        return { stop: signals.stop.metrics };
      }),
      profiling: sinon.stub(profiling, 'startProfiling').callsFake(() => {
        return { stop: signals.stop.profiling };
      }),
      tracing: sinon.stub(tracing, 'startTracing').callsFake(() => true),
    };
  });

  afterEach(() => {
    stop();
    sinon.restore();
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

      sinon.assert.calledOnceWithExactly(signals.start.tracing, {
        accessToken: 'xyz',
        endpoint: 'localhost:1111',
        serviceName: 'test',
      });

      sinon.assert.calledOnceWithExactly(signals.start.profiling, {
        endpoint: 'localhost:1111',
        serviceName: 'test',
      });

      sinon.assert.calledOnceWithExactly(signals.start.metrics, {
        accessToken: 'xyz',
        endpoint: 'localhost:1111',
        serviceName: 'test',
      });

      sinon.assert.calledOnceWithExactly(signals.start.logging, {
        accessToken: 'xyz',
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
          ...CONFIG.general,
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
    const sandbox = sinon.createSandbox();
    let c;

    beforeEach(() => {
      utils.cleanEnvironment();
      c = sandbox.spy(console);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('does not enable diagnostic logging by default', () => {
      start();
      diag.info('42');
      assert(c.log.notCalled);
    });

    it('does not enable diagnostic logging via explicit config', () => {
      start({ logLevel: 'none' });
      diag.info('42');
      assert(c.log.notCalled);
    });

    it('is possible to enable diag logging via config', () => {
      start({ logLevel: 'debug' });
      diag.debug('42');
      assert(c.debug.calledWithExactly('42'));
    });

    it('is possible to enable diag logging via env vars', () => {
      process.env.OTEL_LOG_LEVEL = 'info';
      start();
      diag.info('42');
      assert(c.info.calledWithExactly('42'));
    });

    it('prefers programmatic config over env var', () => {
      process.env.OTEL_LOG_LEVEL = 'debug';
      start({ logLevel: 'info' });
      diag.debug('42');
      assert(c.debug.notCalled);
    });
  });
});
