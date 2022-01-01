import * as protoLoader from '@grpc/proto-loader';
import * as grpc from '@grpc/grpc-js';
import * as path from 'path';
import { ProfilingData, ProfilingExporter } from './types';
import { Resource } from '@opentelemetry/resources';

export interface OTLPExporterOptions {
  serviceName: string;
  callstackInterval: number;
  endpoint: string;
  resource: Resource;
}

interface LogsClient extends grpc.Client {
  export: (
    requet: any,
    metadata: grpc.Metadata,
    callback: Function
  ) => {};
}

export class OTLPProfilingExporter implements ProfilingExporter {
  protected _client: LogsClient;
  protected _options: OTLPExporterOptions;

  constructor(options: OTLPExporterOptions) {
    this._options = options;
    const protosDir = path.resolve(__dirname, '..', '..', 'protos');
    const packageDef = protoLoader.loadSync(
      path.join(protosDir, 'opentelemetry/proto/collector/logs/v1/logs_service.proto'), {
      keepCase: false,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true,
      includeDirs: [protosDir]
    });
    const packageObject: any = grpc.loadPackageDefinition(packageDef);
    this._client = new packageObject.opentelemetry.proto.collector.logs.v1.LogsService(options.endpoint, grpc.credentials.createInsecure());
  }

  send(profile: ProfilingData) {
    const { stacktraces } = profile;
    const { callstackInterval, serviceName } = this._options;
    const logs = stacktraces.map(function stacktraceToLog(st) {
      return {
        timeUnixNano: st.timestamp,
        name: "otel.profiling",
        spanId: st.spanId,
        traceId: st.traceId,
        body: { stringValue: st.stacktrace },
        attributes: [
          {
            key: "com.splunk.sourcetype",
            value: { stringValue: "otel.profiling" }
          },
          {
            key: "source.event.name",
            value: { stringValue: "nodejs.profsample" }
          },
          {
            key: "source.event.period",
            value: { intValue: callstackInterval }
          },
        ]
      };
    });

    const ilLogs = {
      instrumentationLibrary: {
        name: "otel.profiling",
        version: "0.1.0",
      },
      logs
    };

    const resourceLogs = [{
      resource: {
        attributes: [
          { key: "environment", value: { stringValue: "demo" } },
          { key: "otel.log.name", value: { stringValue: "otel.profiling" } },
          { key: "service.name", value: { stringValue: serviceName } },
        ],
      },
      instrumentationLibraryLogs: [ilLogs],
    }];

    const payload = {
      resourceLogs,
    };
    this._client.export(payload, new grpc.Metadata(), (err: any) => {
      console.log(err);
    });
  }
}
