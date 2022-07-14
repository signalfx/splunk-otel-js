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
import { hrtime } from 'process';
import {
  defaultExporterFactory,
  startProfiling,
  _setDefaultOptions,
} from '../../src/profiling';
import { ProfilingExporter, ProfilingData } from '../../src/profiling/types';
import { detect as detectResource } from '../../src/resource';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as utils from '../utils';

describe('profiling', () => {
  describe('options', () => {
    beforeEach(() => {
      utils.cleanEnvironment();
    });

    it('sets default options when no options are provided', () => {
      const options = _setDefaultOptions();
      assert.deepStrictEqual(options, {
        serviceName: 'unnamed-node-service',
        endpoint: 'http://localhost:4317',
        callstackInterval: 1_000,
        collectionDuration: 30_000,
        debugExport: false,
        resource: new Resource({
          [SemanticResourceAttributes.SERVICE_NAME]: 'unnamed-node-service',
        }).merge(detectResource()),
        exporterFactory: defaultExporterFactory,
      });
    });

    it('uses options from environment', () => {
      process.env.SPLUNK_PROFILER_LOGS_ENDPOINT = 'collector:4444';
      process.env.OTEL_SERVICE_NAME = 'profiled-service';
      process.env.SPLUNK_PROFILER_CALL_STACK_INTERVAL = '100';

      const options = _setDefaultOptions();
      assert.deepStrictEqual(options.serviceName, 'profiled-service');
      assert.deepStrictEqual(options.endpoint, 'collector:4444');
      assert.deepStrictEqual(options.callstackInterval, 100);
    });

    it('prefers user passed options over environment variables', () => {
      process.env.SPLUNK_PROFILER_LOGS_ENDPOINT = 'collector:5555';
      process.env.OTEL_SERVICE_NAME = 'profiled-service';
      process.env.SPLUNK_PROFILER_CALL_STACK_INTERVAL = '200';

      const options = _setDefaultOptions({
        serviceName: 'foo',
        endpoint: 'localhost:1111',
        callstackInterval: 50,
      });
      assert.deepStrictEqual(options.serviceName, 'foo');
      assert.deepStrictEqual(options.endpoint, 'localhost:1111');
      assert.deepStrictEqual(options.callstackInterval, 50);
    });
  });

  describe('startProfiling', () => {
    it('exports stacktraces', done => {
      let stacktracesReceived = 0;
      let sendCallCount = 0;
      const exporter: ProfilingExporter = {
        send(profilingData: ProfilingData) {
          const { stacktraces } = profilingData;
          stacktracesReceived += stacktraces.length;
          sendCallCount += 1;
        },
      };

      const { stop } = startProfiling({
        serviceName: 'slow-service',
        callstackInterval: 50,
        collectionDuration: 1_000,
        exporterFactory: () => [exporter],
      });

      setTimeout(() => {
        stop();
        // It might be possible all stacktraces will not be available,
        // due to the first few stacktraces having random timings
        // after a profiling run is started.
        const expectedStacktraces = 5;
        assert(
          stacktracesReceived >= expectedStacktraces,
          `expected at least ${expectedStacktraces}, got ${stacktracesReceived}`
        );
        // Stop flushes the exporters, hence the extra call count
        assert.deepStrictEqual(sendCallCount, 2);
        done();
      }, 1_100);
    });
  });
});
