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
import { Resource } from '@opentelemetry/resources';

export interface ProfilingStartOptions {
  samplingIntervalMicroseconds: number;
  recordDebugInfo: boolean;
}

export interface ProfilingStacktrace {
  /** Timestamp of the sample (nanoseconds since Unix epoch). */
  timestamp: string;
  /** Formatted stacktrace. */
  stacktrace: string;
  traceId: Buffer;
  spanId: Buffer;
}

export interface ProfilingData {
  /** Timestamp when profiling was started (nanoseconds since Unix epoch). */
  startTimeNanos: string;
  stacktraces: ProfilingStacktrace[];
}

export interface ProfilingExtension {
  start(options?: ProfilingStartOptions): void;
  stop(): ProfilingData;
  collect(): ProfilingData;
  enterContext(context: unknown, traceId: string, spanId: string): void;
  exitContext(context: unknown): void;
}

export interface ProfilingOptions {
  endpoint: string;
  serviceName: string;
  // Profiling-specific configuration options:
  callstackInterval: number;
  collectionDuration: number;
  debugExport: boolean;
  resource: Resource;
  exporters?: ProfilingExporter[];
}

export interface ProfilingExporter {
  send(profile: ProfilingData): void;
}

export const allowedProfilingOptions = [
  'callstackInterval',
  'collectionDuration',
  'debugExport',
  'endpoint',
  'resource',
  'serviceName',
  'exporters',
];
