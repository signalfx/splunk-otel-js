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
import { Span } from '@opentelemetry/sdk-trace-base';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LogRecord = Record<string, any>;

export const defaultLogHook = (span: Span, record: LogRecord) => {
  record['service.name'] =
    span.resource.attributes[SemanticResourceAttributes.SERVICE_NAME];

  const version =
    span.resource.attributes[SemanticResourceAttributes.SERVICE_VERSION];
  if (version !== undefined) {
    record['service.version'] = version;
  }

  const environment =
    span.resource.attributes[
      SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT
    ];
  if (environment !== undefined) {
    record['service.environment'] = environment;
  }
};

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

  const config = instrumentation.getConfig();

  if (config === undefined) {
    return instrumentation.setConfig({ logHook: defaultLogHook });
  }

  if (config.logHook === undefined) {
    config.logHook = defaultLogHook;
    return instrumentation.setConfig(config);
   }
}
