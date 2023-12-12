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

import * as assert from 'assert';
import * as sinon from 'sinon';
import { OTLPProfilingExporter } from '../../src/profiling/OTLPProfilingExporter';
import { Resource } from '@opentelemetry/resources';
import { VERSION } from '@opentelemetry/core';
import * as utils from '../utils';
import * as grpc from '@grpc/grpc-js';
import { cpuProfile, heapProfile } from './profiles';

describe('profiling OTLP exporter', () => {
  describe('configuration', () => {
    beforeEach(() => {
      utils.cleanEnvironment();
    });

    it('configures insecure gRPC credentials for endpoints without a scheme', () => {
      const exporter = new OTLPProfilingExporter({
        endpoint: 'foobar:8181',
        callstackInterval: 1000,
        resource: Resource.empty(),
      });
      assert.deepStrictEqual(
        exporter['_client'].getChannel()['internalChannel']['credentials'],
        grpc.ChannelCredentials.createInsecure()
      );
    });

    it('configures insecure gRPC credentials for http endpoints', () => {
      const exporter = new OTLPProfilingExporter({
        endpoint: 'http://foobar:8181',
        callstackInterval: 1000,
        resource: Resource.empty(),
      });
      assert.deepStrictEqual(
        exporter['_client'].getChannel()['internalChannel']['credentials'],
        grpc.ChannelCredentials.createInsecure()
      );
    });

    it('configures secure gRPC credentials for https endpoints', () => {
      const exporter = new OTLPProfilingExporter({
        endpoint: 'https://foobar:8181',
        callstackInterval: 1000,
        resource: Resource.empty(),
      });
      assert.deepStrictEqual(
        exporter['_client'].getChannel()['internalChannel']['credentials'],
        grpc.ChannelCredentials.createSsl()
      );
    });
  });

  describe('exporting', () => {
    const sandbox = sinon.createSandbox();

    beforeEach(() => {
      sandbox.restore();
    });

    it('attaches common attributes when exporting CPU profiles', (done) => {
      const exporter = new OTLPProfilingExporter({
        endpoint: 'http://foobar:8181',
        callstackInterval: 1000,
        resource: new Resource({ service: 'foo' }),
      });

      sandbox.replace(exporter['_client'], 'export', (payload: unknown) => {
        const { resourceLogs } = payload as any;
        assert.deepStrictEqual(resourceLogs.length, 1);
        const { instrumentationLibraryLogs, resource } = resourceLogs[0];
        assert.deepStrictEqual(resource.attributes, [
          { key: 'telemetry.sdk.language', value: { stringValue: 'node' } },
          { key: 'telemetry.sdk.version', value: { stringValue: VERSION } },
          { key: 'service', value: { stringValue: 'foo' } },
        ]);
        assert.deepStrictEqual(instrumentationLibraryLogs.length, 1);
        const { logs } = instrumentationLibraryLogs[0];
        assert.deepStrictEqual(logs.length, 1);
        const log = logs[0];

        assert.deepStrictEqual(log.attributes, [
          {
            key: 'profiling.data.format',
            value: { stringValue: 'pprof-gzip-base64' },
          },
          { key: 'profiling.data.type', value: { stringValue: 'cpu' } },
          {
            key: 'com.splunk.sourcetype',
            value: { stringValue: 'otel.profiling' },
          },
          { key: 'profiling.data.total.frame.count', value: { intValue: 1 } },
        ]);

        done();
      });

      exporter.send(cpuProfile);
    });

    it('attaches common attributes when exporting heap profiles', (done) => {
      const exporter = new OTLPProfilingExporter({
        endpoint: 'http://foobar:8181',
        callstackInterval: 1000,
        resource: new Resource({ service: 'foo' }),
      });

      sandbox.replace(exporter['_client'], 'export', (payload: unknown) => {
        const { resourceLogs } = payload as any;
        assert.deepStrictEqual(resourceLogs.length, 1);
        const { instrumentationLibraryLogs, resource } = resourceLogs[0];
        assert.deepStrictEqual(resource.attributes, [
          { key: 'telemetry.sdk.language', value: { stringValue: 'node' } },
          { key: 'telemetry.sdk.version', value: { stringValue: VERSION } },
          { key: 'service', value: { stringValue: 'foo' } },
        ]);
        assert.deepStrictEqual(instrumentationLibraryLogs.length, 1);
        const { logs } = instrumentationLibraryLogs[0];
        assert.deepStrictEqual(logs.length, 1);
        const log = logs[0];

        assert.deepStrictEqual(log.attributes, [
          {
            key: 'profiling.data.format',
            value: { stringValue: 'pprof-gzip-base64' },
          },
          { key: 'profiling.data.type', value: { stringValue: 'allocation' } },
          {
            key: 'com.splunk.sourcetype',
            value: { stringValue: 'otel.profiling' },
          },
          { key: 'profiling.data.total.frame.count', value: { intValue: 3 } },
        ]);

        done();
      });

      exporter.sendHeapProfile(heapProfile);
    });
  });
});
