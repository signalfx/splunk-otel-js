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

import * as sinon from 'sinon';
import * as tracing from '../src/tracing';
import * as metrics from '../src/metrics';

describe('instrumentation', () => {
  let startTracingMock;
  let startMetricsMock;

  beforeEach(() => {
    startTracingMock = sinon.stub(tracing, 'startTracing');
    startMetricsMock = sinon.stub(metrics, 'startMetrics');
  });

  afterEach(() => {
    startTracingMock.reset();
    startTracingMock.restore();
    startMetricsMock.reset();
    startMetricsMock.restore();
  });

  it('importing auto calls startTracing', () => {
    require('../src/instrument');
    sinon.assert.calledOnce(startTracingMock);
  });
});