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
import * as fs from 'fs';
import { ProfilingData, ProfilingExporter } from './types';
import { diag } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export interface OTLPExporterOptions {
  callstackInterval: number;
  endpoint: string;
  resource: Resource;
}

interface LogsClient extends grpc.Client {
  export: (request: unknown, metadata: grpc.Metadata, callback: Function) => {};
}

function readContentSync(location: string): Buffer | undefined {
  try {
    return fs.readFileSync(path.resolve(process.cwd(), location));
  } catch (e) {
    diag.error(`Failed to read file at ${location}`, e);
  }

  return undefined;
}

function maybeReadPath(location: string | undefined): Buffer | undefined {
  if (location === undefined) {
    return undefined;
  }

  return readContentSync(location);
}

function parseEndpoint(endpoint: string): {
  host: string;
  credentials: grpc.ChannelCredentials;
} {
  let host = endpoint;
  let credentials = grpc.ChannelCredentials.createInsecure();

  if (endpoint.startsWith('https://')) {
    host = endpoint.substr(8);
    credentials = grpc.credentials.createSsl(
      maybeReadPath(process.env.OTEL_EXPORTER_OTLP_CERTIFICATE),
      maybeReadPath(process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY),
      maybeReadPath(process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE)
    );
  } else if (endpoint.startsWith('http://')) {
    host = endpoint.substr(7);
  }

  return {
    host,
    credentials,
  };
}

export class OTLPProfilingExporter implements ProfilingExporter {
  protected _client: LogsClient;
  protected _options: OTLPExporterOptions;
  protected _resourceAttributes;

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

    const { host, credentials } = parseEndpoint(options.endpoint);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const packageObject: any = grpc.loadPackageDefinition(packageDef);
    this._client =
      new packageObject.opentelemetry.proto.collector.logs.v1.LogsService(
        host,
        credentials
      );

    const resource = new Resource({
      [SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: 'node',
    }).merge(options.resource);

    this._resourceAttributes = [];
    for (const key in resource.attributes) {
      const value = resource.attributes[key];

      if (typeof value === 'string') {
        this._resourceAttributes.push({
          key,
          value: { stringValue: value },
        });
      } else if (typeof value === 'number') {
        if (Number.isInteger(value)) {
          this._resourceAttributes.push({
            key,
            value: { intValue: value },
          });
        } else {
          this._resourceAttributes.push({
            key,
            value: { doubleValue: value },
          });
        }
      } else {
        this._resourceAttributes.push({
          key,
          value: { boolValue: value },
        });
      }
    }
  }

  send(profile: ProfilingData) {
    const { stacktraces } = profile;
    const { callstackInterval } = this._options;
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
          attributes: this._resourceAttributes,
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
