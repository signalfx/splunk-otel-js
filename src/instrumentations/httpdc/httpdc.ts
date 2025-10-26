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
  Histogram,
  ValueType,
  HrTime,
  INVALID_SPAN_CONTEXT,
} from '@opentelemetry/api';
import {
  RPCMetadata,
  RPCType,
  setRPCMetadata,
  isTracingSuppressed,
  hrTimeToMilliseconds,
  hrTimeDuration,
  hrTime,
} from '@opentelemetry/core';
import { HttpDcInstrumentationConfig } from './types';
import { SpanDetails } from './internal-types';
import type * as http from 'http';
import { VERSION } from '../../version';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  safeExecuteInTheMiddle,
  SemconvStability,
  semconvStabilityFromStr,
} from '@opentelemetry/instrumentation';
import { errorMonitor } from 'events';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_SCHEME,
  METRIC_HTTP_CLIENT_REQUEST_DURATION,
  METRIC_HTTP_SERVER_REQUEST_DURATION,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
} from '@opentelemetry/semantic-conventions';
import {
  getIncomingRequestAttributes,
  getIncomingRequestAttributesOnResponse,
  getOutgoingRequestAttributesOnResponse,
  getOutgoingRequestAttributes,
  headerCapture,
  parseResponseStatus,
  setSpanWithError,
  getIncomingRequestMetricAttributes,
  getOutgoingRequestMetricAttributes,
  getIncomingRequestMetricAttributesOnResponse,
  getIncomingStableRequestMetricAttributesOnResponse,
  getOutgoingRequestMetricAttributesOnResponse,
  getOutgoingStableRequestMetricAttributesOnResponse,
} from './utils';
import { Err, Http } from './internal-types';
import * as diagnostics_channel from 'node:diagnostics_channel';

const INSTRUMENTATION_SYMBOL = Symbol.for('HTTPDC_INSTRUMENTATION');

type WithInstrumentation = {
  [INSTRUMENTATION_SYMBOL]?: SpanDetails;
};
type TracedServerResponse = http.ServerResponse & WithInstrumentation;
type TracedClientRequest = http.ClientRequest & WithInstrumentation;

/**
 * `node:http` and `node:https` instrumentation for OpenTelemetry
 */
export class HttpDcInstrumentation extends InstrumentationBase<HttpDcInstrumentationConfig> {
  private _headerCapture;
  declare private _oldHttpServerDurationHistogram: Histogram;
  declare private _stableHttpServerDurationHistogram: Histogram;
  declare private _oldHttpClientDurationHistogram: Histogram;
  declare private _stableHttpClientDurationHistogram: Histogram;
  private _semconvStability: SemconvStability = SemconvStability.OLD;

  constructor(config: HttpDcInstrumentationConfig = {}) {
    super('@opentelemetry/instrumentation-httpdc', VERSION, config);
    this._headerCapture = this._createHeaderCapture();
    this._semconvStability = semconvStabilityFromStr(
      'http',
      process.env.OTEL_SEMCONV_STABILITY_OPT_IN
    );
  }

