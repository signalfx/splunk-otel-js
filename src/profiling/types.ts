import { Resource } from '@opentelemetry/resources';

export interface ProfilingStartOptions {
  samplingIntervalMicroseconds: number;
  recordDebugInfo: boolean;
}

export interface ProfilingStackTrace {
  /** Timestamp of the sample (nanoseconds since Unix epoch). */
  timestamp: string;
  /** Formatted stacktrace. */
  stacktrace: string;
  traceId: string;
  spanId: string;
}

export interface ProfilingData {
  /** Timestamp when profiling was started (nanoseconds since Unix epoch). */
  startTimeNanos: string;
  stacktraces: ProfilingStackTrace[];
}

export interface ProfilingExtension {
  start(options?: ProfilingStartOptions): void;
  stop(): ProfilingData;
  enterContext(context: any, traceId: string, spanId: string): void;
  exitContext(context: any): void;
}

export interface ProfilingOptions {
  enabled: boolean;
  serviceName: string;
  endpoint: string;
  callstackInterval: number;
  collectionDuration: number;
  resource: Resource;
  debugExport: boolean;
}

export interface ProfilingExporter {
  send(profile: ProfilingData): void;
}
