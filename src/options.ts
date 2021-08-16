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
import * as assert from 'assert';
import * as util from 'util';

import * as assert from 'assert';

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

export interface Options {
  endpoint?: string;
  serviceName: string;
  accessToken: string;
  maxAttrLength: number;
  serverTimingEnabled: boolean;
  logInjectionEnabled: boolean;
  instrumentations: InstrumentationOption[];
  tracerConfig: NodeTracerConfig;
  spanExporterFactory: SpanExporterFactory;
  spanProcessorFactory: SpanProcessorFactory;
  propagatorFactory: PropagatorFactory;
  propagators: string;
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

  const extraTracerConfig = options.tracerConfig || {};

  let resource = new EnvResourceDetector().detect();

  const serviceName =
    options.serviceName ||
    process.env.OTEL_SERVICE_NAME ||
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

  // factories
  if (options.spanExporterFactory === undefined) {
    options.spanExporterFactory = resolveTracesExporter();
  }
  options.spanProcessorFactory =
    options.spanProcessorFactory || defaultSpanProcessorFactory;

  options.propagators =
    options.propagators ??
    process.env.OTEL_PROPAGATORS ??
    'tracecontext,baggage';
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
    spanExporterFactory: options.spanExporterFactory,
    spanProcessorFactory: options.spanProcessorFactory,
    propagatorFactory: options.propagatorFactory,
    propagators: options.propagators,
  };
}

export function resolveTracesExporter(): SpanExporterFactory {
  const factory =
    SpanExporterMap[process.env.OTEL_TRACES_EXPORTER ?? 'default'];
  assert.strictEqual(
    typeof factory,
    'function',
    `Invalid value for OTEL_TRACES_EXPORTER env variable: ${util.inspect(
      process.env.OTEL_TRACES_EXPORTER
    )}. Pick one of ${util.inspect(Object.keys(SpanExporterMap), {
      compact: true,
    })} or leave undefined.`
  );
  return factory;
}

export function otlpSpanExporterFactory(options: Options): SpanExporter {
  return new CollectorTraceExporter({
    url: options.endpoint,
    headers: {
      'X-SF-TOKEN': options.accessToken,
    },
  });
}

function genericJaegerSpanExporterFactory(
  defaultEndpoint: string,
  options: Options
): SpanExporter {
  const jaegerOptions = {
    serviceName: options.serviceName!,
    endpoint:
      options.endpoint ??
      process.env.OTEL_EXPORTER_JAEGER_ENDPOINT ??
      defaultEndpoint,
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

export const jaegerSpanExporterFactory = genericJaegerSpanExporterFactory.bind(
  null,
  'http://localhost:14268/v1/traces'
);
export const splunkSpanExporterFactory = genericJaegerSpanExporterFactory.bind(
  null,
  'http://localhost:9080/v1/trace'
);

const SpanExporterMap: Record<string, SpanExporterFactory> = {
  default: otlpSpanExporterFactory,
  'jaeger-thrift-http': jaegerSpanExporterFactory,
  'jaeger-thrift-splunk': splunkSpanExporterFactory,
  otlp: otlpSpanExporterFactory,
  'otlp-http': otlpSpanExporterFactory,
};

export function defaultSpanProcessorFactory(options: Options): SpanProcessor {
  return new SplunkBatchSpanProcessor(options.spanExporterFactory(options));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultPropagatorFactory(options: Options): TextMapPropagator {
  assert.equal(
    typeof options.propagators,
    'string',
    'Expecting "propagators" configuration option to be a comma-delimited string. Set '
  );
  const propagators = [];
  for (const propagator of deduplicate(options.propagators.split(','))) {
    switch (propagator) {
      case 'baggage':
        propagators.push(new HttpBaggagePropagator());
        break;
      case 'tracecontext':
        propagators.push(new HttpTraceContextPropagator());
        break;
      case 'b3multi':
        propagators.push(
          new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
        );
        break;
      case 'b3':
        propagators.push(new B3Propagator());
        break;
    }
  }
  return new CompositePropagator({
    propagators,
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

function deduplicate(arr: string[]) {
  return [...new Set(arr)];
}
