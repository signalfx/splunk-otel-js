/*
 * Copyright 2021 Splunk Inc.
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

import {
  BatchSpanProcessor,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/tracing';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { env } from 'process';

import { getInstrumentations } from './instrumentations';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { EnvResourceDetector } from './resource';
import { NodeTracerConfig } from '@opentelemetry/node';

const defaultEndpoint = 'http://localhost:9080/v1/trace';
const defaultServiceName = 'unnamed-node-service';
const defaultMaxAttrLength = 1200;

type SpanExporterFactory = (options: Options) => SpanExporter;

type SpanProcessorFactory = (
  options: Options
) => SpanProcessor | SpanProcessor[];

export interface Options {
  endpoint: string;
  serviceName: string;
  accessToken: string;
  maxAttrLength: number;
  instrumentations: InstrumentationOption[];
  tracerConfig: NodeTracerConfig;
  spanExporterFactory: SpanExporterFactory;
  spanProcessorFactory: SpanProcessorFactory;
}

export function _setDefaultOptions(options: Partial<Options> = {}): Options {
  options.accessToken =
    options.accessToken || process.env.SPLK_ACCESS_TOKEN || '';

  if (!options.maxAttrLength) {
    const maxAttrLength = parseInt(process.env.SPLK_MAX_ATTR_LENGTH || '');
    if (!isNaN(maxAttrLength)) {
      options.maxAttrLength = maxAttrLength;
    } else {
      options.maxAttrLength = defaultMaxAttrLength;
    }
  }

  options.serviceName =
    options.serviceName || env.SPLK_SERVICE_NAME || defaultServiceName;
  options.endpoint =
    options.endpoint || env.SPLK_TRACE_EXPORTER_URL || defaultEndpoint;

  const extraTracerConfig = options.tracerConfig || {};
  const tracerConfig = {
    resource: new EnvResourceDetector().detect(),
    ...extraTracerConfig,
  };

  // factories
  options.spanExporterFactory =
    options.spanExporterFactory || defaultSpanExporterFactory;
  options.spanProcessorFactory =
    options.spanProcessorFactory || defaultSpanProcessorFactory;

  // instrumentations
  if (options.instrumentations === undefined) {
    options.instrumentations = getInstrumentations();
  }

  return {
    endpoint: options.endpoint,
    serviceName: options.serviceName,
    accessToken: options.accessToken,
    maxAttrLength: options.maxAttrLength,
    instrumentations: options.instrumentations,
    tracerConfig: tracerConfig,
    spanExporterFactory: options.spanExporterFactory,
    spanProcessorFactory: options.spanProcessorFactory,
  };
}

export function defaultSpanExporterFactory(options: Options): JaegerExporter {
  const jaegerOptions = {
    serviceName: options.serviceName!,
    endpoint: options.endpoint,
    tags: [],
    username: '',
    password: '',
  };

  if (options.accessToken) {
    jaegerOptions.username = 'auth';
    jaegerOptions.password = options.accessToken;
  }

  return new JaegerExporter(jaegerOptions);
}

export function defaultSpanProcessorFactory(options: Options): SpanProcessor {
  return new BatchSpanProcessor(options.spanExporterFactory(options));
}
