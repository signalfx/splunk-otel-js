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

import type {
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import type { NodeTracerConfig } from '@opentelemetry/sdk-trace-node';
import type { Span, TextMapPropagator } from '@opentelemetry/api';
import type { Instrumentation } from '@opentelemetry/instrumentation';
import type { ResourceFactory } from '../types';

export type SpanExporterFactory = (
  options: TracingOptions
) => SpanExporter | SpanExporter[];

export type SpanProcessorFactory = (
  options: TracingOptions
) => SpanProcessor | SpanProcessor[];

export type PropagatorFactory = (options: TracingOptions) => TextMapPropagator;

export type CaptureHttpUriParameters = (
  span: Span,
  params: Record<string, string | string[] | undefined>
) => void;

export interface TracingOptions {
  accessToken: string;
  realm?: string;
  endpoint?: string;
  serviceName: string;
  // Tracing-specific configuration options:
  captureHttpRequestUriParams: string[] | CaptureHttpUriParameters;
  instrumentations: (Instrumentation | Instrumentation[])[];
  propagatorFactory: PropagatorFactory;
  serverTimingEnabled: boolean;
  spanExporterFactory: SpanExporterFactory;
  spanProcessorFactory: SpanProcessorFactory;
  tracerConfig: NodeTracerConfig;
}

export type StartTracingOptions = Partial<TracingOptions> & {
  resourceFactory?: ResourceFactory;
};
