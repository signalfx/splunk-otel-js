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

import { VERSION } from '@opentelemetry/core';
import { Resource } from '@opentelemetry/resources';
import { strict as assert } from 'assert';
import { describe, it, mock } from 'node:test';
import { OtlpHttpProfilingExporter } from '../../src/profiling/OtlpHttpProfilingExporter';
import { cpuProfile, heapProfile } from './profiles';
import { InMemoryLogRecordExporter } from '@opentelemetry/sdk-logs';

describe('profiling OTLP HTTP exporter', () => {
  it('appends the logs path to the endpoint', () => {
    const exporter = new OtlpHttpProfilingExporter({
      endpoint: 'http://localhost:4318',
      callstackInterval: 1000,
      resource: new Resource({}),
      instrumentationSource: 'continuous',
    });

    assert.strictEqual(exporter._endpoint, 'http://localhost:4318/v1/logs');
  });

  it('does not append the logs path to the endpoint when one exists', () => {
    const exporter = new OtlpHttpProfilingExporter({
      endpoint: 'http://abc:4200/v1/logs',
      callstackInterval: 1000,
      resource: new Resource({}),
      instrumentationSource: 'continuous',
    });

    assert.strictEqual(exporter._endpoint, 'http://abc:4200/v1/logs');
  });

  it('attaches common attributes when exporting CPU profiles', async () => {
    const exporter = new OtlpHttpProfilingExporter({
      endpoint: 'http://foobar:8181',
      callstackInterval: 1000,
      resource: new Resource({ xyz: 'foo' }),
      instrumentationSource: 'continuous',
    });

    const logExporter = new InMemoryLogRecordExporter();
    mock.method(exporter, '_getExporter', () => logExporter);

    await exporter.send(cpuProfile);

    const logs = logExporter.getFinishedLogRecords();

    assert.strictEqual(logs.length, 1);

    const [log] = logs;

    assert.deepStrictEqual(log.resource.attributes, {
      'telemetry.sdk.language': 'node',
      'telemetry.sdk.version': VERSION,
      xyz: 'foo',
    });

    assert.deepStrictEqual(log.attributes, {
      'profiling.data.format': 'pprof-gzip-base64',
      'profiling.data.type': 'cpu',
      'com.splunk.sourcetype': 'otel.profiling',
      'profiling.data.total.frame.count': 2,
      'profiling.instrumentation.source': 'continuous',
    });
  });

  it('attaches common attributes when exporting heap profiles', async () => {
    const exporter = new OtlpHttpProfilingExporter({
      endpoint: 'http://foobar:8181',
      callstackInterval: 1000,
      resource: new Resource({ xyz: 'foo' }),
      instrumentationSource: 'continuous',
    });

    const logExporter = new InMemoryLogRecordExporter();

    mock.method(exporter, '_getExporter', () => logExporter);

    await exporter.sendHeapProfile(heapProfile);

    const logs = logExporter.getFinishedLogRecords();

    assert.deepStrictEqual(logs.length, 1);

    const [log] = logs;

    assert.deepStrictEqual(log.resource.attributes, {
      'telemetry.sdk.language': 'node',
      'telemetry.sdk.version': VERSION,
      xyz: 'foo',
    });

    assert.deepStrictEqual(log.attributes, {
      'profiling.data.format': 'pprof-gzip-base64',
      'profiling.data.type': 'allocation',
      'com.splunk.sourcetype': 'otel.profiling',
      'profiling.data.total.frame.count': 3,
      'profiling.instrumentation.source': 'continuous',
    });
  });
});
