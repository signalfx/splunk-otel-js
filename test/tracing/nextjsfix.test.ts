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

import * as assert from 'assert';

import { trace, context } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NextJsSpanProcessor } from '../../src/tracing/NextJsSpanProcessor';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { describe, it, afterEach } from 'node:test';
import { resourceFromAttributes } from '@opentelemetry/resources';

describe('Next.js span processor', () => {
  const exporter = new InMemorySpanExporter();

  const provider: NodeTracerProvider = new NodeTracerProvider({
    spanProcessors: [
      new NextJsSpanProcessor(),
      new SimpleSpanProcessor(exporter),
    ],
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'nextjs',
    }),
  });

  afterEach(() => {
    exporter.reset();
  });

  it('removes url query parameters if the route is not available', () => {
    const tracer = provider.getTracer('test');
    tracer
      .startSpan('rsc get /blog/23?asdf=foobar&x42=&_rsc=1iwkq', {
        attributes: {
          'next.span_type': 'BaseServer.handleRequest',
        },
      })
      .end();

    const [span] = exporter.getFinishedSpans();
    assert.strictEqual(span.name, 'rsc get /blog/23');
  });

  it('retains the url if no query parameters are present', () => {
    const tracer = provider.getTracer('test');
    tracer
      .startSpan('rsc get /blog/42', {
        attributes: {
          'next.span_type': 'BaseServer.handleRequest',
        },
      })
      .end();

    const [span] = exporter.getFinishedSpans();
    assert.strictEqual(span.name, 'rsc get /blog/42');
  });

  it('fetches the route from a child span', () => {
    const tracer = provider.getTracer('test');
    const span = tracer.startSpan(
      'rsc get /blog/23?asdf=foobar&x42=&_rsc=1iwkq',
      {
        attributes: {
          'next.span_type': 'BaseServer.handleRequest',
          'http.method': 'GET',
          'next.rsc': true,
        },
      }
    );
    const ctx = trace.setSpan(context.active(), span);
    tracer
      .startSpan(
        'resolve page components',
        {
          attributes: {
            'next.span_name': 'resolve page components',
            'next.route': '/blog/[post]',
          },
        },
        ctx
      )
      .end();

    span.end();

    const [_child, parent] = exporter.getFinishedSpans();
    assert.strictEqual(parent.name, 'rsc GET /blog/[post]');
  });

  it('does not modify other types of spans', () => {
    const tracer = provider.getTracer('test');
    tracer
      .startSpan('build component tree', {
        attributes: {
          'next.span_type': 'NextNodeServer.createComponentTree',
        },
      })
      .end();

    const [span] = exporter.getFinishedSpans();
    assert.strictEqual(span.name, 'build component tree');
  });
});
