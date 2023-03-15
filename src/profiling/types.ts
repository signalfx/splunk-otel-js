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
  stacktrace: ProfilingStackFrame[];
  traceId: Buffer;
  spanId: Buffer;
}

export interface CpuProfile {
  /** Timestamp when profiling was started (nanoseconds since Unix epoch). */
  startTimeNanos: string;
  stacktraces: ProfilingStacktrace[];

  profilerStartDuration: number;
  profilerStopDuration: number;
  profilerProcessingDuration: number;
}

export interface ProfilingStackFrame extends Array<string | number> {
  /** filename */
  0: string;
  /** function name */
  1: string;
  /** line number */
  2: number;
  /** column number */
  3: number;
}

export interface HeapProfileNode {
  name: string;
  scriptName: string;
  lineNumber: number;
  parentId: number;
}

export interface AllocationSample {
  nodeId: number;
  size: number;
}

export interface HeapProfile {
  samples: AllocationSample[];
  treeMap: { [nodeId: string]: HeapProfileNode };
  timestamp: number;
}

export interface ProfilingExtension {
  start(options?: ProfilingStartOptions): void;
  stop(): CpuProfile;
  collect(): CpuProfile;
  enterContext(context: unknown, traceId: string, spanId: string): void;
  exitContext(context: unknown): void;
  startMemoryProfiling(options?: MemoryProfilingOptions): void;
  stopMemoryProfiling(): void;
  collectHeapProfile(): HeapProfile | null;
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
  resource: Resource;
  exporterFactory: ProfilingExporterFactory;
  memoryProfilingEnabled: boolean;
  memoryProfilingOptions?: MemoryProfilingOptions;
}

export type StartProfilingOptions = Partial<ProfilingOptions>;

export interface ProfilingExporter {
  send(profile: CpuProfile): void;
  sendHeapProfile(profile: HeapProfile): void;
}

export const allowedProfilingOptions = [
  'callstackInterval',
  'collectionDuration',
  'endpoint',
  'resource',
  'serviceName',
  'exporterFactory',
  'memoryProfilingEnabled',
  'memoryProfilingOptions',
];
