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
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import { ExportResult, ExportResultCode } from '@opentelemetry/core';

import * as wt from 'node:worker_threads';

export class WorkerExporter implements SpanExporter {
  private _worker: wt.Worker | undefined;

  constructor(config: OTLPExporterNodeConfigBase = {}) {
    console.log('creating worker');
    this._worker = new wt.Worker(__dirname + '/worker.js');
    this._worker.on('message', (msg) => {
      console.log('worker msg');
    });
    this._worker.on('online', () => {
      console.log('worker online?');
    });
    this._worker.on('exit', (code) => {
      console.log('worker exit', code);
    });
    console.log('created worker');
  }

  export(
    spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ) {
    //const begin = process.hrtime.bigint();
    const payload = new Array(spans.length);

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];
      payload[i] = {
        name: span.name,
        kind: span.kind,
        spanContext: span.spanContext(),
        parentSpanContext: span.parentSpanContext,
        startTime: span.startTime,
        endTime: span.endTime,
        status: span.status,
        attributes: span.attributes,
        links: span.links,
        events: span.events,
        duration: span.duration,
        ended: span.ended,
        resourceAttributes: span.resource.attributes,
        instrumentationScope: span.instrumentationScope,
        droppedAttributesCount: span.droppedAttributesCount,
        droppedEventsCount: span.droppedEventsCount,
        droppedLinksCount: span.droppedLinksCount,
      };
    }

    //const e1 = process.hrtime.bigint();

    this._worker?.postMessage(payload);

    //const e2 = process.hrtime.bigint();

    //console.log('convert', Number(e1 - begin) / 1e6);
    //console.log('post', Number(e2 - e1) / 1e6);

    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  async shutdown(): Promise<void> {}
}
