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
import { hrtime } from 'process';
import { ProfilingExtension } from '../../src/profiling/types';
import * as utils from '../utils';

const extension: ProfilingExtension = require('../../src/native_ext').profiling;

function assertNanoSecondString(timestamp: any) {
  assert.equal(typeof timestamp, 'string');
  assert(
    /\d{19,}/.test(timestamp),
    `expected timestamp as a nanosecond string, got ${timestamp}`
  );
}

// Keep the expected count low, the first run of the profiler
// has stacktraces with variable timestamps.
const expectedStacktraceCount = 5;

describe('profiling native extension', () => {
  afterEach(() => {
    extension.stop();
  });

  it('calling stop without initialized profiling returns null', () => {
    assert.equal(extension.stop(), null);
  });

  it('is possible to collect stacktraces', () => {
    // returns null if no profiling started
    assert.equal(extension.collect(), null);

    // Use a lower interval to make sure we capture something
    extension.start({
      samplingIntervalMicroseconds: 1_000,
      recordDebugInfo: false,
    });

    utils.spinMs(100);

    const result = extension.collect();
    // The types might not be what is declared in typescript, a sanity check.
    assert.equal(typeof result, 'object');
    const { stacktraces, startTimeNanos } = result;
    assertNanoSecondString(startTimeNanos);

    assert(
      stacktraces.length >= expectedStacktraceCount,
      `expected ${expectedStacktraceCount} stacktraces, got ${stacktraces.length}`
    );

    for (const { stacktrace, timestamp } of stacktraces) {
      // Don't bother checking for span and trace ID here.
      assert.equal(typeof stacktrace, 'string');
      assertNanoSecondString(timestamp);

      // The first two lines are intentionally empty,
      // as we don't have information about the thread state.
      const lines = stacktrace.split('\n');
      assert.deepEqual(lines[0], '');
      assert.deepEqual(lines[1], '');
      const stacklines = lines.slice(2, -1);

      for (const stackline of stacklines) {
        assert(/.+\(.+:\d+:\d+\)/.test(stackline), stackline);
      }
    }
  });

  it('is possible to collect raw data on stacktraces', () => {
    // returns null if no profiling started
    assert.equal(extension.collectRaw(), null);

    // Use a lower interval to make sure we capture something
    extension.start({
      samplingIntervalMicroseconds: 1_000,
      recordDebugInfo: false,
    });

    utils.spinMs(100);

    const result = extension.collectRaw();
    // The types might not be what is declared in typescript, a sanity check.
    assert.equal(typeof result, 'object');
    const { stacktraces, startTimeNanos } = result;
    assertNanoSecondString(startTimeNanos);

    assert(
      stacktraces.length >= expectedStacktraceCount,
      `expected ${expectedStacktraceCount} stacktraces, got ${stacktraces.length}`
    );

    for (const { stacktrace, timestamp } of stacktraces) {
      // Don't bother checking for span and trace ID here.
      assert(Array.isArray(stacktrace));
      assertNanoSecondString(timestamp);

      for (const traceline of stacktrace) {
        assert(Array.isArray(traceline));
        assert.equal(traceline.length, 4);
        assert.equal(typeof traceline[0], 'string'); // filename
        assert.equal(typeof traceline[1], 'string'); // function name
        assert.equal(typeof traceline[2], 'number'); // line number
        assert.equal(typeof traceline[3], 'number'); // column number
      }
    }
  });
});
