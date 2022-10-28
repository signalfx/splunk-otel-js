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
import { start, stop } from '../src';
import { Resource } from '@opentelemetry/resources';

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
const debugExport = 'debugExport';
const resource = Resource.empty();
CONFIG.profiling = {
  callstackInterval,
  collectionDuration,
  debugExport,
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
    signals: ('tracing' | 'metrics' | 'profiling')[]
  ) => {
    const metrics = signals.includes('metrics');
    const tracing = signals.includes('tracing');
    const profiling = signals.includes('profiling');

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
  };

  beforeEach(utils.cleanEnvironment);

  beforeEach(() => {
    signals.stop = {
      metrics: sinon.spy(),
      profiling: sinon.spy(),
      tracing: sinon.stub(tracing, 'stopTracing').callsFake(() => {}),
    };

    signals.start = {
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
      });
      assertCalled(signals.start, ['metrics', 'profiling']);

      stop();
      assertCalled(signals.stop, ['metrics', 'profiling']);
    });

    it('should allow toggling signals via env', () => {
      process.env.SPLUNK_METRICS_ENABLED = 'y';
      process.env.SPLUNK_PROFILER_ENABLED = '1';
      process.env.SPLUNK_TRACING_ENABLED = 'no';

      start();
      assertCalled(signals.start, ['profiling', 'metrics']);

      stop();
      assertCalled(signals.stop, ['profiling', 'metrics']);
    });

    it('should throw if start called multiple times', () => {
      start();
      assert.throws(() => start());

      assertCalled(signals.start, ['tracing']);

      stop();
      assertCalled(signals.stop, ['tracing']);
    });
  });

  describe('configuration', () => {
    it('works with partial configurations', () => {
      start({
        ...CONFIG.general,
        profiling: {},
        tracing: {},
        metrics: {},
      });

      assertCalled(signals.start, ['tracing', 'profiling', 'metrics']);
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
});
