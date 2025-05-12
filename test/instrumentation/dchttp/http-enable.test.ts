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
import * as assert from 'assert';
import {
  SpanStatusCode,
  context,
  diag,
  propagation,
  Span as ISpan,
  SpanKind,
  trace,
  Attributes,
  DiagConsoleLogger,
} from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { ContextManager } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
  ATTR_CLIENT_ADDRESS,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_NAME,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
  HTTP_REQUEST_METHOD_VALUE_GET,
} from '@opentelemetry/semantic-conventions';
import type {
  ClientRequest,
  IncomingMessage,
  ServerResponse,
  RequestOptions,
} from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import { HttpDcInstrumentation } from '../../../src/instrumentations/dchttp/dchttp';
import { isWrapped } from '@opentelemetry/instrumentation';

const instrumentation = new HttpDcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import { assertSpan } from './utils/assertSpan';
import { DummyPropagation } from './utils/DummyPropagation';
import { httpRequest } from './utils/utils';

let server: http.Server;
const serverPort = 22346;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
instrumentation.setTracerProvider(provider);

export const customAttributeFunction = (span: ISpan): void => {
  span.setAttribute('span kind', SpanKind.CLIENT);
};

export const requestHookFunction = (
  span: ISpan,
  _request: ClientRequest | IncomingMessage
): void => {
  span.setAttribute('custom request hook attribute', 'request');
};

export const responseHookFunction = (
  span: ISpan,
  response: IncomingMessage | ServerResponse
): void => {
  span.setAttribute('custom response hook attribute', 'response');
  // IncomingMessage (Readable) 'end'.
  response.on('end', () => {
    span.setAttribute('custom incoming message attribute', 'end');
  });
  // ServerResponse (writable) 'finish'.
  response.on('finish', () => {
    span.setAttribute('custom server response attribute', 'finish');
  });
};

export const startIncomingSpanHookFunction = (
  request: IncomingMessage
): Attributes => {
  return { guid: request.headers?.guid };
};

export const startOutgoingSpanHookFunction = (
  request: RequestOptions
): Attributes => {
  return { guid: request.headers?.guid };
};

describe('HttpInstrumentation', () => {
  let contextManager: ContextManager;

  before(() => {
    propagation.setGlobalPropagator(new DummyPropagation());
  });

  after(() => {
    propagation.disable();
  });

  beforeEach(() => {
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
  });

  afterEach(() => {
    context.disable();
  });

  describe('with good instrumentation options', () => {
    beforeEach(() => {
      memoryExporter.reset();
    });

    before(async () => {
      instrumentation.setConfig({
        ignoreIncomingRequestHook: (request) => {
          return request.headers['user-agent']?.match('ignored-string') != null;
        },
        ignoreOutgoingRequestHook: (request) => {
          if (request.headers?.['user-agent'] != null) {
            return (
              `${request.headers['user-agent']}`.match('ignored-string') != null
            );
          }
          return false;
        },
        applyCustomAttributesOnSpan: customAttributeFunction,
        requestHook: requestHookFunction,
        responseHook: responseHookFunction,
        startIncomingSpanHook: startIncomingSpanHookFunction,
        startOutgoingSpanHook: startOutgoingSpanHookFunction,
      });
      instrumentation.enable();
      server = http.createServer((request, response) => {
        if (request.url?.includes('/premature-close')) {
          response.destroy();
          return;
        }
        if (request.url?.includes('/hang')) {
          // write response headers.
          response.write('');
          // hang the request.
          return;
        }
        if (request.url?.includes('/destroy-request')) {
          // force flush http response header to trigger client response callback
          response.write('');
          setTimeout(() => {
            request.socket.destroy();
          }, 100);
          return;
        }
        if (request.url?.includes('/ignored')) {
          provider.getTracer('test').startSpan('some-span').end();
        }
        if (request.url?.includes('/setroute')) {
          const rpcData = getRPCMetadata(context.active());
          assert.ok(rpcData != null);
          assert.strictEqual(rpcData.type, RPCType.HTTP);
          assert.strictEqual(rpcData.route, undefined);
          rpcData.route = 'TheRoute';
        }
        response.end('Test Server Response');
      });

      await new Promise<void>((resolve) => server.listen(serverPort, resolve));
    });

    after(() => {
      server.close();
      instrumentation.disable();
    });

    it(`${protocol} module should be patched`, () => {
      assert.strictEqual(isWrapped(http.Server.prototype.emit), true);
    });

    it('should generate valid spans (client side and server side)', async () => {
      const result = await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`,
        {
          headers: {
            'x-forwarded-for': '<client>, <proxy1>, <proxy2>',
            'user-agent': 'chrome',
          },
        }
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, outgoingSpan] = spans;
      const validations = {
        hostname,
        httpStatusCode: result.statusCode!,
        httpMethod: result.method!,
        pathname,
        resHeaders: result.resHeaders,
        reqHeaders: result.reqHeaders,
        component: 'http',
      };

      assert.strictEqual(spans.length, 2);
      assert.strictEqual(
        incomingSpan.attributes[ATTR_CLIENT_ADDRESS],
        '<client>'
      );
      assert.strictEqual(incomingSpan.attributes[ATTR_SERVER_PORT], serverPort);
      assert.strictEqual(outgoingSpan.attributes[ATTR_SERVER_PORT], serverPort);
      [
        { span: incomingSpan, kind: SpanKind.SERVER },
        { span: outgoingSpan, kind: SpanKind.CLIENT },
      ].forEach(({ span, kind }) => {
        assert.ok(
          !span.attributes[ATTR_NETWORK_PROTOCOL_NAME],
          'should not be added for HTTP kind'
        );
        assertSpan(span, kind, validations);
      });
    });
  });
});
