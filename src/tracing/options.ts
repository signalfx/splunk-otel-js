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
  AlwaysOnSampler,
  ConsoleSpanExporter,
  SpanExporter,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { B3Propagator, B3InjectEncoding } from '@opentelemetry/propagator-b3';

import { getInstrumentations } from '../instrumentations';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import type * as OtlpGrpc from '@opentelemetry/exporter-trace-otlp-grpc';
import type * as grpc from '@grpc/grpc-js';
import { getDetectedResource } from '../resource';
import {
  defaultServiceName,
  getEnvArray,
  getEnvValueByPrecedence,
  getNonEmptyEnvVar,
  getEnvBoolean,
  ensureResourcePath,
} from '../utils';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { diag, TextMapPropagator } from '@opentelemetry/api';
import {
  CompositePropagator,
  W3CBaggagePropagator,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { SplunkBatchSpanProcessor } from './SplunkBatchSpanProcessor';
import { Resource } from '@opentelemetry/resources';
import { NextJsSpanProcessor } from './NextJsSpanProcessor';
import type {
  SpanExporterFactory,
  StartTracingOptions,
  TracingOptions,
} from './types';
import { NodeTracerConfig } from '@opentelemetry/sdk-trace-node';

function defaultSampler(config: NodeTracerConfig) {
  if (
    config.sampler === undefined &&
    getNonEmptyEnvVar('OTEL_TRACES_SAMPLER') === undefined
  ) {
    return new AlwaysOnSampler();
  }

  return undefined;
}

export function _setDefaultOptions(
  options: StartTracingOptions = {}
): TracingOptions {
  process.env.OTEL_SPAN_LINK_COUNT_LIMIT =
    getNonEmptyEnvVar('OTEL_SPAN_LINK_COUNT_LIMIT') ?? '1000';
  process.env.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT =
    getNonEmptyEnvVar('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT') ?? '12000';

  const accessToken =
    options.accessToken || getNonEmptyEnvVar('SPLUNK_ACCESS_TOKEN') || '';

  const realm = options.realm || getNonEmptyEnvVar('SPLUNK_REALM');

  if (realm) {
    if (!accessToken) {
      throw new Error(
        'Splunk realm is set, but access token is unset. To send traces to the Observability Cloud, both need to be set'
      );
    }
  }

  const envResource = getDetectedResource();

  const resourceFactory = options.resourceFactory || ((r: Resource) => r);
  let resource = resourceFactory(envResource);

  const serviceName =
    options.serviceName ||
    getNonEmptyEnvVar('OTEL_SERVICE_NAME') ||
    resource.attributes[ATTR_SERVICE_NAME];

  resource = resource.merge(
    new Resource({
      [ATTR_SERVICE_NAME]: serviceName || defaultServiceName(),
    })
  );

  const extraTracerConfig = options.tracerConfig || {};

  const sampler = defaultSampler(extraTracerConfig);
  const tracerConfig = {
    resource,
    sampler,
    ...extraTracerConfig,
  };

  const instrumentations = options.instrumentations || getInstrumentations();

  if (instrumentations.length === 0) {
    diag.warn(
      'No instrumentations set to be loaded. Install an instrumentation package to enable auto-instrumentation.'
    );
  }

  return {
    realm,
    endpoint: options.endpoint,
    serviceName: String(resource.attributes[ATTR_SERVICE_NAME]),
    accessToken,
    serverTimingEnabled:
      options.serverTimingEnabled ||
      getEnvBoolean('SPLUNK_TRACE_RESPONSE_HEADER_ENABLED', true),
    captureHttpRequestUriParams: options.captureHttpRequestUriParams || [],
    instrumentations,
    tracerConfig,
    spanExporterFactory:
      options.spanExporterFactory || defaultSpanExporterFactory(realm),
    spanProcessorFactory:
      options.spanProcessorFactory || defaultSpanProcessorFactory,
    propagatorFactory: options.propagatorFactory || defaultPropagatorFactory,
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

function getExporterTypes(realm: string | undefined): ExporterType[] {
  const traceExporters: string[] = getEnvArray('OTEL_TRACES_EXPORTER', [
    'otlp',
  ]);

  if (realm) {
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
  realm: string | undefined
): SpanExporterFactory {
  const exporterTypes = getExporterTypes(realm);
  return (options) => {
    const factories = exporterTypes.map((t) => SpanExporterMap[t]);
    return factories.flatMap((factory) => factory(options));
  };
}

export function otlpSpanExporterFactory(options: TracingOptions): SpanExporter {
  let protocol = getEnvValueByPrecedence([
    'OTEL_EXPORTER_OTLP_TRACES_PROTOCOL',
    'OTEL_EXPORTER_OTLP_PROTOCOL',
  ]);

  let endpoint = options.endpoint;

  const accessToken = options.accessToken;

  if (options.realm !== undefined) {
    if (protocol !== undefined && protocol !== 'http/protobuf') {
      diag.warn(
        `OTLP span exporter factory: defaulting protocol to 'http/protobuf' instead of ${protocol} due to realm being defined.`
      );
    }

    const envEndpoint = getEnvValueByPrecedence([
      'OTEL_EXPORTER_OTLP_TRACES_ENDPOINT',
      'OTEL_EXPORTER_OTLP_ENDPOINT',
    ]);

    if (endpoint === undefined && envEndpoint === undefined) {
      endpoint = `https://ingest.${options.realm}.signalfx.com/v2/trace/otlp`;
      protocol = 'http/protobuf';
    } else {
      diag.warn(
        'OTLP span exporter factory: Realm value ignored (full endpoint URL has been specified).'
      );
    }
  }

  protocol = protocol ?? 'http/protobuf';

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
        : undefined;
      const url = ensureResourcePath(endpoint, '/v1/traces');
      return new OTLPHttpTraceExporter({
        url,
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

export function defaultSpanProcessorFactory(
  options: TracingOptions
): SpanProcessor[] {
  let exporters = options.spanExporterFactory(options);

  if (!Array.isArray(exporters)) {
    exporters = [exporters];
  }

  const nextJsFixEnabled = getEnvBoolean('SPLUNK_NEXTJS_FIX_ENABLED', false);

  const processors: SpanProcessor[] = [];

  if (nextJsFixEnabled) {
    processors.push(new NextJsSpanProcessor());
  }

  for (const exporter of exporters) {
    processors.push(new SplunkBatchSpanProcessor(exporter));
  }

  return processors;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultPropagatorFactory(
  _options: TracingOptions
): TextMapPropagator {
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
