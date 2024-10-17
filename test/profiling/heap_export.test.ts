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
import { start, stop } from '../../src';
import { test } from 'node:test';
import { _setDefaultOptions } from '../../src/profiling';
import {
  CpuProfile,
  HeapProfile,
  ProfilingExporter,
} from '../../src/profiling/types';

const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

test('profiler exports heap profiles', async () => {
  let sendCallCount = 0;
  const exporter: ProfilingExporter = {
    send(_cpuProfile: CpuProfile) {},
    sendHeapProfile(_profile: HeapProfile) {
      sendCallCount += 1;
    },
  };

  // enabling tracing is required for span information to be caught
  start({
    profiling: {
      serviceName: 'my-service',
      collectionDuration: 100,
      exporterFactory: () => [exporter],
      memoryProfilingEnabled: true,
    },
  });

  // let runtime empty the task-queue and enable profiling
  await sleep(200);
  await stop();
  assert(sendCallCount > 0, 'no profiles were sent');
});
