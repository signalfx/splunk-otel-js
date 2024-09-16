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
import * as util from 'util';
import {
  ConsoleSpanExporter,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';

import { getInstrumentations } from '../instrumentations';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import type * as OtlpGrpc from '@opentelemetry/exporter-trace-otlp-grpc';
import type * as grpc from '@grpc/grpc-js';
import { detect as detectResource } from '../resource';
import {
  defaultServiceName,
  getEnvArray,
  getEnvValueByPrecedence,
  getNonEmptyEnvVar,
  getEnvBoolean,
} from '../utils';
import { NodeTracerConfig } from '@opentelemetry/sdk-trace-node';
import { SEMRESATTRS_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { diag, Span, TextMapPropagator } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { SplunkBatchSpanProcessor } from './SplunkBatchSpanProcessor';
import { Resource } from '@opentelemetry/resources';
import type { ResourceFactory } from '../types';

type SpanExporterFactory = (options: Options) => SpanExporter | SpanExporter[];

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
  realm?: string;
  endpoint?: string;
  serviceName: string;
  // Tracing-specific configuration options:
  captureHttpRequestUriParams: string[] | CaptureHttpUriParameters;
  instrumentations: (Instrumentation | Instrumentation[])[];
  propagatorFactory: PropagatorFactory;
  resourceFactory: ResourceFactory;
  serverTimingEnabled: boolean;
  spanExporterFactory: SpanExporterFactory;
  spanProcessorFactory: SpanProcessorFactory;
  tracerConfig: NodeTracerConfig;
}

export const allowedTracingOptions = [
  'accessToken',
  'realm',
  'captureHttpRequestUriParams',
  'endpoint',
  'instrumentations',
  'propagatorFactory',
  'resourceFactory',
  'serverTimingEnabled',
  'serviceName',
  'spanExporterFactory',
  'spanProcessorFactory',
  'tracerConfig',
];

export function _setDefaultOptions(options: Partial<Options> = {}): Options {
  process.env.OTEL_SPAN_LINK_COUNT_LIMIT =
    getNonEmptyEnvVar('OTEL_SPAN_LINK_COUNT_LIMIT') ?? '1000';
  process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT =
    getNonEmptyEnvVar('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT') ?? '12000';

  options.accessToken =
    options.accessToken || getNonEmptyEnvVar('SPLUNK_ACCESS_TOKEN') || '';

  options.realm = options.realm || getNonEmptyEnvVar('SPLUNK_REALM');

  if (options.realm) {
    if (!options.accessToken) {
      throw new Error(
        'Splunk realm is set, but access token is unset. To send traces to the Observability Cloud, both need to be set'
      );
    }
  }

  if (options.serverTimingEnabled === undefined) {
    options.serverTimingEnabled = getEnvBoolean(
      'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED',
      true
    );
  }

  const extraTracerConfig = options.tracerConfig || {};

  const envResource = detectResource();

  const resourceFactory = options.resourceFactory || ((r: Resource) => r);
  let resource = resourceFactory(envResource);

  const serviceName =
    options.serviceName ||
    getNonEmptyEnvVar('OTEL_SERVICE_NAME') ||
    resource.attributes[SEMRESATTRS_SERVICE_NAME];

  if (!serviceName) {
    diag.warn(
      'service.name attribute is not set, your service is unnamed and will be difficult to identify. ' +
        'Set your service name using the OTEL_RESOURCE_ATTRIBUTES environment variable. ' +
        'E.g. OTEL_RESOURCE_ATTRIBUTES="service.name=<YOUR_SERVICE_NAME_HERE>"'
    );
  }

  resource = resource.merge(
    new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName || defaultServiceName(),
    })
  );

  const tracerConfig = {
    resource,
    ...extraTracerConfig,
  };

  if (options.spanExporterFactory === undefined) {
    options.spanExporterFactory = defaultSpanExporterFactory(options);
  }

  options.spanProcessorFactory =
    options.spanProcessorFactory || defaultSpanProcessorFactory;

  options.propagatorFactory =
    options.propagatorFactory || defaultPropagatorFactory;

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
    realm: options.realm,
    endpoint: options.endpoint,
    serviceName: String(resource.attributes[SEMRESATTRS_SERVICE_NAME]),
    accessToken: options.accessToken,
    serverTimingEnabled: options.serverTimingEnabled,
    captureHttpRequestUriParams: options.captureHttpRequestUriParams,
    instrumentations: options.instrumentations,
    tracerConfig: tracerConfig,
    spanExporterFactory: options.spanExporterFactory,
    spanProcessorFactory: options.spanProcessorFactory,
    propagatorFactory: options.propagatorFactory,
    resourceFactory,
  };
}

