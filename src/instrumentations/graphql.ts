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

import { Options } from '../tracing/options';
import { getEnvBoolean } from '../utils';
import type {
  GraphQLInstrumentation,
  GraphQLInstrumentationConfig,
} from '@opentelemetry/instrumentation-graphql';

export function configureGraphQlInstrumentation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instrumentation: any,
  _options: Options
) {
  if (getEnvBoolean('SPLUNK_GRAPHQL_RESOLVE_SPANS_ENABLED', false)) {
    return;
  }

  const qglInstrumentation = instrumentation as GraphQLInstrumentation;

  const config: GraphQLInstrumentationConfig = {
    ...qglInstrumentation.getConfig(),
    ignoreResolveSpans: true,
  };

  qglInstrumentation.setConfig(config);
}
