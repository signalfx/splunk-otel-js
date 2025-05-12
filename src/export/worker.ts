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
import { parentPort } from 'node:worker_threads';
import { OTLPTraceExporter as OTLPHttpTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import { resourceFromAttributes } from '@opentelemetry/resources';

const exporter = new OTLPHttpTraceExporter({});

parentPort?.on('message', (data) => {
  const spans: ReadableSpan[] = new Array(data.length);

  for (let i = 0; i < data.length; i++) {
    const s = data[i];
    spans[i] = {
      name: s.name,
      kind: s.kind,
      spanContext: () => s.spanContext,
      parentSpanContext: s.parentSpanContext,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      attributes: s.attributes,
      links: s.links,
      events: s.events,
      duration: s.duration,
      ended: s.ended,
      resource: resourceFromAttributes(s.resourceAttributes),
      instrumentationScope: s.instrumentationScope,
      droppedAttributesCount: s.droppedAttributesCount,
      droppedEventsCount: s.droppedEventsCount,
      droppedLinksCount: s.droppedLinksCount,
    };
  }

  exporter.export(spans, () => {});
});
