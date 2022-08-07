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
import {
  AllocationSample,
  HeapProfileNode,
  ProfilingExtension,
} from '../../src/profiling/types';
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

  it('is possible to collect a heap profile', () => {
    assert.equal(extension.collectHeapProfile(), null);

    extension.startMemoryProfiling();

    function doAllocations() {
      const dump = [];

      for (let i = 0; i < 4096; i++) {
        dump.push(`abcd-${i}`.repeat(2048));
      }

      return dump;
    }

    doAllocations();

    const profile = extension.collectHeapProfile();

    assert.notEqual(profile, null);
    assert.equal(typeof profile.timestamp, 'number');
    assert(
      Date.now() - profile.timestamp <= 60_000,
      'not a feasible heap profile timestamp'
    );

    const { treeMap, samples } = profile;

    assert(samples.length > 0, 'no allocation samples');

    let maybeLeaf: HeapProfileNode | undefined;
    let leafNodeId;
    for (const nodeId in treeMap) {
      const node = treeMap[nodeId];
      if (node.name === 'repeat') {
        maybeLeaf = node;
        leafNodeId = Number(nodeId);
        break;
      }
    }

    assert.notEqual(maybeLeaf, undefined);
    assert.notEqual(leafNodeId, undefined);
    const leaf = maybeLeaf!;
    assert.deepEqual(leaf.lineNumber, 0);
    assert.deepEqual(leaf.scriptName, '');
    assert.deepEqual(typeof leaf.parentId, 'number');

    const parentNode = treeMap[leaf.parentId];
    assert(parentNode.lineNumber > 0, 'parent line number can not be empty');
    assert(
      parentNode.scriptName.endsWith('extension.test.ts'),
      'invalid parent node file name'
    );
    assert.deepEqual(parentNode.name, 'doAllocations');
    assert.deepEqual(typeof parentNode.parentId, 'number');

    // No point going up the tree any more

    let maybeSample: AllocationSample | undefined;

    for (const s of samples) {
      if (s.nodeId === leafNodeId) {
        maybeSample = s;
        break;
      }
    }

    assert.notEqual(maybeSample, undefined);
    const sample = maybeSample!;
    assert.deepEqual(typeof sample.size, 'number');
    assert(sample.size > 0, 'sample with zero size');
  });
});
