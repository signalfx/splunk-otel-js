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
import * as fs from 'fs';
import { diag } from '@opentelemetry/api';
import {
  HeapProfile,
  ProfilingData,
  ProfilingExporter,
  RawProfilingData,
} from './types';

export class DebugExporter implements ProfilingExporter {
  runTimestamp = Date.now();
  profileIndex = 0;
  heapProfileIndex = 0;

  send(data: ProfilingData | RawProfilingData) {
    const baseName = `profile-${this.runTimestamp}-${this.profileIndex++}.json`;
    fs.writeFile(baseName, JSON.stringify(data), err => {
      if (err) {
        diag.error(`error writing to ${baseName}`, err);
      }
    });
  }

  sendHeapProfile(profile: HeapProfile) {
    const name = `heap-profile-${this.runTimestamp}-${this
      .heapProfileIndex++}.json`;
    fs.writeFile(name, JSON.stringify(profile), err => {
      if (err) {
        diag.error(`error writing to ${name}`, err);
      }
    });
  }
}
