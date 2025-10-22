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

import { TextMapPropagator } from '@opentelemetry/api';
import { ComponentProviderRegistry } from './ComponentProviderRegistry';
import {
  ExperimentalResourceDetector,
  OpenTelemetryConfiguration,
  SpanProcessor as SchemaSpanProcessor,
  TextMapPropagator as SchemaTextMapPropagator,
  SpanExporter as SchemaSpanExporter,
} from './schema';
import { SDK } from './SDK';
import { ResourceDetector } from '@opentelemetry/resources';
import { SpanExporter, SpanProcessor } from '@opentelemetry/sdk-trace-base';

export type TypeComponentConfigMapping = {
  sdk: {
    sdk: OpenTelemetryConfiguration;
  };
  detector: ExperimentalResourceDetector;
  propagator: SchemaTextMapPropagator;
  span_procssor: SchemaSpanProcessor;
  span_exporter: SchemaSpanExporter;
  [k: string]: {
    [k: string]: unknown;
  };
};
export type TypeReturnMapping = {
  sdk: SDK;
  detector: ResourceDetector;
  propagator: TextMapPropagator;
  span_processor: SpanProcessor;
  span_exporter: SpanExporter;
  [k: string]: unknown;
}
export type ComponentTypes = keyof TypeComponentConfigMapping;

export interface ComponentProvider<
  T extends ComponentTypes = ComponentTypes,
  N extends string = string,
> {
  readonly type: T;
  readonly name: N;

  create(
    config: TypeComponentConfigMapping[T][N],
    providerRegistry: ComponentProviderRegistry,
    context: Record<string, unknown>,
  ): TypeReturnMapping[T];
}
