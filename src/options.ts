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

import { SpanExporter, SpanProcessor } from '@opentelemetry/tracing';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';

import { getInstrumentations } from './instrumentations';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector-proto';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { EnvResourceDetector } from './resource';
import { NodeTracerConfig } from '@opentelemetry/node';
import { ResourceAttributes } from '@opentelemetry/semantic-conventions';
import { TextMapPropagator } from '@opentelemetry/api';
import {
  CompositePropagator,
  getEnv,
  HttpBaggagePropagator,
  HttpTraceContextPropagator,
} from '@opentelemetry/core';
import { SplunkBatchSpanProcessor } from './SplunkBatchSpanProcessor';
import { Resource } from '@opentelemetry/resources';

const defaultServiceName = 'unnamed-node-service';
const defaultMaxAttrLength = 1200;

type SpanExporterFactory = (options: Options) => SpanExporter;

type SpanProcessorFactory = (
  options: Options
) => SpanProcessor | SpanProcessor[];

type PropagatorFactory = (options: Options) => TextMapPropagator;

export enum TracesExporter {
  JAEGER = 'jaeger',
  JAEGER_THRIFT_SPLUNK = 'jaeger-thrift-splunk',
  OTLP = 'otlp',
}

export interface Options {
  endpoint?: string;
  serviceName: string;
  accessToken: string;
  maxAttrLength: number;
  serverTimingEnabled: boolean;
  logInjectionEnabled: boolean;
  instrumentations: InstrumentationOption[];
  tracesExporter: TracesExporter;
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
      'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED',
      true
    );
  }

  if (options.logInjectionEnabled === undefined) {
    options.logInjectionEnabled = getEnvBoolean('SPLUNK_LOGS_INJECTION', false);
  }

  const otelEnv = getEnv();

  const extraTracerConfig = options.tracerConfig || {};

  let resource = new EnvResourceDetector().detect();

  const serviceName =
    options.serviceName ||
    otelEnv.OTEL_SERVICE_NAME ||
    resource.attributes[ResourceAttributes.SERVICE_NAME] ||
    defaultServiceName;

  resource = resource.merge(
    new Resource({
      [ResourceAttributes.SERVICE_NAME]: serviceName,
    })
  );

  const tracerConfig = {
    resource,
    ...extraTracerConfig,
  };

  if (options.tracesExporter === undefined) {
    options.tracesExporter = (process.env.OTEL_TRACES_EXPORTER ||
      TracesExporter.OTLP) as TracesExporter;
  }

  // factories
  if (options.spanExporterFactory === undefined) {
    if (options.tracesExporter === TracesExporter.JAEGER) {
      options.spanExporterFactory = jaegerSpanExporterFactory;
      options.endpoint =
        options.endpoint ||
        otelEnv.OTEL_EXPORTER_JAEGER_ENDPOINT ||
        'http://localhost:14268/v1/traces';
    } else if (options.tracesExporter === TracesExporter.JAEGER_THRIFT_SPLUNK) {
      options.spanExporterFactory = jaegerSpanExporterFactory;
      options.endpoint =
        options.endpoint ||
        otelEnv.OTEL_EXPORTER_JAEGER_ENDPOINT ||
        'http://localhost:9080/v1/trace';
    } else {
      options.spanExporterFactory = defaultSpanExporterFactory;
    }
  }
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
    serviceName: String(resource.attributes[ResourceAttributes.SERVICE_NAME]),
    accessToken: options.accessToken,
    maxAttrLength: options.maxAttrLength,
    serverTimingEnabled: options.serverTimingEnabled,
    logInjectionEnabled: options.logInjectionEnabled,
    instrumentations: options.instrumentations,
    tracerConfig: tracerConfig,
    tracesExporter: options.tracesExporter,
    spanExporterFactory: options.spanExporterFactory,
    spanProcessorFactory: options.spanProcessorFactory,
    propagatorFactory: options.propagatorFactory,
  };
}

export function defaultSpanExporterFactory(options: Options): SpanExporter {
  return new CollectorTraceExporter({
    url: options.endpoint,
    headers: {
      'X-SF-TOKEN': options.accessToken,
    },
  });
}

export function jaegerSpanExporterFactory(options: Options): SpanExporter {
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
  return new SplunkBatchSpanProcessor(options.spanExporterFactory(options));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultPropagatorFactory(options: Options): TextMapPropagator {
  return new CompositePropagator({
    propagators: [
      new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER }),
      new HttpBaggagePropagator(),
      new HttpTraceContextPropagator(),
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