const SUPPORTED_EXPORTER_TYPES = ['console', 'otlp', 'none'];

export type ExporterType = (typeof SUPPORTED_EXPORTER_TYPES)[number];

const SpanExporterMap: Record<ExporterType, SpanExporterFactory> = {
  console: consoleSpanExporterFactory,
  otlp: otlpSpanExporterFactory,
  none: () => [],
};

function containsSupportedRealmExporter(exporterTypes: string[]) {
  return exporterTypes.includes('otlp');
}

function areValidExporterTypes(types: string[]): boolean {
  for (const t of types) {
    if (!SUPPORTED_EXPORTER_TYPES.includes(t)) {
      return false;
    }
  }

  return true;
}

function getExporterTypes(options: Partial<Options>): ExporterType[] {
  const traceExporters: string[] = getEnvArray('OTEL_TRACES_EXPORTER', [
    'otlp',
  ]);

  if (options.realm) {
    if (!containsSupportedRealmExporter(traceExporters)) {
      throw new Error(
        'Setting the Splunk realm with an explicit OTEL_TRACES_EXPORTER requires OTEL_TRACES_EXPORTER to be either otlp or be left undefined'
      );
    }
  }

  if (!areValidExporterTypes(traceExporters)) {
    throw new Error(
      `Invalid value for OTEL_TRACES_EXPORTER env variable: ${util.inspect(
        process.env.OTEL_TRACES_EXPORTER
      )}. Choose from ${util.inspect(SUPPORTED_EXPORTER_TYPES, {
        compact: true,
      })} or leave undefined.`
    );
  }

  return traceExporters;
}

export function defaultSpanExporterFactory(
  options: Partial<Options>
): SpanExporterFactory {
  const exporterTypes = getExporterTypes(options);
  return (options) => {
    const factories = exporterTypes.map((t) => SpanExporterMap[t]);
    return factories.flatMap((factory) => factory(options));
  };
}

export function otlpSpanExporterFactory(options: Options): SpanExporter {
  let protocol = getEnvValueByPrecedence([
    'OTEL_EXPORTER_OTLP_TRACES_PROTOCOL',
    'OTEL_EXPORTER_OTLP_PROTOCOL',
  ]);

  let endpoint =
    options.endpoint ??
    getEnvValueByPrecedence([
      'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
      'OTEL_EXPORTER_OTLP_ENDPOINT',
    ]);

  const accessToken = options.accessToken;

  if (options.realm !== undefined) {
    if (protocol !== undefined && protocol !== 'http/protobuf') {
      diag.warn(
        `OTLP span exporter factory: defaulting protocol to 'http/protobuf' instead of ${protocol} due to realm being defined.`
      );
    }

    if (endpoint === undefined) {
      endpoint = `https://ingest.${options.realm}.signalfx.com/v2/trace/otlp`;
      protocol = 'http/protobuf';
    } else {
      diag.warn(
        'OTLP span exporter factory: Realm value ignored (full endpoint URL has been specified).'
      );
    }
  }

  protocol = protocol ?? 'grpc';

  switch (protocol) {
    case 'grpc': {
      const grpcModule: typeof grpc = require('@grpc/grpc-js');
      const otlpGrpc: typeof OtlpGrpc = require('@opentelemetry/exporter-trace-otlp-grpc');
      const metadata = new grpcModule.Metadata();
      if (accessToken) {
        // for forward compatibility, is not currently supported
        metadata.set('X-SF-TOKEN', accessToken);
      }
      return new otlpGrpc.OTLPTraceExporter({
        url: endpoint,
        metadata,
      });
    }
    case 'http/protobuf': {
      const headers = accessToken
        ? {
            'X-SF-TOKEN': accessToken,
          }
        : {};
      return new OTLPHttpTraceExporter({
        url: endpoint,
        headers,
      });
    }
    default:
      throw new Error(
        `Expected OTLP protocol to be either grpc or http/protobuf, got ${protocol}.`
      );
  }
}

export function consoleSpanExporterFactory(): SpanExporter {
  return new ConsoleSpanExporter();
}

export function defaultSpanProcessorFactory(options: Options): SpanProcessor[] {
  let exporters = options.spanExporterFactory(options);

  if (!Array.isArray(exporters)) {
    exporters = [exporters];
  }

  return exporters.map((exporter) => new SplunkBatchSpanProcessor(exporter));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultPropagatorFactory(options: Options): TextMapPropagator {
  const envPropagators = getEnvArray('OTEL_PROPAGATORS', [
    'tracecontext',
    'baggage',
  ]);

  const propagators = [];
  for (const propagator of envPropagators) {
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
