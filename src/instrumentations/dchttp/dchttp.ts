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
import {
  context,
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
  RPCMetadata,
  RPCType,
  setRPCMetadata,
  isTracingSuppressed,
} from '@opentelemetry/core';
import type * as http from 'http';
import { HttpInstrumentationConfig } from './types';
import { VERSION } from '../../version';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';
import { errorMonitor } from 'events';
import { ATTR_HTTP_ROUTE } from '@opentelemetry/semantic-conventions';
import {
  getIncomingRequestAttributes,
  getIncomingRequestAttributesOnResponse,
  getOutgoingRequestAttributesOnResponse,
  getOutgoingRequestAttributes,
  headerCapture,
  parseResponseStatus,
  setSpanWithError,
} from './utils';
import { Err, Http, SemconvStability } from './internal-types';
import * as diagnostics_channel from 'node:diagnostics_channel';

const SPAN_SYMBOL = Symbol.for('DCHTTP_SPAN');

type WithSpan = { [SPAN_SYMBOL]?: Span };
type TracedServerResponse = http.ServerResponse & WithSpan;
type TracedClientRequest = http.ClientRequest & WithSpan;

function closeHttpSpan(traced: WithSpan) {
  traced[SPAN_SYMBOL]?.end();
  delete traced[SPAN_SYMBOL];
}

/**
 * `node:http` and `node:https` instrumentation for OpenTelemetry
 */
export class HttpDcInstrumentation extends InstrumentationBase<HttpInstrumentationConfig> {
  private _headerCapture;

  private _semconvStability = SemconvStability.OLD;

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

        const rpcMetadata: RPCMetadata = {
          type: RPCType.HTTP,
          span,
        };

