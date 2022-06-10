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
import { hrtime } from 'process';
import { ProfilingExtension } from '../../src/profiling/types';

const extension: ProfilingExtension = require('../../src/native_ext').profiling;

function spinMs(ms: number) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

function assertNanoSecondString(timestamp: any) {
  assert.equal(typeof timestamp, 'string');
  assert(
    /\d{19,}/.test(timestamp),
    `expected timestamp as a nanosecond string, got ${timestamp}`
  );
}

describe('profiling native extension', () => {
  afterEach(() => {
    extension.stop();
  });

  it('is possible to collect stacktraces', () => {
    // Use a lower interval to make sure we capture something
    extension.start({
      samplingIntervalMicroseconds: 1_000,
      recordDebugInfo: false,
    });

    spinMs(100);

    const result = extension.collect();
    // The types might not be what is declared in typescript, a sanity check.
    assert.equal(typeof result, 'object');
    const { stacktraces, startTimeNanos } = result;
    assertNanoSecondString(startTimeNanos);

    // Keep the expected count low, the first run of the profiler
    // has stacktraces with variable timestamps.
    const expectedStacktraceCount = 5;
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
      assert.deepStrictEqual(lines[0], '');
      assert.deepStrictEqual(lines[1], '');
      const stacklines = lines.slice(2, -1);

      for (const stackline of stacklines) {
        assert(/.+\(.+:\d+:\d+\)/.test(stackline), stackline);
      }
    }
  });
});
