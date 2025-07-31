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

import { ComponentProviderRegistry } from './ComponentProviderRegistry';
import {
  OpenTelemetryConfiguration,
  SpanProcessor,
  TextMapPropagator,
} from './schema';

export type TypeComponentConfigMapping = {
  sdk: {
    sdk: OpenTelemetryConfiguration;
  };
  propagator: TextMapPropagator;
  span_procssor: SpanProcessor;
  [k: string]: {
    [k: string]: unknown;
  };
};
export type ComponentTypes = keyof TypeComponentConfigMapping;

export interface ComponentProvider<
  T extends ComponentTypes = ComponentTypes,
  N extends string = string,
> {
  readonly type: T;
  readonly name: N;

  create(
    config: TypeComponentConfigMapping[T][N],
    providerRegistry: ComponentProviderRegistry
  ): unknown;
}
