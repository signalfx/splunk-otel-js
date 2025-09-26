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
import { beforeEach, describe, it, TestContext } from 'node:test';
import {
  Attributes,
  SpanStatusCode,
  context,
  Span,
  diag,
} from '@opentelemetry/api';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_REQUEST_METHOD_ORIGINAL,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_USER_AGENT_ORIGINAL,
  NETTRANSPORTVALUES_IP_TCP,
  NETTRANSPORTVALUES_IP_UDP,
  SEMATTRS_HTTP_FLAVOR,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_URL,
  SEMATTRS_NET_PEER_IP,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';
import { IncomingMessage, ServerResponse } from 'http';
import { Socket } from 'net';
import * as url from 'url';
import {
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_USER_AGENT,
} from '@opentelemetry/semantic-conventions';
import {
  ATTR_USER_AGENT_SYNTHETIC_TYPE,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT,
  HTTP_ERROR_NAME,
  HTTP_ERROR_MESSAGE,
  HTTP_STATUS_TEXT,
} from '../../../src/instrumentations/httpdc/semconv';
import * as utils from '../../../src/instrumentations/httpdc/utils';
import { RPCType, setRPCMetadata } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import { SemconvStability } from '@opentelemetry/instrumentation';
import type { ClientRequest } from 'http';

