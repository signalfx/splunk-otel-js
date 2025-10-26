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

import { strict as assert } from 'assert';
import { beforeEach, describe, it } from 'node:test';
import { inspect } from 'util';

import { context, trace } from '@opentelemetry/api';
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { InMemorySpanExporter } from '@opentelemetry/sdk-trace-base';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

import { start, stop } from '../../src';
import {
  _setDefaultOptions,
  defaultExporterFactory,
} from '../../src/profiling';
import { ProfilingStacktrace } from '../../src/profiling/types';
import { ProfilingContextManager } from '../../src/profiling/ProfilingContextManager';
import {
  CpuProfile,
  HeapProfile,
  ProfilingExporter,
} from '../../src/profiling/types';

import { cleanEnvironment, detectResource, spinMs } from '../utils';

const sleep = (ms: number) => {
  return new Promise((r) => setTimeout(r, ms));
};

describe('profiling', () => {
  describe('options', () => {
    beforeEach(() => {
      cleanEnvironment();
    });

    it('sets default options when no options are provided', async () => {
      const options = _setDefaultOptions();
      await options.resource.waitForAsyncAttributes?.();
      const testResource = resourceFromAttributes({
        [ATTR_SERVICE_NAME]: '@splunk/otel',
      }).merge(resourceFromAttributes(detectResource().attributes || {}));
      await testResource.waitForAsyncAttributes?.();

      const { resource: defaultResource, ...defaultOtherAttrs } = options;

      assert.deepStrictEqual(defaultOtherAttrs, {
        serviceName: '@splunk/otel',
        endpoint: 'http://localhost:4318',
        callstackInterval: 1_000,
        collectionDuration: 30_000,
        exporterFactory: defaultExporterFactory,
        memoryProfilingEnabled: false,
        memoryProfilingOptions: undefined,
      });

      assert.deepStrictEqual(
        defaultResource.attributes,
        testResource.attributes
      );
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
    it('exports stacktraces', async () => {
      let sendCallCount = 0;
      const stacktracesReceived: ProfilingStacktrace[] = [];
      const exporter: ProfilingExporter = {
        async send(cpuProfile: CpuProfile) {
          const { stacktraces } = cpuProfile;
          sendCallCount += 1;
          stacktracesReceived.push(...stacktraces);
        },
        async sendHeapProfile(_profile: HeapProfile) {},
      };

      // enabling tracing is required for span information to be caught
      start({
        tracing: {
          serviceName: 'slow-service',
          spanExporterFactory: () => new InMemorySpanExporter(),
        },
        profiling: {
          serviceName: 'slow-service',
          callstackInterval: 50,
          collectionDuration: 500,
          exporterFactory: () => [exporter],
        },
      });

      assert(
        context['_getContextManager']() instanceof ProfilingContextManager
      );

      const span = trace.getTracer('test-tracer').startSpan('test-span');
      const { spanId: expectedSpanId, traceId: expectedTraceId } =
        span.spanContext();

      context.with(trace.setSpan(context.active(), span), () => {
        spinMs(3_000);
        span.end();
      });

      // let runtime empty the task-queue and disable profiling
      await sleep(1000);
      await stop();

      // It might be possible all stacktraces will not be available,
      // due to the first few stacktraces having random timings
      // after a profiling run is started.
      const expectedStacktraces = 2;
      assert(
        stacktracesReceived.length >= expectedStacktraces,
        `expected at least ${expectedStacktraces}, got ${stacktracesReceived.length}`
      );

      assert(
        stacktracesReceived.some(({ spanId, traceId }) => {
          return (
            spanId?.toString('hex') === expectedSpanId &&
            traceId?.toString('hex') === expectedTraceId
          );
        }),
        `No stacktrace had span info: ${inspect(stacktracesReceived)}`
      );

      // Stop flushes the exporters, hence the extra call count
      assert.deepStrictEqual(sendCallCount, 2);
    });
  });
});
