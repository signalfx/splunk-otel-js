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

import { Options } from '../options';
import { ServerResponse } from 'http';
import {
  HttpInstrumentationConfig,
  HttpResponseCustomAttributeFunction,
} from '@opentelemetry/instrumentation-http';
import { isSpanContextValid } from '@opentelemetry/api';

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
    typeof instrumentation['_getConfig'] !== 'function'
  ) {
    return;
  }

  const responseHook: HttpResponseCustomAttributeFunction = (
    span,
    response
  ) => {
    if (response instanceof ServerResponse) {
      const spanContext = span.context();

      if (isSpanContextValid(spanContext)) {
        const { traceId, spanId } = spanContext;
        appendHeader(
          response,
          'Access-Control-Expose-Headers',
          'Server-Timing'
        );
        appendHeader(
          response,
          'Server-Timing',
          `traceparent;desc="00-${traceId}-${spanId}-01"`
        );
      }
    }
  };

  let config = instrumentation._getConfig() as HttpInstrumentationConfig;

  if (config === undefined) {
    config = { responseHook };
  } else if (config.responseHook !== undefined) {
    const original = config.responseHook;
    config.responseHook = function (this: unknown, span, response) {
      responseHook(span, response);
      original.call(this, span, response);
    };
  } else {
    config.responseHook = responseHook;
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
