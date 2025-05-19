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

import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import {
  context,
  propagation,
  Span as ISpan,
  SpanKind,
} from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { ContextManager } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  NETTRANSPORTVALUES_IP_TCP,
  SEMATTRS_HTTP_CLIENT_IP,
  SEMATTRS_HTTP_FLAVOR,
  SEMATTRS_NET_HOST_PORT,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import { HttpDcInstrumentation } from '../../../src/instrumentations/dchttp/dchttp';
import { assertSpan } from './utils/assertSpan';
import { DummyPropagation } from './utils/DummyPropagation';

const instrumentation = new HttpDcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as https from 'https';
import { httpsRequest } from './utils/httpsRequest';
import { spanByKind } from './utils/utils';

const applyCustomAttributesOnSpanErrorMessage =
  'bad applyCustomAttributesOnSpan function';

let server: https.Server;
const serverPort = 32345;
const protocol = 'https';
const hostname = 'localhost';
const serverName = 'my.server.name';
const pathname = '/test';
const memoryExporter = new InMemorySpanExporter();
const provider = new BasicTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
instrumentation.setTracerProvider(provider);
const tracer = provider.getTracer('test-https');

const SERVER_KEY = path.join(__dirname, 'fixtures', 'server-key.pem');
const SERVER_CERT = path.join(__dirname, 'fixtures', 'server-cert.pem');

export const customAttributeFunction = (span: ISpan): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

describe('HttpsInstrumentation', () => {
  let contextManager: ContextManager;

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager().enable();
    propagation.setGlobalPropagator(new DummyPropagation());
    context.setGlobalContextManager(contextManager);
  });

  afterEach(() => {
    contextManager.disable();
    context.disable();
    propagation.disable();
  });

  describe('enable()', () => {
    describe('with bad instrumentation options', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      before((_ctx, done) => {
        instrumentation.setConfig({
          ignoreIncomingRequestHook: (_request) => {
            throw new Error('bad ignoreIncomingRequestHook function');
          },
          ignoreOutgoingRequestHook: (_request) => {
            throw new Error('bad ignoreOutgoingRequestHook function');
          },
          applyCustomAttributesOnSpan: () => {
            throw new Error(applyCustomAttributesOnSpanErrorMessage);
          },
        });
        instrumentation.enable();
        server = https.createServer(
          {
            key: fs.readFileSync(SERVER_KEY),
            cert: fs.readFileSync(SERVER_CERT),
          },
          (_request, response) => {
            response.end('Test Server Response');
          }
        );

        server.listen(serverPort, done);
      });

      after((_ctx, done) => {
        server.close(done);
        instrumentation.disable();
      });

      it('should generate valid spans (client side and server side)', async () => {
        const result = await httpsRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`,
          {
            headers: {
              'user-agent': 'tester',
            },
          }
        );
        const spans = memoryExporter.getFinishedSpans();
        const incomingSpan = spanByKind(SpanKind.SERVER, spans);
        const outgoingSpan = spanByKind(SpanKind.CLIENT, spans);
        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: result.method!,
          pathname,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: 'https',
        };

        assert.strictEqual(spans.length, 2);
        assertSpan(incomingSpan, SpanKind.SERVER, validations);
        assertSpan(outgoingSpan, SpanKind.CLIENT, validations);
        assert.strictEqual(
          incomingSpan.attributes[SEMATTRS_NET_HOST_PORT],
          serverPort
        );
        assert.strictEqual(
          outgoingSpan.attributes[SEMATTRS_NET_PEER_PORT],
          serverPort
        );
      });
    });

    describe('with good instrumentation options', () => {
      const serverPort = 32346;
      beforeEach(() => {
        memoryExporter.reset();
      });

      before((_ctx, done) => {
        instrumentation.setConfig({
          ignoreIncomingRequestHook: (request) => {
            return (
              request.headers['user-agent']?.match('ignored-string') != null
            );
          },
          ignoreOutgoingRequestHook: (request) => {
            if (request.getHeader('user-agent') != null) {
              return (
                `${request.getHeader('user-agent')}`.match('ignored-string') !=
                null
              );
            }
            return false;
          },
          applyCustomAttributesOnSpan: customAttributeFunction,
          serverName,
        });
        instrumentation.enable();
        server = https.createServer(
          {
            key: fs.readFileSync(SERVER_KEY),
            cert: fs.readFileSync(SERVER_CERT),
          },
          (request, response) => {
            if (request.url?.includes('/ignored')) {
              tracer.startSpan('some-span').end();
            }
            response.end('Test Server Response');
          }
        );

        server.listen(serverPort, done);
      });

      after((_ctx, done) => {
        server.close(done);
        instrumentation.disable();
      });

      it('should generate valid spans (client side and server side)', async () => {
        const result = await httpsRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`,
          {
            headers: {
              'x-forwarded-for': '<client>, <proxy1>, <proxy2>',
              'user-agent': 'chrome',
            },
          }
        );
        const spans = memoryExporter.getFinishedSpans();
        const incomingSpan = spanByKind(SpanKind.SERVER, spans);
        const outgoingSpan = spanByKind(SpanKind.CLIENT, spans);
        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: result.method!,
          pathname,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: 'https',
          serverName,
        };

        assert.strictEqual(spans.length, 2);
        assert.strictEqual(
          incomingSpan.attributes[SEMATTRS_HTTP_CLIENT_IP],
          '<client>'
        );
        assert.strictEqual(
          incomingSpan.attributes[SEMATTRS_NET_HOST_PORT],
          serverPort
        );
        assert.strictEqual(
          outgoingSpan.attributes[SEMATTRS_NET_PEER_PORT],
          serverPort
        );

        [
          { span: incomingSpan, kind: SpanKind.SERVER },
          { span: outgoingSpan, kind: SpanKind.CLIENT },
        ].forEach(({ span, kind }) => {
          assert.strictEqual(span.attributes[SEMATTRS_HTTP_FLAVOR], '1.1');
          assert.strictEqual(
            span.attributes[SEMATTRS_NET_TRANSPORT],
            NETTRANSPORTVALUES_IP_TCP
          );
          assertSpan(span, kind, validations);
        });
      });

      // NOTE: With datachannels a lot of the duplicated tests for https are not necessary.
    });
  });
});
