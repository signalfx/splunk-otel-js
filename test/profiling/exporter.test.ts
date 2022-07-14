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
import * as utils from '../utils';
import * as grpc from '@grpc/grpc-js';

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
        exporter['_client'].getChannel()['credentials'],
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
        exporter['_client'].getChannel()['credentials'],
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
        exporter['_client'].getChannel()['credentials'],
        grpc.ChannelCredentials.createSsl()
      );
    });
  });
});
