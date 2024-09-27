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
import { Context } from '@opentelemetry/api';
import { ReadableSpan, Span } from '@opentelemetry/sdk-trace-base';
import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

// Workaround for high cardinality span names in Next.js
// https://github.com/vercel/next.js/issues/54694
export class NextJsSpanProcessor implements SpanProcessor {
  handleRequestSpan?: Span;

  onStart(span: Span, _parentContext: Context): void {
    if (span.attributes['next.span_type'] === 'BaseServer.handleRequest') {
      this.handleRequestSpan = span;

      const queryIndex = this.handleRequestSpan.name.indexOf('?');

      if (queryIndex === -1) {
        return;
      }

      const name = this.handleRequestSpan.name.slice(0, queryIndex);
      this.handleRequestSpan.updateName(name);
      return;
    }

    if (this.handleRequestSpan === undefined) {
      return;
    }

    if (
      span.attributes['next.span_name'] === 'resolve page components' &&
      span.parentSpanId === this.handleRequestSpan.spanContext().spanId &&
      typeof span.attributes['next.route'] === 'string'
    ) {
      const rsc =
        this.handleRequestSpan.attributes['next.rsc'] === true ? 'rsc ' : '';
      const method = this.handleRequestSpan.attributes['http.method'] || '';
      const name = `${rsc}${method} ${span.attributes['next.route']}`;
      this.handleRequestSpan.updateName(name);
    }
  }

  onEnd(span: ReadableSpan): void {
    if (span === this.handleRequestSpan) {
      this.handleRequestSpan = undefined;
    }
  }

  forceFlush(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    return Promise.resolve();
  }
}
