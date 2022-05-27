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

import * as utils from './utils';

describe('start', () => {
  const signals = {};

  const assertCalled = (fns, metrics, profiling, tracing) => {
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
      metrics: sinon.stub(metrics, 'startMetrics').callsFake(() => {}),
      profiling: sinon.stub(profiling, 'startProfiling').callsFake(() => {
        return { stop: signals.stop.profiling };
      }),
      tracing: sinon.stub(tracing, 'startTracing').callsFake(() => true),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should run only enable tracing by default', () => {
    start();
    assertCalled(signals.start, true, false, true);

    stop();
    assertCalled(signals.stop, false, false, true);
  });

  it('should allow toggling signals via boolean', () => {
    start({
      profiling: true,
      tracing: false,
    });
    assertCalled(signals.start, true, true, false);

    stop();
    assertCalled(signals.stop, false, true, false);
  });

  it('should allow toggling signals via env', () => {
    process.env.SPLUNK_PROFILER_ENABLED = '1';
    process.env.SPLUNK_TRACING_ENABLED = 'no';

    start();
    assertCalled(signals.start, true, true, false);

    stop();
    assertCalled(signals.stop, false, true, false);
  });

  it('should throw if start called multiple times', () => {
    start();
    assert.throws(() => start());

    assertCalled(signals.start, true, false, true);

    stop();
    assertCalled(signals.stop, false, false, true);
  });
});
