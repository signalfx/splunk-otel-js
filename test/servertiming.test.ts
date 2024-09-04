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

import { strict as assert } from 'assert';
import { beforeEach, describe, it, afterEach } from 'node:test';

import { context, trace } from '@opentelemetry/api';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { parseOptionsAndConfigureInstrumentations } from '../src/instrumentations';
import { startTracing, stopTracing } from '../src/tracing';
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
  afterEach(async () => {
    console.log('closing server');
    // if (server) {
    //   // Await server closing to ensure it's fully stopped
    //   await new Promise<void>((resolve, reject) => {
    //     server.close((err) => {
    //       if (err) reject(err);
    //       else resolve();
    //     });
    //   });
    // }
    server.close();
    stopTracing();
  });

  async function testHeadersAdded() {
    let spanContext;
    const http = require('http');
    server = http.createServer((req, res) => {
      spanContext = trace.getSpanContext(context.active());
      console.log('got request', spanContext);
      res.end('ok');
    });
    server.listen(PORT);
    // await new Promise((resolve) => server.listen(PORT, resolve));

    await new Promise<void>((resolve) => {
      http.get(SERVER_URL, (res) => {
        console.log('got response', spanContext);
        assertHeaders(spanContext, res);
        resolve();
      });
    });
  }

  it('injects server timing by default', async () => {
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
    startTracing(tracingOptions);
    await testHeadersAdded();
    console.log('test 1 done');
  });

  it('can be enabled via environment variables', async () => {
    process.env.SPLUNK_TRACE_RESPONSE_HEADER_ENABLED = 'true';
    const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
    startTracing(tracingOptions);
    // await new Promise((resolve) => setTimeout(resolve, 500));
    await testHeadersAdded();
    console.log('test 2 done');
  });

  // it('injects server timing header with current context', async () => {
  //   const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
  //     tracing: { serverTimingEnabled: true },
  //   });
  //   startTracing(tracingOptions);
  //   await testHeadersAdded();
  // });

  // it('works with user provided http instrumentation config', async () => {
  //   const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
  //     tracing: {
  //       serverTimingEnabled: true,
  //       instrumentations: [new HttpInstrumentation({})],
  //     },
  //   });
  //   startTracing(tracingOptions);
  //   await testHeadersAdded();
  // });

  // it('leaves user hooks unchanged', async () => {
  //   let userHookCalled = false;
  //   const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
  //     tracing: {
  //       serverTimingEnabled: true,
  //       instrumentations: [
  //         new HttpInstrumentation({
  //           responseHook: (span, response) => {
  //             userHookCalled = true;
  //           },
  //         }),
  //       ],
  //     },
  //   });
  //   startTracing(tracingOptions);

  //   const http = require('http');
  //   let spanContext;

  //   server = http.createServer((req, res) => {
  //     spanContext = trace.getSpanContext(context.active());
  //     res.end('ok');
  //   });

  //   server.listen(PORT);

  //   await new Promise<void>((resolve) => {
  //     http.get(SERVER_URL, (res) => {
  //       assertHeaders(spanContext, res);
  //       assert.ok(userHookCalled);
  //       resolve();
  //     });
  //   });
  // });
});
