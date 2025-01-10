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

import {
  AggregationTemporality,
  InstrumentType,
  MetricReader,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as util from 'util';
import { Writable } from 'stream';
import { context, trace } from '@opentelemetry/api';
import { OTLPTraceExporter as OTLPGrpcTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
// eslint-disable-next-line n/no-extraneous-import
import { OTLPMetricExporterBase } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

const isConfigVarEntry = (key) => {
  const lowercased = key.toLowerCase();
  return (
    lowercased.includes('splunk_') ||
    lowercased.includes('signal_') ||
    lowercased.includes('otel_')
  );
};

/*
  Has a side-effect of deleting environment variables in the running process.
  To be used in tests to make sure:
  1. that we don't depend on the actual environment in the tests.
  2. there are no leaking setup between tests;

  An alternative would be to sinon.stub all relevant options and restore them
  between runs.
*/
export const cleanEnvironment = () => {
  Object.keys(process.env)
    .filter(isConfigVarEntry)
    .forEach((key) => {
      delete process.env[key];
    });
};

export const spinMs = (ms: number) => {
  const start = Date.now();
  while (Date.now() - start < ms) {}
};

export class TestMetricReader extends MetricReader {
  constructor(public temporality: AggregationTemporality) {
    super();
  }
  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this.temporality;
  }
  protected async onForceFlush() {}
  protected async onShutdown() {}
}

export class TestLogStream {
  public stream: Writable;
  public record = {};

  constructor() {
    this.stream = new Writable({
      write: (chunk) => {
        this.record = JSON.parse(chunk);
      },
    });
  }
}

export function assertInjection(
  stream: TestLogStream,
  logger: any,
  extra = [['service.name', 'test-service']]
) {
  const span = trace.getTracer('test').startSpan('main');
  let traceId;
  let spanId;
  context.with(trace.setSpan(context.active(), span), () => {
    traceId = span.spanContext().traceId;
    spanId = span.spanContext().spanId;
    logger.info('my-log-message');
  });

  assert.strictEqual(stream.record['trace_id'], traceId);
  assert.strictEqual(stream.record['span_id'], spanId);

  for (const [key, value] of extra || []) {
    assert.strictEqual(
      stream.record[key],
      value,
      `Invalid value for "${key}": ${util.inspect(stream.record[key])}`
    );
  }
}

export function exporterUrl(exporter: any) {
  if (exporter instanceof OTLPGrpcTraceExporter) {
    const transport = exporter['_delegate']['_transport'];
    return transport['_parameters'].address;
  }

  if (exporter instanceof OTLPHttpTraceExporter) {
    return exporter['_delegate']['_transport']['_transport']['_parameters'].url;
  }

  if (
    exporter instanceof OTLPMetricExporterBase ||
    exporter instanceof OTLPLogExporter
  ) {
    const transport = exporter['_delegate']['_transport'];
    if (transport['_parameters']) {
      return transport['_parameters'].address;
    }

    return transport['_transport']['_parameters'].url;
  }

  return undefined;
}

export function exporterHeaders(exporter: any) {
  if (exporter instanceof OTLPHttpTraceExporter) {
    return exporter['_delegate']['_transport']['_transport'][
      '_parameters'
    ].headers();
  }

  if (exporter instanceof OTLPGrpcTraceExporter) {
    return exporter['_delegate']['_transport']['_parameters']
      .metadata()
      .toJSON();
  }

  if (exporter instanceof OTLPMetricExporterBase) {
    const transport = exporter['_delegate']['_transport'];
    return transport['_parameters'].headers();
  }

  return {};
}
