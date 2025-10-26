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
  CpuProfile,
  HeapProfile,
  ProfilingExporter,
  ProfilingStacktrace,
} from './types';
import { context, diag } from '@opentelemetry/api';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import {
  hrTime,
  InstrumentationScope,
  suppressTracing,
} from '@opentelemetry/core';
import { dependencies } from '../../package.json';
import type { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto';
import {
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { serialize, serializeHeapProfile, encode } from './utils';
import { ReadableLogRecord } from '@opentelemetry/sdk-logs';

export type ProfilerInstrumentationSource = 'continuous' | 'snapshot';

export interface ExporterOptions {
  callstackInterval: number;
  endpoint: string;
  instrumentationSource: ProfilerInstrumentationSource;
  resource: Resource;
}

const OTEL_SDK_VERSION = dependencies['@opentelemetry/core'];

function countSamples(stacktraces: ProfilingStacktrace[]) {
  let sampleCount = 0;

  for (const profilingStacktrace of stacktraces) {
    sampleCount += profilingStacktrace.stacktrace.length;
  }

  return sampleCount;
}

function commonAttributes(
  profilingType: 'cpu' | 'allocation',
  sampleCount: number,
  instrumentationSource: ProfilerInstrumentationSource
) {
  return {
    'profiling.data.format': 'pprof-gzip-base64',
    'profiling.data.type': profilingType,
    'com.splunk.sourcetype': 'otel.profiling',
    'profiling.data.total.frame.count': sampleCount,
    'profiling.instrumentation.source': instrumentationSource,
  };
}

function createEndpoint(endpoint: string) {
  if (endpoint.includes('/v1/logs')) {
    return endpoint;
  }

  return new URL('/v1/logs', endpoint).href;
}

const OTEL_PROFILING_VERSION = '0.1.0';

export class OtlpHttpProfilingExporter implements ProfilingExporter {
  _callstackInterval: number;
  _endpoint: string;
  _exporter: OTLPLogExporter | undefined;
  _resource: Resource;
  _instrumentationSource: ProfilerInstrumentationSource;
  _scope: InstrumentationScope;

  constructor(options: ExporterOptions) {
    this._callstackInterval = options.callstackInterval;
    this._endpoint = createEndpoint(options.endpoint);
    this._resource = resourceFromAttributes({
      [ATTR_TELEMETRY_SDK_LANGUAGE]: 'node',
      [ATTR_TELEMETRY_SDK_VERSION]: OTEL_SDK_VERSION,
    }).merge(options.resource);
    this._instrumentationSource = options.instrumentationSource;

    this._scope = {
      name: 'otel.profiling',
      version: OTEL_PROFILING_VERSION,
    };
  }

  async send(profile: CpuProfile) {
    const { stacktraces } = profile;

    const sampleCount = countSamples(stacktraces);

    diag.debug(`profiling: Exporting ${sampleCount} CPU samples`);
    const attributes = commonAttributes(
      'cpu',
      sampleCount,
      this._instrumentationSource
    );

    return encode(
      serialize(profile, { samplingPeriodMillis: this._callstackInterval })
    )
      .then((serializedProfile) => {
        const ts = hrTime();

        const logs: ReadableLogRecord[] = [
          {
            hrTime: ts,
            hrTimeObserved: ts,
            body: serializedProfile.toString('base64'),
            resource: this._resource,
            instrumentationScope: this._scope,
            attributes,
            droppedAttributesCount: 0,
          },
        ];

        context.with(suppressTracing(context.active()), () => {
          this._getExporter().export(logs, (result) => {
            if (result.error !== undefined) {
              diag.error('Error exporting profiling data', result.error);
            }
          });
        });
      })
      .catch((err: unknown) => {
        diag.error('Error encoding cpu profile', err);
      });
  }

  async sendHeapProfile(profile: HeapProfile) {
    const serialized = serializeHeapProfile(profile);
    const sampleCount = profile.samples.length;
    const attributes = commonAttributes(
      'allocation',
      sampleCount,
      'continuous'
    );
    diag.debug(`profiling: Exporting ${sampleCount} heap samples`);
    return encode(serialized)
      .then((serializedProfile) => {
        const ts = hrTime();

        const logs: ReadableLogRecord[] = [
          {
            hrTime: ts,
            hrTimeObserved: ts,
            body: serializedProfile.toString('base64'),
            resource: this._resource,
            instrumentationScope: this._scope,
            attributes,
            droppedAttributesCount: 0,
          },
        ];

        context.with(suppressTracing(context.active()), () => {
          this._getExporter().export(logs, (result) => {
            if (result.error !== undefined) {
              diag.error('Error exporting profiling data', result.error);
            }
          });
        });
      })
      .catch((err: unknown) => {
        diag.error('Error encoding heap profile', err);
      });
  }

  _getExporter(): OTLPLogExporter {
    if (this._exporter !== undefined) {
      return this._exporter;
    }

    const {
      OTLPLogExporter,
    } = require('@opentelemetry/exporter-logs-otlp-proto');

    this._exporter = new OTLPLogExporter({
      url: this._endpoint,
    });

    return this._exporter!;
  }
}
