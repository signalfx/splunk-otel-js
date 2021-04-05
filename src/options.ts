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

import { env } from 'process';
import {
  BatchSpanProcessor,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/tracing';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';

import { getInstrumentations } from './instrumentations';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { EnvResourceDetector } from './resource';
import { NodeTracerConfig } from '@opentelemetry/node';
import { TextMapPropagator } from '@opentelemetry/api';
import { CompositePropagator, HttpTraceContext } from '@opentelemetry/core';

const defaultEndpoint = 'http://localhost:9080/v1/trace';
const defaultServiceName = 'unnamed-node-service';
const defaultMaxAttrLength = 1200;

type SpanExporterFactory = (options: Options) => SpanExporter;

type SpanProcessorFactory = (
  options: Options
) => SpanProcessor | SpanProcessor[];

type PropagatorFactory = (options: Options) => TextMapPropagator;

export interface Options {
  endpoint: string;
  serviceName: string;
  accessToken: string;
  maxAttrLength: number;
  serverTimingEnabled: boolean;
  instrumentations: InstrumentationOption[];
  tracerConfig: NodeTracerConfig;
  spanExporterFactory: SpanExporterFactory;
  spanProcessorFactory: SpanProcessorFactory;
  propagatorFactory: PropagatorFactory;
}

export function _setDefaultOptions(options: Partial<Options> = {}): Options {
  options.accessToken =
    options.accessToken || process.env.SPLUNK_ACCESS_TOKEN || '';

  if (!options.maxAttrLength) {
    const maxAttrLength = parseInt(process.env.SPLUNK_MAX_ATTR_LENGTH || '');
    if (!isNaN(maxAttrLength)) {
      options.maxAttrLength = maxAttrLength;
    } else {
      options.maxAttrLength = defaultMaxAttrLength;
    }
  }

  if (options.serverTimingEnabled === undefined) {
    options.serverTimingEnabled = getEnvBoolean(
      'SPLUNK_CONTEXT_SERVER_TIMING_ENABLED',
      true
    );
  }

  options.serviceName =
    options.serviceName || env.SPLUNK_SERVICE_NAME || defaultServiceName;
  options.endpoint =
    options.endpoint || env.OTEL_EXPORTER_JAEGER_ENDPOINT || defaultEndpoint;

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
  options.propagatorFactory =
    options.propagatorFactory || defaultPropagatorFactory;

  // instrumentations
  if (options.instrumentations === undefined) {
    options.instrumentations = getInstrumentations();
  }

  return {
    endpoint: options.endpoint,
    serviceName: options.serviceName,
    accessToken: options.accessToken,
    maxAttrLength: options.maxAttrLength,
    serverTimingEnabled: options.serverTimingEnabled,
    instrumentations: options.instrumentations,
    tracerConfig: tracerConfig,
    spanExporterFactory: options.spanExporterFactory,
    spanProcessorFactory: options.spanProcessorFactory,
    propagatorFactory: options.propagatorFactory,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultPropagatorFactory(options: Options): TextMapPropagator {
  return new CompositePropagator({
    propagators: [
      new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
      new HttpTraceContext(),
    ],
  });
}

function getEnvBoolean(key: string, defaultValue = true) {
  const value = process.env[key];

  if (value === undefined) {
    return defaultValue;
  }

  if (['false', 'no', '0'].indexOf(value.trim().toLowerCase()) >= 0) {
    return false;
  }

  return true;
}
