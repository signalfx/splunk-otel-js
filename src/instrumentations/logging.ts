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

import { Span } from '@opentelemetry/api';
import { Span as SdkSpan } from '@opentelemetry/sdk-trace-base';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  SEMRESATTRS_DEPLOYMENT_ENVIRONMENT,
} from '@opentelemetry/semantic-conventions';
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan';
import { getConfigBoolean } from '../configuration';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogRecord = Record<string, any>;

export const defaultLogHook = (span: Span, record: LogRecord) => {
  const sdkSpan = span as SdkSpan;

  record['service.name'] = sdkSpan.resource.attributes[ATTR_SERVICE_NAME];

  const version = sdkSpan.resource.attributes[ATTR_SERVICE_VERSION];
  if (version !== undefined) {
    record['service.version'] = version;
  }

  const environment =
    sdkSpan.resource.attributes[SEMRESATTRS_DEPLOYMENT_ENVIRONMENT];
  if (environment !== undefined) {
    record['service.environment'] = environment;
  }
};

export function configureLogInjection(
  instrumentation:
    | WinstonInstrumentation
    | BunyanInstrumentation
    | PinoInstrumentation
) {
  const config = instrumentation.getConfig();

  if (config === undefined) {
    return instrumentation.setConfig({ logHook: defaultLogHook });
  }

  if (config.logHook === undefined) {
    config.logHook = defaultLogHook;
    return instrumentation.setConfig(config);
  }
}

export function disableLogSending(
  instrumentation: WinstonInstrumentation | BunyanInstrumentation
) {
  const enabled = getConfigBoolean('SPLUNK_AUTOMATIC_LOG_COLLECTION', false);
  instrumentation.setConfig(
    Object.assign({}, instrumentation.getConfig(), {
      disableLogSending: !enabled,
    })
  );
}
