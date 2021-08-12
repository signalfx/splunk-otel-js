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
import * as sinon from 'sinon';
import { context, trace } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { startTracing } from '../src/tracing';
import * as utils from './utils';

const PORT = 9111;
const SERVER_URL = `http://localhost:${PORT}`;

function assertHeaders(spanContext, response) {
  const { traceId, spanId } = spanContext;
  assert.strictEqual(
    'Server-Timing',
    response.headers['access-control-expose-headers']
  );
  assert.strictEqual(
    `traceparent;desc="00-${traceId}-${spanId}-01"`,
    response.headers['server-timing']
  );
}

describe('servertiming', () => {
  let server;

  beforeEach(utils.cleanEnvironment);
  afterEach(() => {
    server.close();
  });

  function testHeadersAdded(done) {
    let spanContext;
    const http = require('http');
    server = http.createServer((req, res) => {
      spanContext = trace.getSpanContext(context.active());
      res.end('ok');
    });
    server.listen(PORT);
    http.get(SERVER_URL, res => {
      assertHeaders(spanContext, res);
      done();
    });
  }

  it('injects server timing by default', done => {
    startTracing({});
    testHeadersAdded(done);
  });

  it('can be enabled via environment variables', done => {
    process.env.SPLUNK_TRACE_RESPONSE_HEADER_ENABLED = 'true';
    startTracing({});
    testHeadersAdded(() => {
      done();
    });
  });

  it('injects server timing header with current context', done => {
    startTracing({ serverTimingEnabled: true });
    testHeadersAdded(done);
  });

  it('works with user provided http instrumentation config', done => {
    startTracing({
      serverTimingEnabled: true,
      instrumentations: [new HttpInstrumentation({})],
    });

    testHeadersAdded(done);
  });

  it('leaves user hooks unchanged', done => {
    let userHookCalled = false;

    startTracing({
      serverTimingEnabled: true,
      instrumentations: [
        new HttpInstrumentation({
          responseHook: (span, response) => {
            userHookCalled = true;
          },
        }),
      ],
    });

    const http = require('http');
    let spanContext;
    server = http.createServer((req, res) => {
      spanContext = trace.getSpanContext(context.active());
      res.end('ok');
    });
    server.listen(PORT);
    http.get(SERVER_URL, res => {
      assertHeaders(spanContext, res);
      assert.ok(userHookCalled);
      done();
    });
  });
});
