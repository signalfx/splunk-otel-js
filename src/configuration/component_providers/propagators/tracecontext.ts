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

import { W3CTraceContextPropagator } from '@opentelemetry/core';
import { ComponentProviderRegistry } from '../../ComponentProviderRegistry';
import { TraceContextPropagator } from '../../schema';

export class TraceContextPropagatorProvider {
  readonly type = 'propagator';
  readonly name = 'tracecontext';

  create(
    _config: TraceContextPropagator,
    _providerRegistry: ComponentProviderRegistry
  ) {
    return new W3CTraceContextPropagator();
  }
}
