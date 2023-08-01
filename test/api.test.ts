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
import { deprecate } from 'util';

import * as splunk from '../src';

import * as tracing from '../src/tracing';
import * as metrics from '../src/metrics';
import * as profiling from '../src/profiling';

const SIGNALS = {
  tracing,
  metrics,
  profiling,
};

const assertFunction = (api, memberName) => {
  assert.equal(
    typeof api[memberName],
    'function',
    `"${memberName}" is not a function`
  );
};

describe('API', () => {
  describe('global', () => {
    const api = splunk;

    it('should export signal-specific start', () => {
      assertFunction(api, 'startTracing');
      assertFunction(api, 'startProfiling');
      assertFunction(api, 'startMetrics');
    });

    it('should export signal-specific stop', () => {
      assertFunction(api, 'stopTracing');
    });
  });

  describe('tracing', () => {
    // Since there's a lot of case-by-case logic in the tests, will mimic a
    // would-be-loop-iteration. will perhaps not need these local vars eventually.
    const api = tracing;

    it('should export signal-specific start', () => {
      assertFunction(api, 'startTracing');
    });

    it('should export signal-specific stop', () => {
      assertFunction(api, 'stopTracing');
    });

    it('should throw if start is called multiple times', () => {
      api.startTracing();
      assert.throws(() => api.startTracing());
      api.stopTracing();
    });

    it('should do nothing if stop is called without start (even multiple times)', () => {
      api.stopTracing();
      api.stopTracing();
    });
  });

  describe('metrics', () => {
    const api = metrics;

    it('should export signal-specific start', () => {
      assertFunction(api, 'startMetrics');
    });
  });

  describe('profiling', () => {
    const api = profiling;

    it('should export signal-specific start', () => {
      assertFunction(api, 'startProfiling');
    });
  });
});