describe('Utility', () => {
  describe('parseResponseStatus()', () => {
    it('should return ERROR code by default', () => {
      const status = utils.parseResponseStatus(400, undefined);
      assert.deepStrictEqual(status, SpanStatusCode.ERROR);
    });

    it('should return UNSET for Success HTTP status code', () => {
      // For client (upperBound = 400), 1xx, 2xx, 3xx should be UNSET
      for (let index = 100; index < 400; index++) {
        const status = utils.parseResponseStatus(400, index);
        assert.deepStrictEqual(status, SpanStatusCode.UNSET);
      }
      // For server (upperBound = 500), 1xx, 2xx, 3xx, 4xx should be UNSET
      for (let index = 100; index < 500; index++) {
        const status = utils.parseResponseStatus(500, index);
        assert.deepStrictEqual(status, SpanStatusCode.UNSET);
      }
    });

    it('should return ERROR for bad status codes', () => {
      // For client, 4xx and above should be ERROR
      for (let index = 400; index <= 600; index++) {
        const status = utils.parseResponseStatus(400, index);
        assert.notStrictEqual(status, SpanStatusCode.UNSET);
      }
      // For server, 5xx and above should be ERROR
      for (let index = 500; index <= 600; index++) {
        const status = utils.parseResponseStatus(500, index);
        assert.notStrictEqual(status, SpanStatusCode.UNSET);
      }
    });
  });

  describe('getAbsoluteUrl()', () => {
    function mockRequest({
      path = '/',
      port = 80,
      protocol = 'http:',
      host = 'localhost',
      authHeader = undefined,
    }: {
      path?: string;
      port?: number;
      protocol?: string;
      host?: string;
      authHeader?: string;
    }): Partial<ClientRequest> {
      return {
        path,
        protocol,
        host,
        getHeader: (name: string) =>
          name.toLowerCase() === 'authorization' ? authHeader : undefined,
        socket: {
          remotePort: port,
        } as Socket,
      };
    }

    it('should return absolute url with localhost', () => {
      const req = mockRequest({ path: '/test/1' });
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(result, 'http://localhost/test/1');
    });

    it('should return absolute url', () => {
      const req = mockRequest({
        path: '/test/1?query=1',
        host: 'www.google',
      });
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(result, 'http://www.google/test/1?query=1');
    });

    it('should return default url', () => {
      const req = mockRequest({});
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(result, 'http://localhost/');
    });

    it("{ path: '/helloworld', port: 8080 } should return http://localhost:8080/helloworld", () => {
      const req = mockRequest({
        path: '/helloworld',
        port: 8080,
      });
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(result, 'http://localhost:8080/helloworld');
    });

    it('should return auth credentials as REDACTED to avoid leaking sensitive information', () => {
      const req = mockRequest({
        path: '/helloworld',
        port: 8080,
        authHeader: 'Basic dXNlcjpwYXNzd29yZA==',
      });
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(
        result,
        'http://REDACTED:REDACTED@localhost:8080/helloworld'
      );
    });

    it('should return auth credentials and particular query strings as REDACTED', () => {
      const req = mockRequest({
        path: '/registers?X-Goog-Signature=secret123',
        port: 8080,
        authHeader: 'Basic dXNlcjpwYXNz',
      });
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(
        result,
        'http://REDACTED:REDACTED@localhost:8080/registers?X-Goog-Signature=REDACTED'
      );
    });

    it('should return particular query strings as REDACTED', () => {
      const req = mockRequest({
        path: '/registers?AWSAccessKeyId=secret123',
        port: 8080,
      });
      const result = utils.getAbsoluteUrl(req as ClientRequest);
      assert.strictEqual(
        result,
        'http://localhost:8080/registers?AWSAccessKeyId=REDACTED'
      );
    });
  });

  describe('setSpanWithError()', () => {
    it('should have error attributes', (t) => {
      const errorMessage = 'test error';
      const error = new Error(errorMessage);
      const span = {
        setAttribute: () => undefined,
        setStatus: () => undefined,
        recordException: () => undefined,
      } as unknown as Span;

      const setAttributeSpy = t.mock.method(span, 'setAttribute');
      const setStatusSpy = t.mock.method(span, 'setStatus');
      const recordExcSpy = t.mock.method(span, 'recordException');

      utils.setSpanWithError(span, error, SemconvStability.OLD);

      const attrCalls = setAttributeSpy.mock.calls.map((c) => c.arguments);
      assert.deepStrictEqual(attrCalls, [
        [HTTP_ERROR_NAME, 'Error'],
        [HTTP_ERROR_MESSAGE, errorMessage],
      ]);

      assert.deepStrictEqual(setStatusSpy.mock.calls[0].arguments, [
        { code: SpanStatusCode.ERROR, message: errorMessage },
      ]);
      assert.deepStrictEqual(recordExcSpy.mock.calls[0].arguments, [error]);
    });
  });

  describe('getIncomingRequestAttributesOnResponse()', () => {
    it('should correctly parse the middleware stack if present', async () => {
      context.setGlobalContextManager(new AsyncHooksContextManager().enable());
      const request = {
        socket: {},
      } as IncomingMessage;
      const result = await new Promise<void>((resolve) => {
        context.with(
          setRPCMetadata(context.active(), {
            type: RPCType.HTTP,
            route: '/user/:id',
            span: null as unknown as Span,
          }),
          () => {
            const attributes = utils.getIncomingRequestAttributesOnResponse(
              request,
              {} as ServerResponse,
              SemconvStability.OLD
            );
            assert.deepStrictEqual(attributes[ATTR_HTTP_ROUTE], '/user/:id');
            context.disable();
            resolve();
          }
        );
      });
    });

    it('should successfully process without middleware stack', () => {
      const request = {
        socket: {},
      } as IncomingMessage;
      const attributes = utils.getIncomingRequestAttributesOnResponse(
        request,
        {
          socket: {},
        } as ServerResponse & { socket: Socket },
        SemconvStability.OLD
      );
      assert.deepStrictEqual(attributes[ATTR_HTTP_ROUTE], undefined);
    });
  });

  describe('getIncomingRequestMetricAttributesOnResponse()', () => {
    it('should correctly add http_route if span has it', () => {
      const spanAttributes: Attributes = {
        [ATTR_HTTP_ROUTE]: '/user/:id',
      };
      const metricAttributes =
        utils.getIncomingRequestMetricAttributesOnResponse(spanAttributes);

      assert.deepStrictEqual(metricAttributes[ATTR_HTTP_ROUTE], '/user/:id');
    });

    it('should skip http_route if span does not have it', () => {
      const spanAttributes: Attributes = {};
      const metricAttributes =
        utils.getIncomingRequestMetricAttributesOnResponse(spanAttributes);
      assert.deepStrictEqual(metricAttributes[ATTR_HTTP_ROUTE], undefined);
    });
  });

  // Verify the key in the given attributes is set to the given value,
  // and that no other HTTP Content Length attributes are set.
  function verifyValueInAttributes(
    attributes: Attributes,
    key: string | undefined,
    value: number
  ) {
    const SemanticAttributess = [
      SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
      SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
      SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
      SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
    ];

    for (const attr of SemanticAttributess) {
      if (attr === key) {
        assert.strictEqual(attributes[attr], value);
      } else {
        assert.strictEqual(attributes[attr], undefined);
      }
    }
  }

  describe('setRequestContentLengthAttribute()', () => {
    it('should set request content-length uncompressed attribute with no content-encoding header', () => {
      const attributes: Attributes = {};
      const request = {} as IncomingMessage;

      request.headers = {
        'content-length': '1200',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set request content-length uncompressed attribute with "identity" content-encoding header', () => {
      const attributes: Attributes = {};
      const request = {} as IncomingMessage;
      request.headers = {
        'content-length': '1200',
        'content-encoding': 'identity',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
        1200
      );
    });

    it('should set request content-length compressed attribute with "gzip" content-encoding header', () => {
      const attributes: Attributes = {};
      const request = {} as IncomingMessage;
      request.headers = {
        'content-length': '1200',
        'content-encoding': 'gzip',
      };
      utils.setRequestContentLengthAttribute(request, attributes);

      verifyValueInAttributes(
        attributes,
        SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
        1200
      );
    });
  });

  describe('getIncomingRequestAttributes()', () => {
    it('should not set http.route in http span attributes', () => {
      const request = {
        url: 'http://hostname/user/:id',
        method: 'GET',
        socket: {},
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'chrome',
        'x-forwarded-for': '<client>, <proxy1>, <proxy2>',
      };
      const attributes = utils.getIncomingRequestAttributes(
        request,
        {
          semconvStability: SemconvStability.OLD,
          enableSyntheticSourceDetection: false,
        },
        diag
      );
      assert.strictEqual(attributes[ATTR_HTTP_ROUTE], undefined);
    });

    it('should set http.target as path in http span attributes', () => {
      const request = {
        url: 'http://hostname/user/?q=val',
        method: 'GET',
        socket: {},
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'chrome',
      };
      const attributes = utils.getIncomingRequestAttributes(
        request,
        {
          semconvStability: SemconvStability.OLD,
          enableSyntheticSourceDetection: false,
        },
        diag
      );
      assert.strictEqual(attributes[SEMATTRS_HTTP_TARGET], '/user/?q=val');
      assert.strictEqual(attributes[ATTR_USER_AGENT_SYNTHETIC_TYPE], undefined);
    });

    it('should set synthetic attributes on requests', () => {
      const request = {
        url: 'http://hostname/user/:id',
        method: 'GET',
        socket: {},
      } as IncomingMessage;
      request.headers = {
        'user-agent': 'Googlebot',
      };
      const attributes = utils.getIncomingRequestAttributes(
        request,
        {
          semconvStability: SemconvStability.STABLE,
          enableSyntheticSourceDetection: true,
        },
        diag
      );
      assert.strictEqual(attributes[ATTR_USER_AGENT_ORIGINAL], 'Googlebot');
      assert.strictEqual(
        attributes[ATTR_USER_AGENT_SYNTHETIC_TYPE],
        USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT
      );
    });
  });

  describe('headers to span attributes capture', () => {
    let span: Span;
    let setAttributeSpy: ReturnType<TestContext['mock']['method']>;
    beforeEach((t) => {
      span = {
        setAttribute: () => undefined,
      } as unknown as Span;
      setAttributeSpy = (t as TestContext).mock.method(span, 'setAttribute');
    });

    it('should set attributes for request and response keys', (t) => {
      utils.headerCapture('request', ['Origin'])(span, () => 'localhost');
      utils.headerCapture('response', ['Cookie'])(span, () => 'token=123');
      assert.deepStrictEqual(
        setAttributeSpy.mock.calls.map((c) => c.arguments),
        [
          ['http.request.header.origin', ['localhost']],
          ['http.response.header.cookie', ['token=123']],
        ]
      );
      assert.strictEqual(setAttributeSpy.mock.callCount(), 2);
    });

    it('should set attributes for multiple values', () => {
      utils.headerCapture('request', ['Origin'])(span, () => [
        'localhost',
        'www.example.com',
      ]);
      assert.deepStrictEqual(
        setAttributeSpy.mock.calls.map((c) => c.arguments),
        [['http.request.header.origin', ['localhost', 'www.example.com']]]
      );
    });

    it('sets attributes for multiple headers', () => {
      utils.headerCapture('request', ['Origin', 'Foo'])(span, (header) => {
        if (header === 'origin') {
          return 'localhost';
        }

        if (header === 'foo') {
          return 42;
        }

        return undefined;
      });

      assert.deepStrictEqual(
        setAttributeSpy.mock.calls.map((c) => c.arguments),
        [
          ['http.request.header.origin', ['localhost']],
          ['http.request.header.foo', [42]],
        ]
      );
      assert.strictEqual(setAttributeSpy.mock.callCount(), 2);
    });

    it('should normalize header names', () => {
      utils.headerCapture('request', ['X-Forwarded-For'])(span, () => 'foo');
      assert.deepStrictEqual(
        setAttributeSpy.mock.calls.map((c) => c.arguments),
        [['http.request.header.x_forwarded_for', ['foo']]]
      );
    });

    it('ignores non-existent headers', () => {
      utils.headerCapture('request', ['Origin', 'Accept'])(span, (header) => {
        if (header === 'origin') {
          return 'localhost';
        }

        return undefined;
      });
      assert.deepStrictEqual(
        setAttributeSpy.mock.calls.map((c) => c.arguments),
        [['http.request.header.origin', ['localhost']]]
      );
      assert.strictEqual(setAttributeSpy.mock.callCount(), 1);
    });
  });

  function mockClientRequest({
    method = 'GET',
    host = 'example.com',
    path = '/foo?bar=baz',
    protocol = 'http:',
    port = 80,
    userAgent = 'chrome',
  }: Partial<{
    method: string;
    host: string;
    path: string;
    protocol: string;
    port: number;
    userAgent: string;
  }> = {}): Partial<ClientRequest> {
    return {
      method,
      host,
      path,
      protocol,
      getHeader: (name: string) => {
        switch (name.toLowerCase()) {
          case 'user-agent':
            return userAgent;
          case 'host':
            return host;
          default:
            return undefined;
        }
      },
      socket: {
        remotePort: port,
      } as unknown as Socket,
    };
  }

  function mockIncomingMessage({
    method = 'GET',
    url = '/foo',
    httpVersion = '1.1',
    headers = {},
    remoteAddress = '127.0.0.1',
    remotePort = 12345,
  }: Partial<IncomingMessage> & {
    headers?: Record<string, string>;
    remoteAddress?: string;
    remotePort?: number;
  }): IncomingMessage {
    const socket = {
      remoteAddress,
      remotePort,
      localAddress: '10.0.0.1',
      localPort: 8080,
    } as unknown as Socket;

    return {
      method,
      url,
      httpVersion,
      headers,
      socket,
    } as unknown as IncomingMessage;
  }

  describe('setAttributesFromHttpKind()', () => {
    it('sets flavor and transport for HTTP/1.1', () => {
      const attrs: Attributes = {};
      utils.setAttributesFromHttpKind('1.1', attrs);
      assert.equal(attrs[SEMATTRS_HTTP_FLAVOR], '1.1');
      assert.equal(attrs[SEMATTRS_NET_TRANSPORT], NETTRANSPORTVALUES_IP_TCP);
    });

    it('sets flavor and UDP transport for QUIC', () => {
      const attrs: Attributes = {};
      utils.setAttributesFromHttpKind('quic', attrs);
      assert.equal(attrs[SEMATTRS_HTTP_FLAVOR], 'quic');
      assert.equal(attrs[SEMATTRS_NET_TRANSPORT], NETTRANSPORTVALUES_IP_UDP);
    });

    it('does nothing when kind is undefined', () => {
      const attrs: Attributes = {};
      utils.setAttributesFromHttpKind(undefined, attrs);
      assert.deepStrictEqual(attrs, {});
    });
  });

  describe('getOutgoingRequestAttributesOnResponse()', () => {
    const req = mockClientRequest({}) as ClientRequest;
    const res = {
      statusCode: 201,
      statusMessage: 'Created',
      headers: { 'content-length': '42' },
      httpVersion: '2',
      socket: {
        remoteAddress: '9.8.7.6',
        remotePort: 8443,
      },
    } as unknown as IncomingMessage;

    it('returns correct attributes in OLD semconv mode', () => {
      const attrs = utils.getOutgoingRequestAttributesOnResponse(
        req,
        res,
        SemconvStability.OLD,
        undefined
      );

      assert.deepStrictEqual(attrs, {
        [SEMATTRS_HTTP_URL]: 'http://example.com/foo?bar=baz',
        [SEMATTRS_NET_PEER_IP]: '9.8.7.6',
        [SEMATTRS_NET_PEER_PORT]: 8443,
        [SEMATTRS_HTTP_STATUS_CODE]: 201,
        [HTTP_STATUS_TEXT]: 'Created',
        [SEMATTRS_HTTP_FLAVOR]: '2',
        [SEMATTRS_NET_TRANSPORT]: NETTRANSPORTVALUES_IP_TCP,
        [SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED]: 42,
      });
    });

    it('returns correct attributes in STABLE semconv mode', () => {
      const attrs = utils.getOutgoingRequestAttributesOnResponse(
        req,
        res,
        SemconvStability.STABLE,
        undefined
      );
      assert.deepStrictEqual(attrs, {
        [ATTR_URL_FULL]: 'http://example.com/foo?bar=baz',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 201,
        [ATTR_NETWORK_PEER_ADDRESS]: '9.8.7.6',
        [ATTR_NETWORK_PEER_PORT]: 8443,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '2',
      });
    });
  });

  describe('getOutgoingRequestAttributes()', () => {
    const req = mockClientRequest({
      method: 'post',
      host: 'api.local:443',
      path: '/v1/resource',
      userAgent: 'Googlebot',
    }) as ClientRequest;

    it('returns classic semconv attributes in OLD mode', () => {
      const attrs = utils.getOutgoingRequestAttributes(
        req,
        SemconvStability.OLD,
        undefined,
        false
      );

      assert.deepStrictEqual(attrs, {
        [SEMATTRS_HTTP_METHOD]: 'post',
        [SEMATTRS_HTTP_TARGET]: '/v1/resource',
        [SEMATTRS_NET_PEER_NAME]: 'api.local:443',
        [SEMATTRS_HTTP_HOST]: 'api.local:443',
        [SEMATTRS_HTTP_USER_AGENT]: 'Googlebot',
        [SEMATTRS_HTTP_URL]: 'http://api.local:443/v1/resource',
      });
    });

    it('returns new semconv attributes with synthetic type detection in STABLE mode', () => {
      const attrs = utils.getOutgoingRequestAttributes(
        req,
        SemconvStability.STABLE,
        undefined,
        true
      );

      assert.deepStrictEqual(attrs, {
        [ATTR_HTTP_REQUEST_METHOD]: 'POST',
        [ATTR_HTTP_REQUEST_METHOD_ORIGINAL]: 'post',
        [ATTR_SERVER_ADDRESS]: 'api.local:443',
        [ATTR_SERVER_PORT]: 443,
        [ATTR_URL_FULL]: 'http://api.local:443/v1/resource',
        [ATTR_USER_AGENT_ORIGINAL]: 'Googlebot',
        [ATTR_USER_AGENT_SYNTHETIC_TYPE]: 'bot',
      });
    });
  });

  describe('Metric helpers', () => {
    const spanAttrs: Attributes = {
      [SEMATTRS_HTTP_METHOD]: 'GET',
      [ATTR_HTTP_RESPONSE_STATUS_CODE]: 301,
      [ATTR_NETWORK_PEER_ADDRESS]: '10.0.0.1',
      [SEMATTRS_NET_PEER_PORT]: 123,
      [ATTR_NETWORK_PROTOCOL_VERSION]: '2',
      [SEMATTRS_HTTP_STATUS_CODE]: 301,
      [SEMATTRS_HTTP_FLAVOR]: '1.1',
    };

    it('getOutgoingRequestMetricAttributes()', () => {
      assert.deepStrictEqual(
        utils.getOutgoingRequestMetricAttributes(spanAttrs),
        {
          [SEMATTRS_HTTP_METHOD]: 'GET',
          [SEMATTRS_NET_PEER_NAME]: undefined,
        }
      );
    });

    it('getOutgoingRequestMetricAttributesOnResponse()', () => {
      assert.deepStrictEqual(
        utils.getOutgoingRequestMetricAttributesOnResponse(spanAttrs),
        {
          [SEMATTRS_NET_PEER_PORT]: 123,
          [SEMATTRS_HTTP_STATUS_CODE]: 301,
          [SEMATTRS_HTTP_FLAVOR]: '1.1',
        }
      );
    });

    it('getOutgoingStableRequestMetricAttributesOnResponse()', () => {
      assert.deepStrictEqual(
        utils.getOutgoingStableRequestMetricAttributesOnResponse(spanAttrs),
        {
          [ATTR_NETWORK_PROTOCOL_VERSION]: '2',
          [ATTR_HTTP_RESPONSE_STATUS_CODE]: 301,
        }
      );
    });
  });

  describe('getRemoteClientAddress()', () => {
    it('returns first entry from Forwarded', () => {
      const req = mockIncomingMessage({
        headers: { forwarded: 'for=203.0.113.60;proto=http;by=203.0.113.43' },
      });
      assert.equal(utils.getRemoteClientAddress(req), '203.0.113.60');
    });

    it('returns complete X-Forwarded-For header value', () => {
      const req = mockIncomingMessage({
        headers: { 'x-forwarded-for': '<client>, <proxy1>' },
      });
      assert.equal(utils.getRemoteClientAddress(req), '<client>, <proxy1>');
    });

    it('falls back to socket.remoteAddress', () => {
      const req = mockIncomingMessage({ remoteAddress: '8.8.8.8' });
      assert.equal(utils.getRemoteClientAddress(req), '8.8.8.8');
    });
  });

  describe('getIncomingStableRequestMetricAttributesOnResponse()', () => {
    it('copies only route and status code when both are present', () => {
      const attrs: Attributes = {
        [ATTR_HTTP_ROUTE]: '/api/users/:id',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 500,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
      };
      const res =
        utils.getIncomingStableRequestMetricAttributesOnResponse(attrs);
      assert.deepStrictEqual(res, {
        [ATTR_HTTP_ROUTE]: '/api/users/:id',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 500,
      });
    });

    it('copies only status code when route is missing', () => {
      const attrs: Attributes = {
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 500,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
      };
      const res =
        utils.getIncomingStableRequestMetricAttributesOnResponse(attrs);
      assert.deepStrictEqual(res, {
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 500,
      });
    });

    it('copies only route when status code is missing', () => {
      const attrs: Attributes = {
        [ATTR_HTTP_ROUTE]: '/api/products',
        [ATTR_NETWORK_PROTOCOL_VERSION]: '2.0',
      };
      const res =
        utils.getIncomingStableRequestMetricAttributesOnResponse(attrs);
      assert.deepStrictEqual(res, {
        [ATTR_HTTP_ROUTE]: '/api/products',
      });
    });
  });

  describe('parseResponseStatus() edge cases', () => {
    it('treats 308 as UNSET for client', () => {
      const status = utils.parseResponseStatus(400, 308);
      assert.equal(status, SpanStatusCode.UNSET);
    });

    it('treats 501 as ERROR for server', () => {
      const status = utils.parseResponseStatus(500, 501);
      assert.equal(status, SpanStatusCode.ERROR);
    });
  });

  describe('headerCapture() with missing headers', () => {
    it('sets nothing when headers are absent', (t) => {
      const span = { setAttribute: () => undefined } as unknown as Span;
      const setAttrSpy = t.mock.method(span, 'setAttribute');
      utils.headerCapture('request', ['X-Foo'])(span, () => undefined);
      assert.strictEqual(setAttrSpy.mock.callCount(), 0);
    });
  });
});
