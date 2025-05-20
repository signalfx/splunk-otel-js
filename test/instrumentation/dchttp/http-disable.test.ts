/*
 * Copyright Splunk Inc., The OpenTelemetry Authors
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
import { after, afterEach, before, describe, it, mock } from 'node:test';
import * as assert from 'assert';
import { HttpDcInstrumentation } from '../../../src/instrumentations/dchttp/dchttp';
import { AddressInfo } from 'net';
import { httpRequest } from './utils/utils';
import { isWrapped } from '@opentelemetry/instrumentation';

const instrumentation = new HttpDcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import {
  trace,
  TracerProvider,
  INVALID_SPAN_CONTEXT,
} from '@opentelemetry/api';

describe('HttpInstrumentation', () => {
  let server: http.Server;
  let serverPort = 0;

  describe('disable()', () => {
    let provider: TracerProvider;
    let startSpanMock: any;

    before((_ctx, done) => {
      provider = {
        getTracer: () => {
          startSpanMock = mock.fn(() =>
            trace.wrapSpanContext(INVALID_SPAN_CONTEXT)
          );
          return { startSpan: startSpanMock } as any;
        },
      };
      instrumentation.enable();
      assert.strictEqual(isWrapped(http.Server.prototype.emit), true);
      instrumentation.setTracerProvider(provider);

      server = http.createServer((_request, response) => {
        response.end('Test Server Response');
      });

      server.listen(serverPort);
      server.once('listening', () => {
        serverPort = (server.address() as AddressInfo).port;
        console.log(serverPort);
        done();
      });
    });

    afterEach(() => {
      mock.restoreAll();
    });

    after((_ctx, done) => {
      server.close(done);
    });

    describe('unpatch()', () => {
      it('should not call provider methods for creating span', async () => {
        instrumentation.disable();
        assert.strictEqual(isWrapped(http.Server.prototype.emit), false);

        const testPath = '/incoming/unpatch/';

        const options = { host: 'localhost', path: testPath, port: serverPort };

        await httpRequest.get(options).then(() => {
          assert.strictEqual(startSpanMock.mock.callCount(), 0);
        });
      });
    });
  });
});
