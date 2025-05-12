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
import {
  context,
  HrTime,
  propagation,
  ROOT_CONTEXT,
  Span,
  SpanKind,
  SpanOptions,
  SpanStatus,
  SpanStatusCode,
  trace,
  Attributes,
} from '@opentelemetry/api';
import {
  hrTime,
  suppressTracing,
  RPCMetadata,
  RPCType,
  setRPCMetadata,
} from '@opentelemetry/core';
import type * as http from 'http';
//import type * as https from 'https';
import { Socket } from 'net';
import * as url from 'url';
import { HttpInstrumentationConfig } from './types';
import { VERSION } from '../../version';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';
import { errorMonitor } from 'events';
import {
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_USER_AGENT_ORIGINAL,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions';
import {
  extractHostnameAndPort,
  getIncomingRequestAttributes,
  getIncomingRequestAttributesOnResponse,
  getOutgoingRequestAttributes,
  getOutgoingRequestAttributesOnResponse,
  getOutgoingRequestMetricAttributesOnResponse,
  getRequestInfo,
  getServerAddress,
  headerCapture,
  isValidOptionsType,
  parseResponseStatus,
  setSpanWithError,
} from './utils';
import { Err, Func, Http } from './internal-types';
import * as diagnostics_channel from 'node:diagnostics_channel';

const SPAN_SYMBOL = Symbol.for('DCHTTP_SPAN');

type TracedServerResponse = http.ServerResponse & { [SPAN_SYMBOL]?: Span };
type TracedClientRequest = http.ClientRequest & { [SPAN_SYMBOL]?: Span };

/**
 * `node:http` and `node:https` instrumentation for OpenTelemetry
 */
export class HttpDcInstrumentation extends InstrumentationBase<HttpInstrumentationConfig> {
  private _headerCapture;

  constructor(config: HttpInstrumentationConfig = {}) {
    super('@opentelemetry/instrumentation-httpdc', VERSION, config);
    this._headerCapture = this._createHeaderCapture();
  }

  override setConfig(config: HttpInstrumentationConfig = {}): void {
    super.setConfig(config);
    this._headerCapture = this._createHeaderCapture();
  }

  init(): [InstrumentationNodeModuleDefinition] {
    diagnostics_channel.subscribe(
      'http.server.request.start',
      this._httpServerRequestStart.bind(this)
    );
    diagnostics_channel.subscribe(
      'http.server.response.finish',
      this._httpServerResponseFinished.bind(this)
    );

    diagnostics_channel.subscribe(
      'http.client.request.created',
      this._httpClientRequestCreated.bind(this)
    );
    diagnostics_channel.subscribe(
      'http.client.request.error',
      this._httpClientRequestError.bind(this)
    );
    diagnostics_channel.subscribe(
      'http.client.response.finish',
      this._httpClientResponseFinished.bind(this)
    );

    return [this._getHttpInstrumentation()];
  }

  private _getHttpInstrumentation() {
    return new InstrumentationNodeModuleDefinition(
      'http',
      ['*'],
      (moduleExports: Http): Http => {
        this._wrap(
          moduleExports.Server.prototype,
          'emit',
          this._getPatchServerEmit()
        );
        return moduleExports;
      },
      (moduleExports: Http) => {
        if (moduleExports === undefined) return;
        this._unwrap(moduleExports.Server.prototype, 'emit');
      }
    );
  }

  private _getPatchServerEmit() {
    return (original: (event: string, ...args: unknown[]) => boolean) => {
      return function patchedEmit(
        this: unknown,
        event: string,
        ...args: unknown[]
      ) {
        if (event !== 'request') {
          return original.apply(this, [event, ...args]);
        }

        const response = args[1] as TracedServerResponse;

        const span = response[SPAN_SYMBOL];

        if (span === undefined) {
          return original.apply(this, [event, ...args]);
        }

        return context.with(trace.setSpan(context.active(), span), () => {
          return original.apply(this, [event, ...args]);
        });
      };
    };
  }

  private _httpServerRequestStart(message: any) {
    //console.log('http.server.request.start');
    const request = message.request as http.IncomingMessage;
    const response = message.response as http.ServerResponse;
    const method = request.method || 'GET';

    const headers = request.headers;
    const spanAttributes = getIncomingRequestAttributes(
      request,
      {
        component: 'http',
        hookAttributes: this._callStartSpanHook(
          request,
          this.getConfig().startIncomingSpanHook
        ),
        enableSyntheticSourceDetection:
          this.getConfig().enableSyntheticSourceDetection || false,
      },
      this._diag
    );

    const spanOptions: SpanOptions = {
      kind: SpanKind.SERVER,
      attributes: spanAttributes,
    };

    const ctx = propagation.extract(ROOT_CONTEXT, headers);
    const span = this.tracer.startSpan(method, spanOptions, ctx);
    (response as any)[SPAN_SYMBOL] = span;
    const rpcMetadata: RPCMetadata = {
      type: RPCType.HTTP,
      span,
    };

    context.with(setRPCMetadata(trace.setSpan(ctx, span), rpcMetadata), () => {
      // TODO Necessary?
      //context.bind(context.active(), request);
      //context.bind(context.active(), response);

      if (this.getConfig().requestHook) {
        this._callRequestHook(span, request);
      }
      if (this.getConfig().responseHook) {
        this._callResponseHook(span, response);
      }

      this._headerCapture.server.captureRequestHeaders(
        span,
        (header) => request.headers[header]
      );
    });
  }

  private _httpServerResponseFinished(message: any) {
    //console.log('http.server.response.finish');
    const request = message.request as http.IncomingMessage;
    const response = message.response as http.ServerResponse & {
      [SPAN_SYMBOL]?: Span;
    };
    const span = response[SPAN_SYMBOL];

    if (span !== undefined) {
      this._onServerResponseFinish(request, response, span);
    }
    /*
          response.on(errorMonitor, (err: Err) => {
            hasError = true;
            instrumentation._onServerResponseError(
              span,
              stableMetricAttributes,
              startTime,
              err
            );
          });
          */
  }

  private _httpClientRequestCreated(message: any) {
    //return { origin, pathname, method, optionsParsed, invalidUrl };
    const request = message.request as TracedClientRequest;
    const hostHeader = request.getHeader('Host');
    let port: number | undefined;

    if (typeof hostHeader === 'string') {
      const portString = hostHeader.substring(hostHeader.indexOf(':') + 1);
      port = Number(portString);
    }
    //console.log('http.client.request.created');
    /*
      const { hostname, port } = extractHostnameAndPort(optionsParsed);
      const attributes = getOutgoingRequestAttributes(
        optionsParsed,
        {
          component: 'http',
          port,
          hostname,
          hookAttributes: this._callStartSpanHook(
            optionsParsed,
            this.getConfig().startOutgoingSpanHook
          ),
        },
        this.getConfig().enableSyntheticSourceDetection || false
      );
      */

    const attributes: Attributes = {
      // Required attributes
      [ATTR_HTTP_REQUEST_METHOD]: request.method,
      [ATTR_SERVER_ADDRESS]: request.host,
      [ATTR_SERVER_PORT]: port,
      //[ATTR_URL_FULL]: urlFull,
      [ATTR_USER_AGENT_ORIGINAL]: request.getHeader('user-agent'),
      // leaving out protocol version, it is not yet negotiated
      // leaving out protocol name, it is only required when protocol version is set
      // retries and redirects not supported

      // Opt-in attributes left off for now
    };

    const spanOptions: SpanOptions = {
      kind: SpanKind.CLIENT,
      attributes,
    };
    const span = this._startHttpSpan(request.method, spanOptions);
    request[SPAN_SYMBOL] = span;

    const parentContext = context.active();
    const requestContext = trace.setSpan(parentContext, span);

    propagation.inject(requestContext, request, {
      set: (req, key, value) => {
        req.setHeader(key, value);
      },
    });
  }

  private _httpClientRequestError(message: any) {
    //console.log('http.client.request.error');
  }

  private _httpClientResponseFinished(message: any) {
    const req = message.request as TracedClientRequest;
    const span = req[SPAN_SYMBOL];

    if (span == undefined) {
      return;
    }

    const response = message.response as http.IncomingMessage;
    console.log(response);

    const { statusCode, socket } = response;
    const attributes: Attributes = {};

    if (statusCode) {
      attributes[ATTR_HTTP_RESPONSE_STATUS_CODE] = statusCode;
    }

    const { remoteAddress, remotePort } = socket;
    attributes[ATTR_NETWORK_PEER_ADDRESS] = remoteAddress;
    attributes[ATTR_NETWORK_PEER_PORT] = remotePort;
    attributes[ATTR_NETWORK_PROTOCOL_VERSION] = response.httpVersion;

    span.setAttributes(attributes);
    span.end();
    //console.log('http.client.response.finish');
  }

  /**
   * Attach event listeners to a client request to end span and add span attributes.
   *
   * @param request The original request object.
   * @param span representing the current operation
   * @param startTime representing the start time of the request to calculate duration in Metric
   * @param stableMetricAttributes metric attributes for new semantic conventions
   */
  private _traceClientRequest(
    request: http.ClientRequest,
    span: Span,
    startTime: HrTime,
    stableMetricAttributes: Attributes
  ): http.ClientRequest {
    if (this.getConfig().requestHook) {
      this._callRequestHook(span, request);
    }

    /**
     * Determines if the request has errored or the response has ended/errored.
     */
    let responseFinished = false;

    /*
     * User 'response' event listeners can be added before our listener,
     * force our listener to be the first, so response emitter is bound
     * before any user listeners are added to it.
     */
    request.prependListener(
      'response',
      (response: http.IncomingMessage & { aborted?: boolean }) => {
        this._diag.debug('outgoingRequest on response()');
        if (request.listenerCount('response') <= 1) {
          response.resume();
        }
        const responseAttributes =
          getOutgoingRequestAttributesOnResponse(response);
        span.setAttributes(responseAttributes);
        stableMetricAttributes = Object.assign(
          stableMetricAttributes,
          getOutgoingRequestMetricAttributesOnResponse(responseAttributes)
        );

        if (this.getConfig().responseHook) {
          this._callResponseHook(span, response);
        }

        this._headerCapture.client.captureRequestHeaders(span, (header) =>
          request.getHeader(header)
        );
        this._headerCapture.client.captureResponseHeaders(
          span,
          (header) => response.headers[header]
        );

        context.bind(context.active(), response);

        const endHandler = () => {
          this._diag.debug('outgoingRequest on end()');
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          let status: SpanStatus;

          if (response.aborted && !response.complete) {
            status = { code: SpanStatusCode.ERROR };
          } else {
            // behaves same for new and old semconv
            status = {
              code: parseResponseStatus(SpanKind.CLIENT, response.statusCode),
            };
          }

          span.setStatus(status);

          if (this.getConfig().applyCustomAttributesOnSpan) {
            safeExecuteInTheMiddle(
              () =>
                this.getConfig().applyCustomAttributesOnSpan!(
                  span,
                  request,
                  response
                ),
              () => {},
              true
            );
          }

          span.end();
        };

        response.on('end', endHandler);
        response.on(errorMonitor, (error: Err) => {
          this._diag.debug('outgoingRequest on error()', error);
          if (responseFinished) {
            return;
          }
          responseFinished = true;
          setSpanWithError(span, error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error.message,
          });
          span.end();
        });
      }
    );
    request.on('close', () => {
      this._diag.debug('outgoingRequest on request close()');
      if (request.aborted || responseFinished) {
        return;
      }
      responseFinished = true;
      span.end();
    });
    request.on(errorMonitor, (error: Err) => {
      this._diag.debug('outgoingRequest on request error()', error);
      if (responseFinished) {
        return;
      }
      responseFinished = true;
      setSpanWithError(span, error);

      span.end();
    });

    this._diag.debug('http.ClientRequest return request');
    return request;
  }

  private _onServerResponseFinish(
    request: http.IncomingMessage,
    response: http.ServerResponse,
    span: Span
  ) {
    const attributes = getIncomingRequestAttributesOnResponse(
      request,
      response
    );

    this._headerCapture.server.captureResponseHeaders(span, (header) =>
      response.getHeader(header)
    );

    span.setAttributes(attributes).setStatus({
      code: parseResponseStatus(SpanKind.SERVER, response.statusCode),
    });

    const route = attributes[ATTR_HTTP_ROUTE];
    if (route) {
      span.updateName(`${request.method || 'GET'} ${route}`);
    }

    if (this.getConfig().applyCustomAttributesOnSpan) {
      safeExecuteInTheMiddle(
        () =>
          this.getConfig().applyCustomAttributesOnSpan!(
            span,
            request,
            response
          ),
        () => {},
        true
      );
    }

    span.end();
  }

  private _onServerResponseError(
    span: Span,
    stableMetricAttributes: Attributes,
    startTime: HrTime,
    error: Err
  ) {
    setSpanWithError(span, error);
    span.end();
  }

  private _startHttpSpan(
    name: string,
    options: SpanOptions,
    ctx = context.active()
  ) {
    return this.tracer.startSpan(name, options, ctx);
  }

  private _callResponseHook(
    span: Span,
    response: http.IncomingMessage | http.ServerResponse
  ) {
    safeExecuteInTheMiddle(
      () => this.getConfig().responseHook!(span, response),
      () => {},
      true
    );
  }

  private _callRequestHook(
    span: Span,
    request: http.ClientRequest | http.IncomingMessage
  ) {
    safeExecuteInTheMiddle(
      () => this.getConfig().requestHook!(span, request),
      () => {},
      true
    );
  }

  private _callStartSpanHook(
    request: http.IncomingMessage | http.RequestOptions,
    hookFunc: Function | undefined
  ) {
    if (typeof hookFunc === 'function') {
      return safeExecuteInTheMiddle(
        () => hookFunc(request),
        () => {},
        true
      );
    }
  }

  private _createHeaderCapture() {
    const config = this.getConfig();

    return {
      client: {
        captureRequestHeaders: headerCapture(
          'request',
          config.headersToSpanAttributes?.client?.requestHeaders ?? []
        ),
        captureResponseHeaders: headerCapture(
          'response',
          config.headersToSpanAttributes?.client?.responseHeaders ?? []
        ),
      },
      server: {
        captureRequestHeaders: headerCapture(
          'request',
          config.headersToSpanAttributes?.server?.requestHeaders ?? []
        ),
        captureResponseHeaders: headerCapture(
          'response',
          config.headersToSpanAttributes?.server?.responseHeaders ?? []
        ),
      },
    };
  }
}
