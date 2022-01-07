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
import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import { ProfilingData, ProfilingExporter } from './types';
import { diag } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export interface OTLPExporterOptions {
  serviceName: string;
  callstackInterval: number;
  endpoint: string;
  resource: Resource;
}

interface LogsClient extends grpc.Client {
  export: (request: unknown, metadata: grpc.Metadata, callback: Function) => {};
}

export class OTLPProfilingExporter implements ProfilingExporter {
  protected _client: LogsClient;
  protected _options: OTLPExporterOptions;

  constructor(options: OTLPExporterOptions) {
    this._options = options;
    const protosDir = path.resolve(__dirname, '..', '..', 'protos');
    const packageDef = protoLoader.loadSync(
      path.join(
        protosDir,
        'opentelemetry/proto/collector/logs/v1/logs_service.proto'
      ),
      {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
        includeDirs: [protosDir],
      }
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const packageObject: any = grpc.loadPackageDefinition(packageDef);
    this._client =
      new packageObject.opentelemetry.proto.collector.logs.v1.LogsService(
        options.endpoint,
        grpc.credentials.createInsecure()
      );
  }

  send(profile: ProfilingData) {
    const { stacktraces } = profile;
    const { callstackInterval, serviceName } = this._options;
    const attributes = [
      {
        key: 'com.splunk.sourcetype',
        value: { stringValue: 'otel.profiling' },
      },
      {
        key: 'source.event.name',
        value: { stringValue: 'nodejs.callstack' },
      },
      {
        key: 'source.event.period',
        value: { intValue: callstackInterval },
      },
    ];
    const logs = stacktraces.map(st => {
      return {
        timeUnixNano: st.timestamp,
        name: 'otel.profiling',
        spanId: st.spanId,
        traceId: st.traceId,
        body: { stringValue: st.stacktrace },
        attributes,
      };
    });

    const ilLogs = {
      instrumentationLibrary: {
        name: 'otel.profiling',
        version: '0.1.0',
      },
      logs,
    };

    const resourceLogs = [
      {
        resource: {
          attributes: [
            { key: 'environment', value: { stringValue: 'demo' } },
            { key: 'otel.log.name', value: { stringValue: 'otel.profiling' } },
            {
              key: SemanticResourceAttributes,
              value: { stringValue: serviceName },
            },
          ],
        },
        instrumentationLibraryLogs: [ilLogs],
      },
    ];

    const payload = {
      resourceLogs,
    };
    this._client.export(payload, new grpc.Metadata(), (err: unknown) => {
      if (err) {
        diag.error('Error exporting profiling data', err);
      }
    });
  }
}
