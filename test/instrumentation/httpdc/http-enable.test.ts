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
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
  HTTP_REQUEST_METHOD_VALUE_GET,
  NETTRANSPORTVALUES_IP_TCP,
  SEMATTRS_HTTP_CLIENT_IP,
  SEMATTRS_HTTP_FLAVOR,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_ROUTE,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_URL,
  SEMATTRS_NET_HOST_IP,
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_NET_HOST_PORT,
  SEMATTRS_NET_PEER_IP,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';
import type { ClientRequest, IncomingMessage, ServerResponse } from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import { HTTP_STATUS_TEXT } from '../../../src/instrumentations/httpdc/semconv';
import { HttpDcInstrumentation } from '../../../src/instrumentations/httpdc/httpdc';
import { isWrapped, SemconvStability } from '@opentelemetry/instrumentation';

const instrumentation = new HttpDcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import { assertSpan } from './utils/assertSpan';
import { DummyPropagation } from './utils/DummyPropagation';
import {
  httpRequest,
  isSupported,
  spanByKind,
  spanByName,
} from './utils/utils';
import { getRemoteClientAddress } from '../../../src/instrumentations/httpdc/utils';

let server: http.Server;
const serverPort = 22346;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const serverName = 'my.server.name';
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
  request: ClientRequest
): Attributes => {
  return { guid: request.getHeader('guid') };
};

