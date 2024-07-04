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

import { Options, CaptureHttpUriParameters } from '../tracing/options';
import { IncomingMessage, ServerResponse } from 'http';
import {
  HttpInstrumentationConfig,
  HttpResponseCustomAttributeFunction,
  HttpRequestCustomAttributeFunction,
} from '@opentelemetry/instrumentation-http';
import { diag, isSpanContextValid, TraceFlags } from '@opentelemetry/api';
import { Span } from '@opentelemetry/api';
import * as Url from 'url';

type IncomingHttpRequestHook = (span: Span, request: IncomingMessage) => void;

function shouldAddRequestHook(options: Options): boolean {
  if (
    Array.isArray(options.captureHttpRequestUriParams) &&
    options.captureHttpRequestUriParams.length === 0
  ) {
    return false;
  }

  return true;
}

function parseUrlParams(request: IncomingMessage) {
  if (request.url === undefined) {
    return {};
  }

  try {
    // As long as Node <11 is supported, need to use the legacy API.
    return Url.parse(request.url || '', true).query;
  } catch (err) {
    diag.debug(`error parsing url '${request.url}`, err);
  }

  return {};
}

function captureUriParamByKeys(keys: string[]): IncomingHttpRequestHook {
  const capturedKeys = new Map(keys.map((k) => [k, k.replace(/\./g, '_')]));

  return (span, request) => {
    const params = parseUrlParams(request);

    for (const [key, normalizedKey] of capturedKeys) {
      const value = params[key];

      if (value === undefined) {
        continue;
      }

      const values = Array.isArray(value) ? value : [value];

      if (values.length > 0) {
        span.setAttribute(`http.request.param.${normalizedKey}`, values);
      }
    }
  };
}

function captureUriParamByFunction(
  process: CaptureHttpUriParameters
): IncomingHttpRequestHook {
  return (span, request) => {
    const params = parseUrlParams(request);
    process(span, params);
  };
}

function createHttpRequestHook(
  options: Options
): HttpRequestCustomAttributeFunction {
  const incomingRequestHooks: IncomingHttpRequestHook[] = [];

  if (Array.isArray(options.captureHttpRequestUriParams)) {
    incomingRequestHooks.push(
      captureUriParamByKeys(options.captureHttpRequestUriParams)
    );
  } else {
    incomingRequestHooks.push(
      captureUriParamByFunction(options.captureHttpRequestUriParams)
    );
  }

  return (span, request) => {
    const spanContext = span.spanContext();

    if (!isSpanContextValid(spanContext)) {
      return;
    }

    if (request instanceof IncomingMessage) {
      for (const hook of incomingRequestHooks) {
        hook(span, request);
      }
    }
  };
}

export function configureHttpInstrumentation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instrumentation: any,
  options: Options
) {
  if (!options.serverTimingEnabled) {
    return;
  }

  if (
    typeof instrumentation['setConfig'] !== 'function' ||
    typeof instrumentation['getConfig'] !== 'function'
  ) {
    return;
  }

  const responseHook: HttpResponseCustomAttributeFunction = (
    span,
    response
  ) => {
    if (!(response instanceof ServerResponse)) {
      return;
    }

    const spanContext = span.spanContext();

    if (!isSpanContextValid(spanContext)) {
      return;
    }

    const { traceFlags, traceId, spanId } = spanContext;
    const sampled = (traceFlags & TraceFlags.SAMPLED) === TraceFlags.SAMPLED;
    const flags = sampled ? '01' : '00';

    appendHeader(response, 'Access-Control-Expose-Headers', 'Server-Timing');
    appendHeader(
      response,
      'Server-Timing',
      `traceparent;desc="00-${traceId}-${spanId}-${flags}"`
    );
  };

  let config = instrumentation.getConfig() as HttpInstrumentationConfig;

  if (config === undefined) {
    config = {};
  }

  if (config.responseHook === undefined) {
    config.responseHook = responseHook;
  } else {
    const original = config.responseHook;
    config.responseHook = function (this: unknown, span, response) {
      responseHook(span, response);
      original.call(this, span, response);
    };
  }

  if (shouldAddRequestHook(options)) {
    const requestHook = createHttpRequestHook(options);
    if (config.requestHook === undefined) {
      config.requestHook = requestHook;
    } else {
      const original = config.requestHook;
      config.requestHook = function (this: unknown, span, request) {
        requestHook(span, request);
        original.call(this, span, request);
      };
    }
  }

  instrumentation.setConfig(config);
}

function appendHeader(response: ServerResponse, header: string, value: string) {
  const existing = response.getHeader(header);

  if (existing === undefined) {
    response.setHeader(header, value);
    return;
  }

  if (typeof existing === 'string') {
    response.setHeader(header, `${existing}, ${value}`);
    return;
  }

  if (Array.isArray(existing)) {
    existing.push(value);
  }
}
