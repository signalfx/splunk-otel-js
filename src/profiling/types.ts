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

interface GenericProfilingStacktrace<StackTraceType> {
  /** Timestamp of the sample (nanoseconds since Unix epoch). */
  timestamp: string;
  /** Formatted stacktrace. */
  stacktrace: StackTraceType;
  traceId: Buffer;
  spanId: Buffer;
}

interface GenericProfilingData<T> {
  /** Timestamp when profiling was started (nanoseconds since Unix epoch). */
  startTimeNanos: string;
  stacktraces: GenericProfilingStacktrace<T>[];
}

export interface RawProfilingStackFrame extends Array<string | number> {
  /** filename */
  0: string;
  /** function name */
  1: string;
  /** line number */
  2: number;
  /** column number */
  3: number;
}

export type RawProfilingData = GenericProfilingData<RawProfilingStackFrame[]>;
export type ProfilingData = GenericProfilingData<string>;

export interface HeapProfileNode {
  name: string;
  scriptName: string;
  lineNumber: number;
  allocations: number[];
  parent: number;
  parentId: number;
}

export interface AllocationSample {
  nodeId: number;
  size: number;
}

export interface HeapProfile {
  samples: AllocationSample[];
  treeMap: { [nodeId: string]: HeapProfileNode };
}

export interface ProfilingExtension {
  start(options?: ProfilingStartOptions): void;
  stop(): RawProfilingData;
  collect(): ProfilingData;
  collectRaw(): RawProfilingData;
  enterContext(context: unknown, traceId: string, spanId: string): void;
  exitContext(context: unknown): void;
  startMemoryProfiling(): void;
  collectHeapProfile(): HeapProfile;
}

export type ProfilingExporterFactory = (
  options: ProfilingOptions
) => ProfilingExporter[];

export interface MemoryProfilingOptions {
  maxStackDepth?: number;
  sampleIntervalBytes?: number;
}

export interface ProfilingOptions {
  endpoint: string;
  serviceName: string;
  // Profiling-specific configuration options:
  callstackInterval: number;
  collectionDuration: number;
  debugExport: boolean;
  resource: Resource;
  exporterFactory: ProfilingExporterFactory;
  memoryProfilingEnabled: boolean;
  memoryProfilingOptions?: MemoryProfilingOptions;
}

export interface ProfilingExporter {
  send(profile: RawProfilingData): void;
  sendHeapProfile(profile: HeapProfile): void;
}

export const allowedProfilingOptions = [
  'callstackInterval',
  'collectionDuration',
  'debugExport',
  'endpoint',
  'resource',
  'serviceName',
  'exporterFactory',
  'memoryProfilingEnabled',
  'memoryProfilingOptions',
];