describe('HttpInstrumentation', { skip: !isSupported() }, () => {
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

    before((_ctx, done) => {
      instrumentation.setConfig({
        ignoreIncomingRequestHook: (request) => {
          return !!request.headers['user-agent']?.match('ignored-string');
        },
        ignoreOutgoingRequestHook: (request) => {
          const header = request.getHeader('user-agent');
          if (header !== undefined) {
            return String(header).match('ignored-string') !== null;
          }
          return false;
        },
        applyCustomAttributesOnSpan: customAttributeFunction,
        requestHook: requestHookFunction,
        responseHook: responseHookFunction,
        startIncomingSpanHook: startIncomingSpanHookFunction,
        startOutgoingSpanHook: startOutgoingSpanHookFunction,
        serverName,
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
        if (request.url?.includes('/withStatusCode')) {
          const parts = request.url?.split('/').filter((p) => p) || [];
          const status = parts[parts.length - 1] || '200';
          const statusCode = Number(status);
          response.statusCode = statusCode;
          response.end(status);
          return;
        }
        if (request.url?.includes('/withDelay')) {
          const parts = request.url?.split('/').filter((s) => s) || [];
          const delay = Number(parts[parts.length - 1] || '100');
          response.write('abc');
          setTimeout(() => {
            response.end('ok');
          }, delay);
          return;
        }
        if (request.url?.includes('/ignored')) {
          provider.getTracer('test').startSpan('some-span').end();
        }
        if (request.url?.includes('/setroute')) {
          const rpcData = getRPCMetadata(context.active());
          assert.ok(rpcData);
          assert.strictEqual(rpcData.type, RPCType.HTTP);
          assert.strictEqual(rpcData.route, undefined);
          rpcData.route = 'TheRoute';
        }
        if (request.url?.includes('/login')) {
          assert.strictEqual(
            request.headers.authorization,
            'Basic ' + Buffer.from('username:password').toString('base64')
          );
        }
        if (request.url?.includes('/withQuery')) {
          assert.match(request.url, /withQuery\?foo=bar$/);
        }
        response.end('Test Server Response');
      });

      server.listen(serverPort, done);
    });

    after((_ctx, done) => {
      server.close(done);
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

    it('should respect HTTP_ROUTE', async () => {
      await httpRequest.get(`${protocol}://${hostname}:${serverPort}/setroute`);
      const span = memoryExporter.getFinishedSpans()[0];

      assert.strictEqual(span.kind, SpanKind.SERVER);
      assert.strictEqual(span.attributes[SEMATTRS_HTTP_ROUTE], 'TheRoute');
      assert.strictEqual(span.name, 'GET TheRoute');
    });

    const httpErrorCodes = [
      400, 401, 403, 404, 429, 501, 503, 504, 500, 505, 597,
    ];

    for (let i = 0; i < httpErrorCodes.length; i++) {
      it(`should test span for GET requests with http error ${httpErrorCodes[i]}`, async () => {
        const testPath = `/withStatusCode/${httpErrorCodes[i]}`;

        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${testPath}`
        );

        const spans = memoryExporter.getFinishedSpans();

        assert.strictEqual(result.data, httpErrorCodes[i].toString());
        assert.strictEqual(spans.length, 2);

        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: 'GET',
          pathname: testPath,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: 'http',
        };

        const clientSpan = spans.find((span) => span.kind === SpanKind.CLIENT);
        assert.ok(clientSpan);
        assertSpan(clientSpan, SpanKind.CLIENT, validations);
      });
    }

    it('should create a child span for GET requests', async () => {
      const testPath = '/outgoing/rootSpan/childs/1';
      const name = 'TestRootSpan';
      const span = provider.getTracer('default').startSpan(name);
      return context.with(trace.setSpan(context.active(), span), async () => {
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${testPath}`
        );
        span.end();
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 3);
        const reqSpan = spanByKind(SpanKind.CLIENT, spans);
        const localSpan = spanByName(name, spans);
        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: 'GET',
          pathname: testPath,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: 'http',
        };

        assert.ok(localSpan.name.indexOf('TestRootSpan') >= 0);
        assert.strictEqual(reqSpan.name, 'GET');
        assert.strictEqual(
          localSpan.spanContext().traceId,
          reqSpan.spanContext().traceId
        );
        assertSpan(reqSpan, SpanKind.CLIENT, validations);
        assert.notStrictEqual(
          localSpan.spanContext().spanId,
          reqSpan.spanContext().spanId
        );
      });
    });

    for (let i = 0; i < httpErrorCodes.length; i++) {
      it(`should test child spans for GET requests with http error ${httpErrorCodes[i]}`, async () => {
        const testPath = `/withStatusCode/${httpErrorCodes[i]}`;
        const name = 'TestRootSpan';
        const span = provider.getTracer('default').startSpan(name);
        return context.with(trace.setSpan(context.active(), span), async () => {
          const result = await httpRequest.get(
            `${protocol}://${hostname}:${serverPort}${testPath}`
          );
          span.end();
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 3);
          const localSpan = spanByName(name, spans);
          const reqSpan = spanByKind(SpanKind.CLIENT, spans);
          const validations = {
            hostname,
            httpStatusCode: result.statusCode!,
            httpMethod: 'GET',
            pathname: testPath,
            resHeaders: result.resHeaders,
            reqHeaders: result.reqHeaders,
            component: 'http',
          };

          assert.ok(localSpan.name.indexOf('TestRootSpan') >= 0);
          assert.strictEqual(reqSpan.name, 'GET');
          assert.strictEqual(
            localSpan.spanContext().traceId,
            reqSpan.spanContext().traceId
          );
          assertSpan(reqSpan, SpanKind.CLIENT, validations);
          assert.notStrictEqual(
            localSpan.spanContext().spanId,
            reqSpan.spanContext().spanId
          );
        });
      });
    }

    it('should create multiple child spans for GET requests', async () => {
      const testPath = '/outgoing/rootSpan/childs';
      const name = 'TestRootSpan';
      const span = provider.getTracer('default').startSpan(name);
      await context.with(trace.setSpan(context.active(), span), async () => {
        for (let i = 0; i < 5; i++) {
          await httpRequest.get(
            `${protocol}://${hostname}:${serverPort}${testPath}`
          );
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans[i].name, 'GET');
          assert.strictEqual(
            span.spanContext().traceId,
            spans[i].spanContext().traceId
          );
        }
        span.end();
        const spans = memoryExporter.getFinishedSpans();
        // 5 server spans + 5 child spans + 1 span (root)
        assert.strictEqual(spans.length, 11);
      });
    });

    it('should not trace ignored requests when ignore hook returns true', async () => {
      const testValue = 'ignored-string';

      await Promise.all([
        httpRequest.get(`${protocol}://${hostname}:${serverPort}`, {
          headers: {
            'user-agent': testValue,
          },
        }),
      ]);
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);
    });

    it('should trace requests when ignore hook returns false', async () => {
      await httpRequest.get(`${protocol}://${hostname}:${serverPort}`, {
        headers: {
          'user-agent': 'test-bot',
        },
      });
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
    });

    // NOTE: Differs from the upstream test
    // With datachannels we don't have access to the original arguments.
    // We receive http.client.request.created and then http.client.request.error
    for (const arg of [{}, new Date(), true, 1, false, 0]) {
      it(`should be traceable and not throw exception in ${protocol} instrumentation when passing the following argument ${JSON.stringify(
        arg
      )}`, async () => {
        try {
          await httpRequest.get(arg);
        } catch (error) {
          // request has been made
          assert.ok(error instanceof Error);
        }
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 1);
      });
    }

    for (const arg of ['']) {
      it(`should not throw exception in ${protocol} instrumentation when passing the following argument ${JSON.stringify(
        arg
      )}`, async () => {
        try {
          await httpRequest.get(arg as any);
        } catch (error) {
          // request has not been made
          assert(error instanceof Error);
        }
        const spans = memoryExporter.getFinishedSpans();
        // for this arg with don't provide trace. We pass arg to original method (http.get)
        assert.strictEqual(spans.length, 0);
      });
    }

    // NOTE: This differs from the upstream test
    // No http.client.request.created event is received
    it('should have no ended spans when request throw on bad "options" object', () => {
      assert.throws(
        () => http.request({ headers: { cookie: undefined } }),
        (err: unknown) => {
          assert.ok(err instanceof Error);
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 0);
          return true;
        }
      );
    });

    it('should have 1 ended client span when response.end throw an exception', async () => {
      const testPath = '/withStatusCode/400';

      const promiseRequest = new Promise((_resolve, reject) => {
        const req = http.request(
          `${protocol}://${hostname}:${serverPort}${testPath}`,
          (resp: http.IncomingMessage) => {
            let data = '';
            resp.on('data', (chunk) => {
              data += chunk;
            });
            resp.on('end', () => {
              reject(new Error(data));
            });
          }
        );
        return req.end();
      });

      try {
        await promiseRequest;
        assert.fail();
      } catch (error) {
        const spans = memoryExporter.getFinishedSpans();
        assert.strictEqual(spans.length, 2);
        const clientSpan = spanByKind(SpanKind.CLIENT, spans);
        assert.ok(clientSpan);
      }
    });

    // NOTE: This passes alone, but hangs with other tests.
    it.skip('should have 1 ended span when request is aborted', async () => {
      const testPath = '/withDelay/100';

      const promiseRequest = new Promise((resolve, reject) => {
        const req = http.request(
          `${protocol}://${hostname}:${serverPort}${testPath}`,
          (resp: http.IncomingMessage) => {
            let data = '';
            resp.on('data', (chunk) => {
              data += chunk;
            });
            resp.on('end', () => {
              resolve(data);
            });
          }
        );
        req.setTimeout(10, () => {
          req.destroy();
        });
        // Instrumentation should not swallow error event.
        assert.strictEqual(req.listeners('error').length, 0);
        req.on('error', (err) => {
          reject(err);
        });
        return req.end();
      });

      await assert.rejects(promiseRequest, /Error: socket hang up/);
      const spans = memoryExporter.getFinishedSpans();
      const [span] = spans;
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
      assert.ok(Object.keys(span.attributes).length >= 6);
    });

    it('should have 1 ended span when request is aborted after receiving response', async () => {
      const testPath = '/withDelay/100';
      const promiseRequest = new Promise((resolve, reject) => {
        const req = http.request(
          `${protocol}://${hostname}:${serverPort}${testPath}`,
          (resp: http.IncomingMessage) => {
            let data = '';
            resp.on('data', (chunk) => {
              // NOTE: With datachannels the order of events is:
              // * http.client.response.finished
              // * http.client.request.error
              // The response event ends the span, so this error is not actually visible.
              req.destroy(new Error('request destroyed'));
              data += chunk;
            });
            resp.on('end', () => {
              resolve(data);
            });
          }
        );
        // Instrumentation should not swallow error event.
        assert.strictEqual(req.listeners('error').length, 0);
        req.on('error', (err) => {
          reject(err);
        });

        return req.end();
      });

      await assert.rejects(promiseRequest, /Error: request destroyed/);
      const spans = memoryExporter.getFinishedSpans();
      const [span] = spans;
      assert.strictEqual(spans.length, 1);
      // NOTE: Differs from upstream (UNSET instead of ERROR) due to the comment above.
      assert.strictEqual(span.status.code, SpanStatusCode.UNSET);
      assert.ok(Object.keys(span.attributes).length > 7);
    });

    it("should have 1 ended client span when request doesn't listening response", (_ctx, done) => {
      const req = http.request(`${protocol}://${hostname}:${serverPort}/`);
      req.on('close', () => {
        const spans = memoryExporter
          .getFinishedSpans()
          .filter((it) => it.kind === SpanKind.CLIENT);
        assert.strictEqual(spans.length, 1);
        const [span] = spans;
        assert.ok(Object.keys(span.attributes).length > 6);
        done();
      });
      req.end();
    });

    it("should have 1 ended span when response is listened by using req.on('response')", (_ctx, done) => {
      const host = `${protocol}://${hostname}:${serverPort}/withStatusCode/404`;
      const req = http.request(`${host}/`);
      req.on('response', (response) => {
        response.on('data', () => {});
        response.on('end', () => {
          const spans = memoryExporter.getFinishedSpans();
          assert.strictEqual(spans.length, 2);
          const span = spanByKind(SpanKind.CLIENT, spans);
          assert.ok(Object.keys(span.attributes).length > 6);
          assert.strictEqual(span.attributes[SEMATTRS_HTTP_STATUS_CODE], 404);
          assert.strictEqual(span.status.code, SpanStatusCode.ERROR);
          done();
        });
      });
      req.end();
    });

    it('custom attributes should show up on client and server spans', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`,
        { headers: { guid: 'user_guid' } }
      );
      const spans = memoryExporter.getFinishedSpans();
      const incomingSpan = spanByKind(SpanKind.SERVER, spans);
      const outgoingSpan = spanByKind(SpanKind.CLIENT, spans);

      // server request
      assert.strictEqual(
        incomingSpan.attributes['custom request hook attribute'],
        'request'
      );
      assert.strictEqual(
        incomingSpan.attributes['custom response hook attribute'],
        'response'
      );
      assert.strictEqual(
        incomingSpan.attributes['custom server response attribute'],
        'finish'
      );
      assert.strictEqual(incomingSpan.attributes['guid'], 'user_guid');
      assert.strictEqual(incomingSpan.attributes['span kind'], SpanKind.CLIENT);

      // client request
      assert.strictEqual(
        outgoingSpan.attributes['custom request hook attribute'],
        'request'
      );
      assert.strictEqual(
        outgoingSpan.attributes['custom response hook attribute'],
        'response'
      );

      // NOTE: Client receives the response finished event, attaching
      // 'end' listeners won't work.
      /*
      assert.strictEqual(
        outgoingSpan.attributes['custom incoming message attribute'],
        'end'
      );
      */

      assert.strictEqual(outgoingSpan.attributes['guid'], 'user_guid');
      assert.strictEqual(outgoingSpan.attributes['span kind'], SpanKind.CLIENT);
    });

    it('should not set span as active in context for outgoing request', (_ctx, done) => {
      assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
      http.get(`${protocol}://${hostname}:${serverPort}/test`, (res) => {
        assert.deepStrictEqual(trace.getSpan(context.active()), undefined);

        res.on('data', () => {
          assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
        });

        res.on('end', () => {
          assert.deepStrictEqual(trace.getSpan(context.active()), undefined);
          done();
        });
      });
    });

    it('should have 2 ended span when client prematurely close', async () => {
      const promise = new Promise<void>((resolve) => {
        const req = http.get(
          `${protocol}://${hostname}:${serverPort}/hang`,
          (res) => {
            res.on('close', () => {});
            res.on('error', () => {});
          }
        );
        // close the socket.
        setTimeout(() => {
          req.destroy();
        }, 10);

        req.on('error', () => {});

        req.on('close', () => {
          // yield to server to end the span.
          setTimeout(resolve, 10);
        });
      });

      await promise;

      const spans = memoryExporter.getFinishedSpans();
      // NOTE: Original implementation produced 2 spans,
      // but with datachannels the response is not finished quick enough.
      assert.strictEqual(spans.length, 1);
      const [clientSpan] = spans;
      assert.strictEqual(clientSpan.kind, SpanKind.CLIENT);
      assert.ok(Object.keys(clientSpan.attributes).length >= 6);
    });

    it('should not end span multiple times if request socket destroyed before response completes', async () => {
      const warnMessages: string[] = [];
      diag.setLogger({
        ...new DiagConsoleLogger(),
        warn: (message) => {
          warnMessages.push(message);
        },
      });
      const promise = new Promise<void>((resolve) => {
        const req = http.request(
          `${protocol}://${hostname}:${serverPort}/destroy-request`,
          {
            // Allow `req.write()`.
            method: 'POST',
          },
          (res) => {
            res.on('end', () => {});
            res.on('close', () => {
              resolve();
            });
            res.on('error', () => {});
          }
        );
        // force flush http request header to trigger client response callback
        req.write('');
        req.on('error', () => {});
      });

      await promise;

      diag.disable();

      assert.deepStrictEqual(warnMessages, []);
    });

    it('should not throw with cyrillic characters in the request path', async () => {
      // see https://github.com/open-telemetry/opentelemetry-js/issues/5060
      await httpRequest.get(`${protocol}://${hostname}:${serverPort}/привет`);
    });

    it('should keep username and password in the request', async () => {
      await httpRequest.get(
        `${protocol}://username:password@${hostname}:${serverPort}/login`
      );
    });

    it('should keep query in the request', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}/withQuery?foo=bar`
      );
    });

    // NOTE: DC does not emit the client request created event in this case
    it.skip('using an invalid url does throw from client but still creates a span', async () => {
      try {
        await httpRequest.get(`http://instrumentation.test:string-as-port/`);
      } catch (e) {
        assert.match(e.message, /Invalid URL/);
      }

      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 1);
    });
  });

  describe('with semconv stability set to http', () => {
    const PORT = 22347;
    beforeEach(() => {
      memoryExporter.reset();
    });

    before((_ctx, done) => {
      instrumentation.setConfig({ semconvStability: SemconvStability.STABLE });
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
          assert.ok(rpcData);
          assert.strictEqual(rpcData.type, RPCType.HTTP);
          assert.strictEqual(rpcData.route, undefined);
          rpcData.route = 'TheRoute';
        }
        response.setHeader('Content-Type', 'application/json');
        response.end(
          JSON.stringify({ address: getRemoteClientAddress(request) })
        );
      });

      server.listen(PORT, done);
    });

    after((_ctx, done) => {
      server.close(done);
      instrumentation.disable();
    });

    it('should generate semconv 1.27 client spans', async () => {
      const response = await httpRequest.get(
        `${protocol}://${hostname}:${PORT}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;
      assert.strictEqual(spans.length, 2);

      // should have only required and recommended attributes for semconv 1.27
      assert.deepStrictEqual(outgoingSpan.attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_SERVER_PORT]: PORT,
        [ATTR_URL_FULL]: `${protocol}://${hostname}:${PORT}${pathname}`,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PEER_ADDRESS]: response.address,
        [ATTR_NETWORK_PEER_PORT]: PORT,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
      });
    });

    it('should generate semconv 1.27 server spans', async () => {
      const response = await httpRequest.get(
        `${protocol}://${hostname}:${PORT}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, _] = spans;
      assert.strictEqual(spans.length, 2);

      const body = JSON.parse(response.data);

      // should have only required and recommended attributes for semconv 1.27
      assert.deepStrictEqual(incomingSpan.attributes, {
        [ATTR_CLIENT_ADDRESS]: body.address,
        [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_SERVER_PORT]: PORT,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PEER_ADDRESS]: body.address,
        [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_URL_PATH]: pathname,
        [ATTR_URL_SCHEME]: protocol,
      });
    });

    it('should redact auth from the `url.full` attribute (client side and server side)', async () => {
      await httpRequest.get(
        `${protocol}://user:pass@${hostname}:${PORT}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;
      assert.strictEqual(spans.length, 2);
      assert.strictEqual(outgoingSpan.kind, SpanKind.CLIENT);
      assert.strictEqual(
        outgoingSpan.attributes[ATTR_URL_FULL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${PORT}${pathname}`
      );
    });

    it('should generate semconv 1.27 server spans with route when RPC metadata is available', async () => {
      const response = await httpRequest.get(
        `${protocol}://${hostname}:${PORT}${pathname}/setroute`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, _] = spans;
      assert.strictEqual(spans.length, 2);

      const body = JSON.parse(response.data);

      // should have only required and recommended attributes for semconv 1.27
      assert.deepStrictEqual(incomingSpan.attributes, {
        [ATTR_CLIENT_ADDRESS]: body.address,
        [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_HTTP_ROUTE]: 'TheRoute',
        [ATTR_SERVER_PORT]: PORT,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PEER_ADDRESS]: body.address,
        [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_URL_PATH]: `${pathname}/setroute`,
        [ATTR_URL_SCHEME]: protocol,
      });
    });
  });

  describe('with semconv stability set to http/dup', () => {
    beforeEach(() => {
      memoryExporter.reset();
    });

    before((_ctx, done) => {
      instrumentation.setConfig({
        semconvStability: SemconvStability.DUPLICATE,
      });
      instrumentation.enable();
      server = http.createServer((request, response) => {
        if (request.url?.includes('/setroute')) {
          const rpcData = getRPCMetadata(context.active());
          assert.ok(rpcData);
          assert.strictEqual(rpcData.type, RPCType.HTTP);
          assert.strictEqual(rpcData.route, undefined);
          rpcData.route = 'TheRoute';
        }
        response.setHeader('Content-Type', 'application/json');
        response.end(
          JSON.stringify({ address: getRemoteClientAddress(request) })
        );
      });

      server.listen(serverPort, done);
    });

    after((_ctx, done) => {
      server.close(done);
      instrumentation.disable();
    });

    it('should create client spans with semconv 1.27 and old 1.7', async () => {
      const response = await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
      const outgoingSpan = spans[1];

      // should have only required and recommended attributes for semconv 1.27
      assert.deepStrictEqual(outgoingSpan.attributes, {
        // 1.27 attributes
        [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_URL_FULL]: `http://${hostname}:${serverPort}${pathname}`,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PEER_ADDRESS]: response.address,
        [ATTR_NETWORK_PEER_PORT]: serverPort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',

        // 1.7 attributes
        [SEMATTRS_HTTP_FLAVOR]: '1.1',
        [SEMATTRS_HTTP_HOST]: `${hostname}:${serverPort}`,
        [SEMATTRS_HTTP_METHOD]: 'GET',
        [SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED]:
          response.data.length,
        [SEMATTRS_HTTP_STATUS_CODE]: 200,
        [SEMATTRS_HTTP_TARGET]: '/test',
        [SEMATTRS_HTTP_URL]: `http://${hostname}:${serverPort}${pathname}`,
        [SEMATTRS_NET_PEER_IP]: response.address,
        [SEMATTRS_NET_PEER_NAME]: hostname,
        [SEMATTRS_NET_PEER_PORT]: serverPort,
        [SEMATTRS_NET_TRANSPORT]: 'ip_tcp',

        // unspecified old names
        [HTTP_STATUS_TEXT]: 'OK',
      });
    });

    it('should create server spans with semconv 1.27 and old 1.7', async () => {
      const response = await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
      const incomingSpan = spans[0];
      const body = JSON.parse(response.data);

      // should have only required and recommended attributes for semconv 1.27
      assert.deepStrictEqual(incomingSpan.attributes, {
        // 1.27 attributes
        [ATTR_CLIENT_ADDRESS]: body.address,
        [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PEER_ADDRESS]: body.address,
        [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_URL_PATH]: pathname,
        [ATTR_URL_SCHEME]: protocol,

        // 1.7 attributes
        [SEMATTRS_HTTP_FLAVOR]: '1.1',
        [SEMATTRS_HTTP_HOST]: `${hostname}:${serverPort}`,
        [SEMATTRS_HTTP_METHOD]: 'GET',
        [SEMATTRS_HTTP_SCHEME]: protocol,
        [SEMATTRS_HTTP_STATUS_CODE]: 200,
        [SEMATTRS_HTTP_TARGET]: '/test',
        [SEMATTRS_HTTP_URL]: `http://${hostname}:${serverPort}${pathname}`,
        [SEMATTRS_NET_TRANSPORT]: 'ip_tcp',
        [SEMATTRS_NET_HOST_IP]: body.address,
        [SEMATTRS_NET_HOST_NAME]: hostname,
        [SEMATTRS_NET_HOST_PORT]: serverPort,
        [SEMATTRS_NET_PEER_IP]: body.address,
        [SEMATTRS_NET_PEER_PORT]: response.clientRemotePort,

        // unspecified old names
        [HTTP_STATUS_TEXT]: 'OK',
      });
    });

    it('should create server spans with semconv 1.27 and old 1.7 including http.route if RPC metadata is available', async () => {
      const response = await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}/setroute`
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 2);
      const incomingSpan = spans[0];
      const body = JSON.parse(response.data);

      // should have only required and recommended attributes for semconv 1.27
      assert.deepStrictEqual(incomingSpan.attributes, {
        // 1.27 attributes
        [ATTR_CLIENT_ADDRESS]: body.address,
        [ATTR_HTTP_REQUEST_METHOD]: HTTP_REQUEST_METHOD_VALUE_GET,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PEER_ADDRESS]: body.address,
        [ATTR_NETWORK_PEER_PORT]: response.clientRemotePort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_URL_PATH]: `${pathname}/setroute`,
        [ATTR_URL_SCHEME]: protocol,
        [ATTR_HTTP_ROUTE]: 'TheRoute',

        // 1.7 attributes
        [SEMATTRS_HTTP_FLAVOR]: '1.1',
        [SEMATTRS_HTTP_HOST]: `${hostname}:${serverPort}`,
        [SEMATTRS_HTTP_METHOD]: 'GET',
        [SEMATTRS_HTTP_SCHEME]: protocol,
        [SEMATTRS_HTTP_STATUS_CODE]: 200,
        [SEMATTRS_HTTP_TARGET]: `${pathname}/setroute`,
        [SEMATTRS_HTTP_URL]: `http://${hostname}:${serverPort}${pathname}/setroute`,
        [SEMATTRS_NET_TRANSPORT]: 'ip_tcp',
        [SEMATTRS_NET_HOST_IP]: body.address,
        [SEMATTRS_NET_HOST_NAME]: hostname,
        [SEMATTRS_NET_HOST_PORT]: serverPort,
        [SEMATTRS_NET_PEER_IP]: body.address,
        [SEMATTRS_NET_PEER_PORT]: response.clientRemotePort,

        // unspecified old names
        [HTTP_STATUS_TEXT]: 'OK',
      });
    });
  });

  // NOTE: Not implemented
  describe.skip('with require parent span', () => {
    beforeEach((_ctx, done) => {
      memoryExporter.reset();
      instrumentation.setConfig({});
      instrumentation.enable();
      server = http.createServer((_request, response) => {
        response.end('Test Server Response');
      });
      server.listen(serverPort, done);
    });

    afterEach((_ctx, done) => {
      server.close(done);
      instrumentation.disable();
    });

    it('should not trace without parent with options enabled (both client & server)', async () => {
      instrumentation.disable();
      instrumentation.setConfig({
        requireParentforIncomingSpans: true,
        requireParentforOutgoingSpans: true,
      });
      instrumentation.enable();
      const testPath = '/test/test';
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${testPath}`
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 0);
    });

    it('should not trace without parent with options enabled (client only)', async () => {
      instrumentation.disable();
      instrumentation.setConfig({
        requireParentforOutgoingSpans: true,
      });
      instrumentation.enable();
      const testPath = '/test/test';
      const result = await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${testPath}`
      );
      assert.ok(
        result.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY] !== undefined
      );
      assert.ok(
        result.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY] !== undefined
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(
        spans.every((span) => span.kind === SpanKind.SERVER),
        true
      );
    });

    it('should not trace without parent with options enabled (server only)', async () => {
      instrumentation.disable();
      instrumentation.setConfig({
        requireParentforIncomingSpans: true,
      });
      instrumentation.enable();
      const testPath = '/test/test';
      const result = await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${testPath}`
      );
      assert.ok(
        result.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY] !== undefined
      );
      assert.ok(
        result.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY] !== undefined
      );
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(
        spans.every((span) => span.kind === SpanKind.CLIENT),
        true
      );
    });

    it('should trace with parent with both requireParent options enabled', (_ctx, done) => {
      instrumentation.disable();
      instrumentation.setConfig({
        requireParentforIncomingSpans: true,
        requireParentforOutgoingSpans: true,
      });
      instrumentation.enable();
      const testPath = '/test/test';
      const tracer = provider.getTracer('default');
      const span = tracer.startSpan('parentSpan', {
        kind: SpanKind.INTERNAL,
      });
      context.with(trace.setSpan(context.active(), span), () => {
        httpRequest
          .get(`${protocol}://${hostname}:${serverPort}${testPath}`)
          .then((result) => {
            span.end();
            assert.ok(
              result.reqHeaders[DummyPropagation.TRACE_CONTEXT_KEY] !==
                undefined
            );
            assert.ok(
              result.reqHeaders[DummyPropagation.SPAN_CONTEXT_KEY] !== undefined
            );
            const spans = memoryExporter.getFinishedSpans();
            assert.strictEqual(spans.length, 2);
            assert.strictEqual(
              spans.filter((span) => span.kind === SpanKind.CLIENT).length,
              1
            );
            assert.strictEqual(
              spans.filter((span) => span.kind === SpanKind.INTERNAL).length,
              1
            );
            return done();
          })
          .catch(done);
      });
    });
  });

  describe('rpc metadata', () => {
    const PORT = 22348;
    beforeEach(() => {
      memoryExporter.reset();
      instrumentation.setConfig({ requireParentforOutgoingSpans: true });
      instrumentation.enable();
    });

    afterEach((_ctx, done) => {
      server.close(done);
      instrumentation.disable();
    });

    it('should set rpc metadata for incoming http request', async () => {
      server = http.createServer((_request, response) => {
        const rpcMetadata = getRPCMetadata(context.active());
        assert.ok(typeof rpcMetadata !== 'undefined');
        assert.ok(rpcMetadata.type === RPCType.HTTP);
        assert.ok(rpcMetadata.span.setAttribute('key', 'value'));
        response.end('Test Server Response');
      });
      await new Promise<void>((resolve) => server.listen(PORT, resolve));
      await httpRequest.get(`${protocol}://${hostname}:${PORT}`);
      const spans = memoryExporter.getFinishedSpans();
      assert.strictEqual(spans.length, 1);
      const span = spanByKind(SpanKind.SERVER, spans);
      assert.strictEqual(span.attributes.key, 'value');
    });
  });

  describe('capturing headers as span attributes', () => {
    beforeEach(() => {
      memoryExporter.reset();
    });

    before((_ctx, done) => {
      instrumentation.setConfig({
        headersToSpanAttributes: {
          client: {
            requestHeaders: ['X-Client-Header1'],
            responseHeaders: ['X-Server-Header1'],
          },
          server: {
            requestHeaders: ['X-Client-Header2'],
            responseHeaders: ['X-Server-Header2'],
          },
        },
      });
      instrumentation.enable();
      server = http.createServer((_request, response) => {
        response.setHeader('X-ServeR-header1', 'server123');
        response.setHeader('X-Server-header2', '123server');
        response.end('Test Server Response');
      });

      server.listen(serverPort, done);
    });

    after((_ctx, done) => {
      server.close(done);
      instrumentation.disable();
    });

    it('should convert headers to span attributes', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`,
        {
          headers: {
            'X-client-header1': 'client123',
            'X-CLIENT-HEADER2': '123client',
          },
        }
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, outgoingSpan] = spans;

      assert.strictEqual(spans.length, 2);

      assert.deepStrictEqual(
        incomingSpan.attributes['http.request.header.x_client_header2'],
        ['123client']
      );

      assert.deepStrictEqual(
        incomingSpan.attributes['http.response.header.x_server_header2'],
        ['123server']
      );

      assert.strictEqual(
        incomingSpan.attributes['http.request.header.x_client_header1'],
        undefined
      );

      assert.strictEqual(
        incomingSpan.attributes['http.response.header.x_server_header1'],
        undefined
      );

      assert.deepStrictEqual(
        outgoingSpan.attributes['http.request.header.x_client_header1'],
        ['client123']
      );
      assert.deepStrictEqual(
        outgoingSpan.attributes['http.response.header.x_server_header1'],
        ['server123']
      );

      assert.strictEqual(
        outgoingSpan.attributes['http.request.header.x_client_header2'],
        undefined
      );

      assert.strictEqual(
        outgoingSpan.attributes['http.response.header.x_server_header2'],
        undefined
      );
    });
  });

  describe('URL Redaction', () => {
    beforeEach(async () => {
      memoryExporter.reset();
      // a small delay to prevent race conditions
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    before(async () => {
      instrumentation.setConfig({});
      instrumentation.enable();
      server = http.createServer((request, response) => {
        response.end('Test Server Response');
      });
      await new Promise<void>((resolve) => server.listen(serverPort, resolve));
    });

    after(() => {
      server.close();
      instrumentation.disable();
    });

    it('should redact authentication credentials from URLs', async () => {
      await httpRequest.get(
        `${protocol}://user:password@${hostname}:${serverPort}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [incomingSpan, outgoingSpan] = spans;

      assert.strictEqual(spans.length, 2);
      assert.strictEqual(incomingSpan.kind, SpanKind.SERVER);
      assert.strictEqual(outgoingSpan.kind, SpanKind.CLIENT);

      // Server shouldn't see auth in URL
      assert.strictEqual(
        incomingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );

      // Client should have redacted auth
      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}`
      );
    });
    it('should redact default query strings', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=xyz789&normal=value`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=REDACTED&normal=value`
      );
    });

    it('should handle both auth credentials and sensitive default query parameters', async () => {
      await httpRequest.get(
        `${protocol}://username:password@${hostname}:${serverPort}${pathname}?AWSAccessKeyId=secret`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}?AWSAccessKeyId=REDACTED`
      );
    });
    it('should handle URLs with special characters in auth and query', async () => {
      await httpRequest.get(
        `${protocol}://user%40domain:p%40ssword@${hostname}:${serverPort}${pathname}?sig=abc%3Ddef`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}?sig=REDACTED`
      );
    });

    it('should handle malformed query strings', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=value&=nokey&malformed=`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=REDACTED&=nokey&malformed=`
      );
    });
    it('should not modify URLs without auth or sensitive query parameters', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?param=value&another=123`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?param=value&another=123`
      );
    });

    it('should not modify URLs with no query string', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}`
      );
    });

    it('should not modify URLs with empty query parameters', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=&empty=`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=&empty=`
      );
    });

    it('should preserve non-sensitive query parameters when sensitive ones are redacted', async () => {
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?normal=value&Signature=secret&other=data`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?normal=value&Signature=REDACTED&other=data`
      );
    });
    it('should redact only custom query parameters when user provides a populated config', async () => {
      // Set additional parameters while keeping the default ones
      instrumentation.setConfig({
        redactedQueryParams: ['authorize', 'session_id'],
      });

      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=abc123&authorize=xyz789&normal=value`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?sig=abc123&authorize=REDACTED&normal=value`
      );
    });
    it('should not redact query strings when redactedQueryParams is empty', async () => {
      instrumentation.setConfig({
        redactedQueryParams: [],
      });

      // URL with both default sensitive params and custom ones
      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=secret&api_key=12345&normal=value`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?X-Goog-Signature=secret&api_key=12345&normal=value`
      );
    });
    it('should handle case-sensitive query parameter names correctly', async () => {
      instrumentation.setConfig({
        redactedQueryParams: ['TOKEN'],
      });

      await httpRequest.get(
        `${protocol}://${hostname}:${serverPort}${pathname}?token=lowercase&TOKEN=uppercase&sig=secret`
      );
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      // This tests whether parameter name matching is case-sensitive or case-insensitive
      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        `${protocol}://${hostname}:${serverPort}${pathname}?token=lowercase&TOKEN=REDACTED&sig=secret`
      );
    });
    it('should handle very complex URLs with multiple redaction points and if custom query strings are provided only redact those', async () => {
      instrumentation.setConfig({
        redactedQueryParams: ['api_key', 'token'],
      });

      const complexUrl =
        `${protocol}://user:pass@${hostname}:${serverPort}${pathname}?` +
        'sig=abc123&api_key=secret&normal=value&Signature=xyz&' +
        'token=sensitive&X-Goog-Signature=gcp&AWSAccessKeyId=aws';

      await httpRequest.get(complexUrl);
      const spans = memoryExporter.getFinishedSpans();
      const [_, outgoingSpan] = spans;

      const expectedUrl =
        `${protocol}://REDACTED:REDACTED@${hostname}:${serverPort}${pathname}?` +
        'sig=abc123&api_key=REDACTED&normal=value&Signature=xyz&' +
        'token=REDACTED&X-Goog-Signature=gcp&AWSAccessKeyId=aws';

      assert.strictEqual(
        outgoingSpan.attributes[SEMATTRS_HTTP_URL],
        expectedUrl
      );
    });
  });
});
