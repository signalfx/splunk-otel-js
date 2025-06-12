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

export interface SnapshotSpanProcessorOptions {
  traceSnapshotBegin: TraceIdCallback;
  traceSnapshotEnd: TraceIdCallback;
}

function shouldProcessContext(context: Context): boolean {
  const parentSpan = trace.getSpan(context);
  return parentSpan === undefined || parentSpan.spanContext().isRemote === true;
}

export class SnapshotSpanProcessor implements SpanProcessor {
  traceSnapshotBegin: TraceIdCallback;
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
      span.setAttribute('splunk.snapshot.profiling', true);
      const spanCtx = span.spanContext();
      this.snapshotSpans.set(spanCtx.spanId, spanCtx.traceId);
      this.traceSnapshotBegin(span.spanContext().traceId);
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

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
