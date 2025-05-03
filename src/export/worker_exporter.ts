import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';
import { OTLPExporterNodeConfigBase } from '@opentelemetry/otlp-exporter-base';
import {
  ExportResult,
  ExportResultCode,
} from '@opentelemetry/core';

import * as wt from 'node:worker_threads';

export class WorkerExporter implements SpanExporter
{
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

  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void) {
    console.log('export spans');
    this._worker?.postMessage({ 'foo': 42 });
    const s = spans.map(span => {
      console.log(span);
      return {
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
    });
    this._worker?.postMessage(s);
    resultCallback({ code: ExportResultCode.SUCCESS });
  }

  async shutdown(): Promise<void> {

  }

}
