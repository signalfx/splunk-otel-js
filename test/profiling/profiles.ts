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

import type { CpuProfile, HeapProfile } from '../../src/profiling/types';

export const cpuProfile: CpuProfile = {
  stacktraces: [
    {
      timestamp: '1657707471544258336',
      stacktrace: [
        ['/app/file.ts', 'doWork', 44, 1],
        ['/app/foo.ts', 'noline', 0, 2],
      ],
      spanId: Buffer.from('adbfe5ed33c9a3ff', 'hex'),
      traceId: Buffer.from('10192d1c807161471ad2011522853770', 'hex'),
    },
  ],
  startTimeNanos: '1657707471456450000',

  profilerStartDuration: 100,
  profilerStopDuration: 110,
  profilerProcessingStepDuration: 120,
};

export const heapProfile: HeapProfile = {
  samples: [
    { nodeId: 1, size: 128 },
    { nodeId: 1, size: 256 },
    { nodeId: 3, size: 512 },
  ],
  treeMap: {
    1: {
      name: 'work',
      scriptName: '/app/foo.js',
      lineNumber: 42,
      parentId: 2,
    },
    2: {
      name: 'schedule',
      scriptName: '/app/foo.js',
      lineNumber: 241,
      parentId: 3,
    },
    3: {
      name: 'runTimers',
      scriptName: 'node:internal/timers',
      lineNumber: -1,
      parentId: 0,
    },
    4: {
      name: 'other',
      scriptName: '',
      lineNumber: 10,
      parentId: 0,
    },
  },
  timestamp: Date.now(),
  profilerCollectDuration: 110,
  profilerProcessingStepDuration: 120,
};