        return context.with(
          setRPCMetadata(trace.setSpan(context.active(), span), rpcMetadata),
          () => {
            const request = args[0] as http.IncomingMessage;
            context.bind(context.active(), request);
            return original.apply(this, [event, ...args]);
          }
        );
      };
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _httpServerRequestStart(message: any) {
    if (!this.isEnabled()) {
      return;
    }

    const request = message.request as http.IncomingMessage;
    const response = message.response as TracedServerResponse;

    const config = this.getConfig();

    const ignoreIncomingRequestHook = config.ignoreIncomingRequestHook;
    if (ignoreIncomingRequestHook !== undefined) {
      if (
        safeExecuteInTheMiddle(
          () => ignoreIncomingRequestHook(request),
          (e: unknown) => {
            if (e !== null) {
              this._diag.error('caught ignoreIncomingRequestHook error: ', e);
            }
          },
          true
        )
      ) {
        return;
      }
    }

    let hookAttributes: Attributes | undefined;

    if (config.startIncomingSpanHook !== undefined) {
      hookAttributes = this._callStartSpanHook(
        request,
        config.startIncomingSpanHook
      );
    }

    const spanAttributes = getIncomingRequestAttributes(
      request,
      {
        serverName: config.serverName,
        hookAttributes,
        semconvStability: this._semconvStability,
      },
      this._diag
    );

    const spanOptions: SpanOptions = {
      kind: SpanKind.SERVER,
      attributes: spanAttributes,
    };

    const headers = request.headers;
    const method = request.method || 'GET';

    const ctx = propagation.extract(ROOT_CONTEXT, headers);
    const span = this.tracer.startSpan(method, spanOptions, ctx);
    response[SPAN_SYMBOL] = span;

    response.on(errorMonitor, (err: Err) => {
      if (response[SPAN_SYMBOL] === undefined) {
        return;
      }

      setSpanWithError(span, err, this._semconvStability);
      closeHttpSpan(response);
    });

    this._callRequestHook(span, request);
    this._callResponseHook(span, response);

    this._headerCapture.server.captureRequestHeaders(
      span,
      (header) => request.headers[header]
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _httpServerResponseFinished(message: any) {
    if (!this.isEnabled()) {
      return;
    }

    const response = message.response as TracedServerResponse;
    const span = response[SPAN_SYMBOL];

    if (span !== undefined) {
      const request = message.request as http.IncomingMessage;
      this._onServerResponseFinish(request, response, span);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _httpClientRequestCreated(message: any) {
    if (!this.isEnabled()) {
      return;
    }

    const parentContext = context.active();

    if (isTracingSuppressed(parentContext)) {
      return;
    }

    const request = message.request as TracedClientRequest;

    const config = this.getConfig();
    const ignoreOutgoingRequestHook = config.ignoreOutgoingRequestHook;
    if (ignoreOutgoingRequestHook !== undefined) {
      if (
        safeExecuteInTheMiddle(
          () => ignoreOutgoingRequestHook(request),
          (e: unknown) => {
            if (e !== null) {
              this._diag.error('caught ignoreOutgoingRequestHook error: ', e);
            }
          },
          true
        )
      ) {
        return;
      }
    }
    const attributes = getOutgoingRequestAttributes(
      request,
      this._semconvStability
    );

    if (config.startOutgoingSpanHook !== undefined) {
      const hookAttributes = this._callStartSpanHook(
        request,
        config.startOutgoingSpanHook
      );
      Object.assign(attributes, hookAttributes);
    }
    const spanOptions: SpanOptions = {
      kind: SpanKind.CLIENT,
      attributes,
    };
    const span = this.tracer.startSpan(
      request.method,
      spanOptions,
      parentContext
    );

    this._callRequestHook(span, request);

    request[SPAN_SYMBOL] = span;

    const requestContext = trace.setSpan(parentContext, span);
    context.bind(parentContext, request);

    propagation.inject(requestContext, request, {
      set: (req, key, value) => {
        req.setHeader(key, value);
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _httpClientRequestError(message: any) {
    if (!this.isEnabled()) {
      return;
    }
    const request = message.request as TracedClientRequest;
    const span = request[SPAN_SYMBOL];

    if (span === undefined) {
      return;
    }

    setSpanWithError(span, message.error, this._semconvStability);
    closeHttpSpan(request);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _httpClientResponseFinished(message: any) {
    if (!this.isEnabled()) {
      return;
    }
    const req = message.request as TracedClientRequest;
    const span = req[SPAN_SYMBOL];

    if (span === undefined) {
      return;
    }

    const response = message.response as http.IncomingMessage;

    const attributes = getOutgoingRequestAttributesOnResponse(
      req,
      response,
      this._semconvStability
    );

    let status: SpanStatus;

    if (response.destroyed && !response.complete) {
      status = { code: SpanStatusCode.ERROR };
    } else {
      // behaves same for new and old semconv
      status = {
        code: parseResponseStatus(400, response.statusCode),
      };
    }

    span.setStatus(status);
    span.setAttributes(attributes);

    this._callResponseHook(span, response);
    this._headerCapture.client.captureRequestHeaders(span, (header) =>
      req.getHeader(header)
    );

    this._headerCapture.client.captureResponseHeaders(
      span,
      (header) => response.headers[header]
    );

    const applyCustomAttributesOnSpan =
      this.getConfig().applyCustomAttributesOnSpan;
    if (applyCustomAttributesOnSpan !== undefined) {
      safeExecuteInTheMiddle(
        () => applyCustomAttributesOnSpan(span, req, response),
        () => {},
        true
      );
    }

    closeHttpSpan(req);
  }

  private _onServerResponseFinish(
    request: http.IncomingMessage,
    response: TracedServerResponse,
    span: Span
  ) {
    if (!this.isEnabled()) {
      return;
    }
    const attributes = getIncomingRequestAttributesOnResponse(
      request,
      response,
      this._semconvStability
    );

    this._headerCapture.server.captureResponseHeaders(span, (header) =>
      response.getHeader(header)
    );

    span.setAttributes(attributes).setStatus({
      code: parseResponseStatus(500, response.statusCode),
    });

    const route = attributes[ATTR_HTTP_ROUTE];
    if (route) {
      span.updateName(`${request.method || 'GET'} ${route}`);
    }

    const applyCustomAttributesOnSpan =
      this.getConfig().applyCustomAttributesOnSpan;
    if (applyCustomAttributesOnSpan !== undefined) {
      safeExecuteInTheMiddle(
        () => applyCustomAttributesOnSpan(span, request, response),
        () => {},
        true
      );
    }

    closeHttpSpan(response);
  }

  private _callResponseHook(
    span: Span,
    response: http.IncomingMessage | http.ServerResponse
  ) {
    const hook = this.getConfig().responseHook;
    if (hook === undefined) {
      return;
    }
    safeExecuteInTheMiddle(
      () => hook(span, response),
      () => {},
      true
    );
  }

  private _callRequestHook(
    span: Span,
    request: http.ClientRequest | http.IncomingMessage
  ) {
    const hook = this.getConfig().requestHook;
    if (hook === undefined) {
      return;
    }
    safeExecuteInTheMiddle(
      () => hook(span, request),
      () => {},
      true
    );
  }

  private _callStartSpanHook(
    request: http.IncomingMessage | http.RequestOptions,
    hookFunc: Function
  ) {
    return safeExecuteInTheMiddle(
      () => hookFunc(request),
      () => {},
      true
    );
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
