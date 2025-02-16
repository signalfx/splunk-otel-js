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

import * as splunk from '../src';
import { parseOptionsAndConfigureInstrumentations } from '../src/instrumentations';
import * as metrics from '../src/metrics';
import * as profiling from '../src/profiling';
import * as tracing from '../src/tracing';

import { strict as assert } from 'assert';
import { describe, it } from 'node:test';

const assertFunction = (api: typeof splunk, memberName: string) => {
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
      const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
      api.startTracing(tracingOptions);
      assert.throws(() => api.startTracing(tracingOptions));
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
