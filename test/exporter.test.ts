/*
 * Copyright 2021 Splunk Inc.
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
import * as sinon from 'sinon';
import {
  Span,
  SimpleSpanProcessor,
  BasicTracerProvider,
} from '@opentelemetry/tracing';
const {
  trace,
  SpanKind,
  ROOT_CONTEXT,
  TraceFlags,
} = require('@opentelemetry/api');
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { ThriftSpan } from '@opentelemetry/exporter-jaeger/build/src/types';

import { _patchJaeger } from '../src/jaeger';

describe('exporter', () => {
  const maxAttrLength = 3;
  _patchJaeger(maxAttrLength);

  const jaegerFlushMock = sinon.stub(JaegerExporter.prototype, '_append');
  const provider = new BasicTracerProvider({ traceParams: {} });
  provider.addSpanProcessor(
    new SimpleSpanProcessor(new JaegerExporter({ serviceName: 'test-service' }))
  );

  const tracer = provider.getTracer('default');

  afterEach(() => {
    jaegerFlushMock.reset();
    jaegerFlushMock.restore();
  });

  it('jaeger truncates tag values', done => {
    jaegerFlushMock.callsFake((span: ThriftSpan) => {
      try {
        const tagsByKey = span.tags.reduce((tags, tag) => {
          tags[tag.key] = tag;
          return tags;
        }, {});

        // string values is truncated
        assert.strictEqual(tagsByKey['k1'].vStr, 'v1');
        assert.strictEqual(tagsByKey['k2'].vStr, 'vvv');

        // other values are left as is
        assert.strictEqual(tagsByKey['k3'].vBool, true);
        assert.strictEqual(tagsByKey['k4'].vDouble, 42);
        assert.strictEqual(tagsByKey['k5'].vDouble, 4.2);
        done();
      } catch (err) {
        done(err);
      }
    });

    const span = new Span(
      tracer,
      ROOT_CONTEXT,
      'span1',
      {
        traceId: 'd4cda95b652f4a1592b449d5929fda1b',
        spanId: '6e0c63257de34c92',
        traceFlags: TraceFlags.SAMPLED,
      },
      SpanKind.CLIENT
    );
    span.setAttribute('k1', 'v1');
    span.setAttribute('k2', 'vvvvvvvvvvvvvvvvvvvvvvvvvvvvv');
    span.setAttribute('k3', true);
    span.setAttribute('k4', 42);
    span.setAttribute('k5', 4.2);
    span.end();
  }).timeout(3000);
});