  protected override _updateMetricInstruments() {
    this._oldHttpServerDurationHistogram = this.meter.createHistogram(
      'http.server.duration',
      {
        description: 'Measures the duration of inbound HTTP requests.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
      }
    );
    this._oldHttpClientDurationHistogram = this.meter.createHistogram(
      'http.client.duration',
      {
        description: 'Measures the duration of outbound HTTP requests.',
        unit: 'ms',
        valueType: ValueType.DOUBLE,
      }
    );
    this._stableHttpServerDurationHistogram = this.meter.createHistogram(
      METRIC_HTTP_SERVER_REQUEST_DURATION,
      {
        description: 'Duration of HTTP server requests.',
        unit: 's',
        valueType: ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5,
            7.5, 10,
          ],
        },
      }
    );
    this._stableHttpClientDurationHistogram = this.meter.createHistogram(
      METRIC_HTTP_CLIENT_REQUEST_DURATION,
      {
        description: 'Duration of HTTP client requests.',
        unit: 's',
        valueType: ValueType.DOUBLE,
        advice: {
          explicitBucketBoundaries: [
            0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5,
            7.5, 10,
          ],
        },
      }
    );
  }

  private _recordServerDuration(
    durationMs: number,
    oldAttributes: Attributes | undefined,
    stableAttributes: Attributes | undefined
  ) {
    if (oldAttributes && this._semconvStability & SemconvStability.OLD) {
      // old histogram is counted in MS
      this._oldHttpServerDurationHistogram.record(durationMs, oldAttributes);
    }

    if (stableAttributes && this._semconvStability & SemconvStability.STABLE) {
      // stable histogram is counted in S
      this._stableHttpServerDurationHistogram.record(
        durationMs / 1000,
        stableAttributes
      );
    }
  }

  private _recordClientDuration(
    durationMs: number,
    oldAttributes: Attributes | undefined,
    stableAttributes: Attributes | undefined
  ) {
    if (oldAttributes && this._semconvStability & SemconvStability.OLD) {
      // old histogram is counted in MS
      this._oldHttpClientDurationHistogram.record(durationMs, oldAttributes);
    }

    if (stableAttributes && this._semconvStability & SemconvStability.STABLE) {
      // stable histogram is counted in S
      this._stableHttpClientDurationHistogram.record(
        durationMs / 1000,
        stableAttributes
      );
    }
  }

  override setConfig(config: HttpDcInstrumentationConfig = {}): void {
    super.setConfig(config);
    this._headerCapture = this._createHeaderCapture();
    this._semconvStability = config.semconvStability
      ? config.semconvStability
      : semconvStabilityFromStr(
          'http',
          process.env.OTEL_SEMCONV_STABILITY_OPT_IN
        );
  }

  private _wrapSyncClientError() {
    const instrumentation = this;
    return (original: Function) =>
      function patchedRequest(this: unknown, ...args: unknown[]) {
        const start = hrTime();
        try {
          return original.apply(this, args);
        } catch (err: unknown) {
          instrumentation._handleClientRequestError(start, args, err as Error);
          throw err;
        }
      };
  }

  private _handleClientRequestError(
    start: HrTime,
    args: unknown[],
    err: Error
  ) {
    const durationMs = hrTimeToMilliseconds(hrTimeDuration(start, hrTime()));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const request = args[0] as any;
    const method = (request.method ?? 'GET').toUpperCase();
    const hostname = request.hostname ?? 'localhost';
    const port = request.port ?? 80;
    let oldMetricAttrs: Attributes | undefined;
    let stableMetricAttrs: Attributes | undefined;
    if (this._semconvStability & SemconvStability.OLD) {
      const oldSpanAttrs: Attributes = {
        [SEMATTRS_HTTP_METHOD]: method,
        [SEMATTRS_NET_PEER_NAME]: hostname,
      };
      if (port !== undefined) oldSpanAttrs[SEMATTRS_NET_PEER_PORT] = port;

      oldMetricAttrs = getOutgoingRequestMetricAttributes(oldSpanAttrs);
    }

    if (this._semconvStability & SemconvStability.STABLE) {
      stableMetricAttrs = {
        [ATTR_HTTP_REQUEST_METHOD]: method,
        [ATTR_SERVER_ADDRESS]: hostname,
        [ATTR_ERROR_TYPE]: err.name,
      };
      if (port !== undefined) stableMetricAttrs[ATTR_SERVER_PORT] = port;
    }

    this._recordClientDuration(durationMs, oldMetricAttrs, stableMetricAttrs);
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

        this._wrap(moduleExports, 'request', this._wrapSyncClientError());
        this._wrap(moduleExports, 'get', this._wrapSyncClientError());
        return moduleExports;
      },
      (moduleExports: Http) => {
        if (moduleExports === undefined) return;
        this._unwrap(moduleExports.Server.prototype, 'emit');
        this._unwrap(moduleExports, 'request');
        this._unwrap(moduleExports, 'get');
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

        const spanDetails = response[INSTRUMENTATION_SYMBOL];

        if (spanDetails?.span === undefined) {
          return original.apply(this, [event, ...args]);
        }

        const span = spanDetails.span;

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
        enableSyntheticSourceDetection:
          config.enableSyntheticSourceDetection || false,
      },
      this._diag
    );

    const spanOptions: SpanOptions = {
      kind: SpanKind.SERVER,
      attributes: spanAttributes,
    };
    let oldMetricAttributes: Attributes | undefined;
    let stableMetricAttributes: Attributes | undefined;
    const startTime = hrTime();
    if (this._semconvStability & SemconvStability.OLD) {
      oldMetricAttributes = getIncomingRequestMetricAttributes(spanAttributes);
    }

    if (this._semconvStability & SemconvStability.STABLE) {
      stableMetricAttributes = {
        [ATTR_HTTP_REQUEST_METHOD]: spanAttributes[ATTR_HTTP_REQUEST_METHOD],
        [ATTR_URL_SCHEME]: spanAttributes[ATTR_URL_SCHEME],
      };

      // recommended if and only if one was sent, same as span recommendation
      if (spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION]) {
        stableMetricAttributes[ATTR_NETWORK_PROTOCOL_VERSION] =
          spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION];
      }
    }

    const headers = request.headers;
    const method = request.method || 'GET';

    const ctx = propagation.extract(ROOT_CONTEXT, headers);
    const span = this._startHttpSpan(method, spanOptions, ctx);
    response[INSTRUMENTATION_SYMBOL] = {
      span,
      spanKind: SpanKind.SERVER,
      startTime,
      oldMetricAttributes,
      stableMetricAttributes,
    };

    response.on(errorMonitor, (err: Err) => {
      const spanDetails = response[INSTRUMENTATION_SYMBOL];
      if (spanDetails?.span === undefined) {
        return;
      }
      if (!spanDetails.stableMetricAttributes) {
        spanDetails.stableMetricAttributes = {};
      }
      spanDetails.stableMetricAttributes[ATTR_ERROR_TYPE] = err.name;
      setSpanWithError(spanDetails.span, err, this._semconvStability);
      this._closeHttpSpan(response);
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
    const spanDetails = response[INSTRUMENTATION_SYMBOL];

    if (spanDetails?.span !== undefined) {
      const request = message.request as http.IncomingMessage;
      this._onServerResponseFinish(request, response, spanDetails.span);
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
      this._semconvStability,
      config.redactedQueryParams,
      config.enableSyntheticSourceDetection || false
    );

    if (config.startOutgoingSpanHook !== undefined) {
      const hookAttributes = this._callStartSpanHook(
        request,
        config.startOutgoingSpanHook
      );
      Object.assign(attributes, hookAttributes);
    }

    // here attributes related to metrics
    const startTime = hrTime();
    let oldMetricAttributes: Attributes | undefined;
    let stableMetricAttributes: Attributes | undefined;
    if (this._semconvStability & SemconvStability.OLD) {
      oldMetricAttributes = getOutgoingRequestMetricAttributes(attributes);
    }

    if (this._semconvStability & SemconvStability.STABLE) {
      // request method, server address, and server port are both required span attributes
      stableMetricAttributes = {
        [ATTR_HTTP_REQUEST_METHOD]: attributes[ATTR_HTTP_REQUEST_METHOD],
        [ATTR_SERVER_ADDRESS]: attributes[ATTR_SERVER_ADDRESS],
        [ATTR_SERVER_PORT]: attributes[ATTR_SERVER_PORT],
      };

      // required if and only if one was sent, same as span requirement
      if (attributes[ATTR_HTTP_RESPONSE_STATUS_CODE]) {
        stableMetricAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] =
          attributes[ATTR_HTTP_RESPONSE_STATUS_CODE];
      }

      // recommended if and only if one was sent, same as span recommendation
      if (attributes[ATTR_NETWORK_PROTOCOL_VERSION]) {
        stableMetricAttributes[ATTR_NETWORK_PROTOCOL_VERSION] =
          attributes[ATTR_NETWORK_PROTOCOL_VERSION];
      }
    }

    const spanOptions: SpanOptions = {
      kind: SpanKind.CLIENT,
      attributes,
    };

    const span = this._startHttpSpan(
      request.method,
      spanOptions,
      parentContext
    );

    this._callRequestHook(span, request);

    request[INSTRUMENTATION_SYMBOL] = {
      span,
      spanKind: SpanKind.CLIENT,
      startTime,
      oldMetricAttributes,
      stableMetricAttributes,
    };

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
    const spanDetails = request[INSTRUMENTATION_SYMBOL];

    if (spanDetails?.span === undefined) {
      return;
    }
    if (!spanDetails.stableMetricAttributes) {
      spanDetails.stableMetricAttributes = {};
    }
    spanDetails.stableMetricAttributes[ATTR_ERROR_TYPE] = message.error.name;
    setSpanWithError(spanDetails.span, message.error, this._semconvStability);
    this._closeHttpSpan(request);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _httpClientResponseFinished(message: any) {
    if (!this.isEnabled()) {
      return;
    }
    const req = message.request as TracedClientRequest;
    const spanDetails = req[INSTRUMENTATION_SYMBOL];

    if (spanDetails?.span === undefined) {
      return;
    }

    const span = spanDetails.span;
    const response = message.response as http.IncomingMessage;

    const attributes = getOutgoingRequestAttributesOnResponse(
      req,
      response,
      this._semconvStability,
      this.getConfig().redactedQueryParams
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

    if (this._semconvStability & SemconvStability.OLD) {
      const currentOldAttributes = spanDetails.oldMetricAttributes;

      spanDetails.oldMetricAttributes = Object.assign(
        currentOldAttributes ?? {},
        getOutgoingRequestMetricAttributesOnResponse(attributes)
      );
    }

    if (this._semconvStability & SemconvStability.STABLE) {
      const currentStableAttributes = spanDetails.stableMetricAttributes;

      spanDetails.stableMetricAttributes = Object.assign(
        currentStableAttributes ?? {},
        getOutgoingStableRequestMetricAttributesOnResponse(attributes)
      );
    }

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

    this._closeHttpSpan(req);
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

    const spanDetails = response[INSTRUMENTATION_SYMBOL];
    if (spanDetails) {
      if (this._semconvStability & SemconvStability.OLD) {
        const currentOldAttributes = spanDetails.oldMetricAttributes;

        spanDetails.oldMetricAttributes = Object.assign(
          currentOldAttributes ?? {},
          getIncomingRequestMetricAttributesOnResponse(attributes)
        );
      }

      if (this._semconvStability & SemconvStability.STABLE) {
        const currentStableAttributes = spanDetails.stableMetricAttributes;

        spanDetails.stableMetricAttributes = Object.assign(
          currentStableAttributes ?? {},
          getIncomingStableRequestMetricAttributesOnResponse(attributes)
        );
      }
    }

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

    this._closeHttpSpan(response);
  }

  private _startHttpSpan(
    name: string,
    options: SpanOptions,
    ctx = context.active()
  ) {
    /*
     * If a parent is required but not present, we use a `NoopSpan` to still
     * propagate context without recording it.
     */
    const requireParent =
      options.kind === SpanKind.CLIENT
        ? this.getConfig().requireParentforOutgoingSpans
        : this.getConfig().requireParentforIncomingSpans;

    let span: Span;
    const currentSpan = trace.getSpan(ctx);

    if (requireParent === true && currentSpan === undefined) {
      span = trace.wrapSpanContext(INVALID_SPAN_CONTEXT);
    } else if (requireParent === true && currentSpan?.spanContext().isRemote) {
      span = currentSpan;
    } else {
      span = this.tracer.startSpan(name, options, ctx);
    }
    return span;
  }

  private _closeHttpSpan(traced: WithInstrumentation) {
    const spanDetails = traced[INSTRUMENTATION_SYMBOL];

    if (!spanDetails) {
      return;
    }

    spanDetails.span?.end();

    const { startTime, oldMetricAttributes, stableMetricAttributes, spanKind } =
      spanDetails;

    if (
      startTime === undefined ||
      spanKind === undefined ||
      (oldMetricAttributes === undefined &&
        stableMetricAttributes === undefined)
    ) {
      delete traced[INSTRUMENTATION_SYMBOL];
      return;
    }
    // Record metrics
    const duration = hrTimeToMilliseconds(hrTimeDuration(startTime, hrTime()));
    if (spanKind === SpanKind.SERVER) {
      this._recordServerDuration(
        duration,
        oldMetricAttributes,
        stableMetricAttributes
      );
    } else if (spanKind === SpanKind.CLIENT) {
      this._recordClientDuration(
        duration,
        oldMetricAttributes,
        stableMetricAttributes
      );
    }

    delete traced[INSTRUMENTATION_SYMBOL];
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
