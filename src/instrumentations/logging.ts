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
import { Span } from '@opentelemetry/tracing';
import { ResourceAttributes } from '@opentelemetry/semantic-conventions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogRecord = Record<string, any>;

export function configureLogInjection(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instrumentation: any,
  options: Options
) {
  if (!options.logInjectionEnabled) {
    return;
  }

  if (
    typeof instrumentation['setConfig'] !== 'function' ||
    typeof instrumentation['getConfig'] !== 'function'
  ) {
    return;
  }

  const logHook = (span: Span, record: LogRecord) => {
    record['service.name'] =
      span.resource.attributes[ResourceAttributes.SERVICE_NAME];
  };

  let config = instrumentation.getConfig();

  if (config === undefined) {
    config = { logHook };
  } else if (config.logHook !== undefined) {
    const original = config.logHook;
    config.logHook = function (this: unknown, span: Span, record: LogRecord) {
      logHook(span, record);
      original.call(this, span, record);
    };
  } else {
    config.logHook = logHook;
  }

  instrumentation.setConfig(config);
}
