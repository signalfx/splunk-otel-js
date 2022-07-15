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
import {
  ConsoleSpanExporter,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { InstrumentationOption } from '@opentelemetry/instrumentation';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';

import { getInstrumentations } from '../instrumentations';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
// eslint-disable-next-line node/no-extraneous-import
import { Metadata } from '@grpc/grpc-js';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { detect as detectResource } from '../resource';
import { deduplicate, defaultServiceName, getEnvBoolean } from '../utils';
import { NodeTracerConfig } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { diag, Span, TextMapPropagator } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { SplunkBatchSpanProcessor } from './SplunkBatchSpanProcessor';
import { Resource } from '@opentelemetry/resources';

type SpanExporterFactory = (options: Options) => SpanExporter;

type SpanProcessorFactory = (
  options: Options
) => SpanProcessor | SpanProcessor[];

type PropagatorFactory = (options: Options) => TextMapPropagator;

export type CaptureHttpUriParameters = (
  span: Span,
  params: Record<string, string | string[] | undefined>
) => void;

export interface Options {
  accessToken: string;
  endpoint?: string;
  serviceName: string;
  // Tracing-specific configuration options:
  captureHttpRequestUriParams: string[] | CaptureHttpUriParameters;
  instrumentations: InstrumentationOption[];
  propagatorFactory: PropagatorFactory;
  serverTimingEnabled: boolean;
  spanExporterFactory: SpanExporterFactory;
  spanProcessorFactory: SpanProcessorFactory;
  tracerConfig: NodeTracerConfig;
}

export const allowedTracingOptions = [
  'accessToken',
  'captureHttpRequestUriParams',
  'endpoint',
  'instrumentations',
  'propagatorFactory',
  'serverTimingEnabled',
  'serviceName',
  'spanExporterFactory',
  'spanProcessorFactory',
  'tracerConfig',
];

export function _setDefaultOptions(options: Partial<Options> = {}): Options {
  process.env.OTEL_SPAN_LINK_COUNT_LIMIT =
    process.env.OTEL_SPAN_LINK_COUNT_LIMIT ?? '1000';
  process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT =
    process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT ?? '12000';

  options.accessToken =
    options.accessToken || process.env.SPLUNK_ACCESS_TOKEN || '';

  if (options.serverTimingEnabled === undefined) {
    options.serverTimingEnabled = getEnvBoolean(
      'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED',
      true
    );
  }

  const extraTracerConfig = options.tracerConfig || {};

  let resource = detectResource();

  const serviceName =
    options.serviceName ||
    process.env.OTEL_SERVICE_NAME ||
    resource.attributes[SemanticResourceAttributes.SERVICE_NAME];

  if (!serviceName) {
    diag.warn(
      'service.name attribute is not set, your service is unnamed and will be difficult to identify. ' +
        'Set your service name using the OTEL_RESOURCE_ATTRIBUTES environment variable. ' +
        'E.g. OTEL_RESOURCE_ATTRIBUTES="service.name=<YOUR_SERVICE_NAME_HERE>"'
    );
  }

  resource = resource.merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        serviceName || defaultServiceName,
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

  options.propagatorFactory =
    options.propagatorFactory || defaultPropagatorFactory;

  // instrumentations
  if (options.instrumentations === undefined) {
    options.instrumentations = getInstrumentations();
  }

  if (options.instrumentations.length === 0) {
    diag.warn(
      'No instrumentations set to be loaded. Install an instrumentation package to enable auto-instrumentation.'
    );
  }

  if (options.captureHttpRequestUriParams === undefined) {
    options.captureHttpRequestUriParams = [];
  }

  return {
    endpoint: options.endpoint,
    serviceName: String(
      resource.attributes[SemanticResourceAttributes.SERVICE_NAME]
    ),
    accessToken: options.accessToken,
    serverTimingEnabled: options.serverTimingEnabled,
    instrumentations: options.instrumentations,
    tracerConfig: tracerConfig,
    spanExporterFactory: options.spanExporterFactory,
    spanProcessorFactory: options.spanProcessorFactory,
    propagatorFactory: options.propagatorFactory,
    captureHttpRequestUriParams: options.captureHttpRequestUriParams,
  };
}

export function resolveTracesExporter(): SpanExporterFactory {
  const factory =
    SpanExporterMap[process.env.OTEL_TRACES_EXPORTER || 'default'];
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
  const metadata = new Metadata();
  if (options.accessToken) {
    // for forward compatibility, is not currently supported
    metadata.set('X-SF-TOKEN', options.accessToken);
  }
  return new OTLPTraceExporter({
    url: options.endpoint,
    metadata,
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

export function consoleSpanExporterFactory(): SpanExporter {
  return new ConsoleSpanExporter();
}

const SpanExporterMap: Record<string, SpanExporterFactory> = {
  default: otlpSpanExporterFactory,
  'console-splunk': consoleSpanExporterFactory,
  'jaeger-thrift-http': jaegerSpanExporterFactory,
  'jaeger-thrift-splunk': splunkSpanExporterFactory,
  otlp: otlpSpanExporterFactory,
  'otlp-grpc': otlpSpanExporterFactory,
};

// Temporary workaround until https://github.com/open-telemetry/opentelemetry-js/issues/3094 is resolved
function getBatchSpanProcessorConfig() {
  // OTel uses its own parsed environment, we can just use the default env if the BSP delay is unset.
  if (process.env.OTEL_BSP_SCHEDULE_DELAY !== undefined) {
    return undefined;
  }

  return { scheduledDelayMillis: 500 };
}

export function defaultSpanProcessorFactory(options: Options): SpanProcessor {
  return new SplunkBatchSpanProcessor(
    options.spanExporterFactory(options),
    getBatchSpanProcessorConfig()
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultPropagatorFactory(options: Options): TextMapPropagator {
  const propagatorsStr = process.env.OTEL_PROPAGATORS ?? 'tracecontext,baggage';
  assert.equal(
    typeof propagatorsStr,
    'string',
    'Expecting OTEL_PROPAGATORS environment variable to be a comma-delimited string.'
  );
  const propagators = [];
  for (const propagator of deduplicate(propagatorsStr.split(','))) {
    switch (propagator) {
      case 'baggage':
        propagators.push(new W3CBaggagePropagator());
        break;
      case 'tracecontext':
        propagators.push(new W3CTraceContextPropagator());
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
