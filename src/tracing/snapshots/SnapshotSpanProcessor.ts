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

import { propagation, trace, Context } from '@opentelemetry/api';
import { ReadableSpan, Span } from '@opentelemetry/sdk-trace-base';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

export type TraceIdCallback = (traceId: string) => void;
// Returns whether a snapshot was actually begun. False when snapshot profiling
// is inactive, so the processor can skip recording/stamping the span and keep
// begin/end symmetric.
export type TraceSnapshotBeginCallback = (traceId: string) => boolean;

export interface SnapshotSpanProcessorOptions {
  traceSnapshotBegin: TraceSnapshotBeginCallback;
  traceSnapshotEnd: TraceIdCallback;
}

function shouldProcessContext(context: Context): boolean {
  const parentSpan = trace.getSpan(context);
  return parentSpan === undefined || parentSpan.spanContext().isRemote === true;
}

export class SnapshotSpanProcessor implements SpanProcessor {
  traceSnapshotBegin: TraceSnapshotBeginCallback;
  traceSnapshotEnd: TraceIdCallback;
  // Mapping of span ID to trace ID.
  // We can't reconstruct the parent span context in processors onEnd,
  // so we store the trace ID for the span that started the snapshot.
  snapshotSpans = new Map<string, string>();

  constructor(options: SnapshotSpanProcessorOptions) {
    this.traceSnapshotBegin = options.traceSnapshotBegin;
    this.traceSnapshotEnd = options.traceSnapshotEnd;
  }

  onStart(span: Span, parentContext: Context): void {
    if (!shouldProcessContext(parentContext)) {
      return;
    }

    const baggage = propagation.getBaggage(parentContext);
    if (baggage === undefined) {
      return;
    }

    const volumeFromBaggage = baggage.getEntry(
      'splunk.trace.snapshot.volume'
    )?.value;

    if (volumeFromBaggage === 'highest') {
      const spanCtx = span.spanContext();
      // Only record and stamp the span if a snapshot actually began. When
      // snapshot profiling is inactive the begin is a no-op, and recording it
      // would leave a stale entry that fires an unbalanced traceSnapshotEnd.
      const began = this.traceSnapshotBegin(spanCtx.traceId);
      if (began) {
        span.setAttribute('splunk.snapshot.profiling', true);
        this.snapshotSpans.set(spanCtx.spanId, spanCtx.traceId);
      }
    }
  }

  onEnd(span: ReadableSpan): void {
    const spanId = span.spanContext().spanId;
    const traceId = this.snapshotSpans.get(spanId);

    if (traceId === undefined) {
      return;
    }

    this.traceSnapshotEnd(traceId);
    this.snapshotSpans.delete(spanId);
  }

  // Drops the in-flight span->trace mappings. Called when snapshot profiling is
  // turned off so spans that started while active do not later (on onEnd) fire
  // an unbalanced traceSnapshotEnd against a profiler that has been reset.
  // Returns the distinct trace IDs that were in flight so the caller can remove
  // their native trace-id filters (otherwise those entries leak, since the
  // matching traceSnapshotEnd -> removeTraceIdFilter will never run).
  clearActiveSnapshots(): string[] {
    const traceIds = new Set(this.snapshotSpans.values());
    this.snapshotSpans.clear();
    return [...traceIds];
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
