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
import { beforeEach, describe, it, mock } from 'node:test';
import { InstrumentationNodeModuleDefinition } from '@opentelemetry/instrumentation';
import { CouchbaseInstrumentation } from '../../../../src/instrumentations/external/couchbase';
import { cleanEnvironment } from '../../../utils';

function createCouchbaseModule() {
  const tracer = { type: 'couchbase-tracer' };
  const meter = { type: 'couchbase-meter' };
  const topLevelResult = { type: 'top-level-cluster' };
  const staticResult = { type: 'static-cluster' };
  const connect = mock.fn((..._args: unknown[]) => topLevelResult);
  const staticConnect = mock.fn((..._args: unknown[]) => staticResult);

  return {
    tracer,
    meter,
    topLevelResult,
    staticResult,
    connect,
    staticConnect,
    module: {
      getOTelTracer: mock.fn(() => tracer),
      getOTelMeter: mock.fn(() => meter),
      connect,
      Cluster: {
        connect: staticConnect,
      },
    },
  };
}

function patchModule(
  module: ReturnType<typeof createCouchbaseModule>['module']
) {
  const instrumentation = new CouchbaseInstrumentation();
  const [definition] =
    instrumentation.getModuleDefinitions() as InstrumentationNodeModuleDefinition[];
  definition.patch?.(module, '4.7.0');
  return { definition, instrumentation };
}

describe('couchbase instrumentation', () => {
  beforeEach(cleanEnvironment);

  it('supports Couchbase versions with native OpenTelemetry integration', () => {
    const instrumentation = new CouchbaseInstrumentation();
    const [definition] =
      instrumentation.getModuleDefinitions() as InstrumentationNodeModuleDefinition[];

    assert.equal(definition.name, 'couchbase');
    assert.deepEqual(definition.supportedVersions, ['>=4.7.0 <5']);
  });

  it('injects the native tracer without mutating connect options', () => {
    const fake = createCouchbaseModule();
    const { definition } = patchModule(fake.module);
    const callback = () => undefined;
    const options = Object.freeze({ username: 'user' });

    const result = fake.module.connect(
      'couchbase://localhost',
      options,
      callback
    );

    assert.strictEqual(result, fake.topLevelResult);
    assert.equal(fake.module.getOTelTracer.mock.callCount(), 1);
    assert.equal(
      fake.module.getOTelTracer.mock.calls[0].arguments.length,
      0,
      'Couchbase should resolve the registered global tracer provider'
    );
    assert.equal(fake.module.getOTelMeter.mock.callCount(), 0);
    const call = fake.connect.mock.calls[0];
    assert.equal(call.arguments[0], 'couchbase://localhost');
    assert.notStrictEqual(call.arguments[1], options);
    assert.deepEqual(call.arguments[1], {
      username: 'user',
      tracer: fake.tracer,
    });
    assert.strictEqual(call.arguments[2], callback);

    definition.unpatch?.(fake.module, '4.7.0');
  });

  it('injects native metrics when instrumentation metrics are enabled', () => {
    process.env.SPLUNK_INSTRUMENTATION_METRICS_ENABLED = 'true';
    const fake = createCouchbaseModule();
    const { definition } = patchModule(fake.module);

    fake.module.connect('couchbase://localhost');

    assert.equal(fake.module.getOTelTracer.mock.callCount(), 1);
    assert.equal(fake.module.getOTelMeter.mock.callCount(), 1);
    assert.equal(
      fake.module.getOTelMeter.mock.calls[0].arguments.length,
      0,
      'Couchbase should resolve the registered global meter provider'
    );
    assert.deepEqual(fake.connect.mock.calls[0].arguments[1], {
      tracer: fake.tracer,
      meter: fake.meter,
    });

    definition.unpatch?.(fake.module, '4.7.0');
  });

  it('preserves explicitly configured telemetry', () => {
    process.env.SPLUNK_INSTRUMENTATION_METRICS_ENABLED = 'true';
    const fake = createCouchbaseModule();
    const { definition } = patchModule(fake.module);
    const tracer = { type: 'custom-tracer' };
    const meter = { type: 'custom-meter' };
    const options = { tracer, meter };

    fake.module.connect('couchbase://localhost', options);

    assert.equal(fake.module.getOTelTracer.mock.callCount(), 0);
    assert.equal(fake.module.getOTelMeter.mock.callCount(), 0);
    assert.strictEqual(fake.connect.mock.calls[0].arguments[1], options);

    definition.unpatch?.(fake.module, '4.7.0');
  });

  it('respects explicit tracing and metrics disablement', () => {
    process.env.SPLUNK_INSTRUMENTATION_METRICS_ENABLED = 'true';
    const fake = createCouchbaseModule();
    const { definition } = patchModule(fake.module);
    const options = {
      tracingConfig: { enableTracing: false },
      metricsConfig: { enableMetrics: false },
    };

    fake.module.connect('couchbase://localhost', options);

    assert.equal(fake.module.getOTelTracer.mock.callCount(), 0);
    assert.equal(fake.module.getOTelMeter.mock.callCount(), 0);
    assert.strictEqual(fake.connect.mock.calls[0].arguments[1], options);

    definition.unpatch?.(fake.module, '4.7.0');
  });

  it('also instruments Cluster.connect', () => {
    const fake = createCouchbaseModule();
    const { definition } = patchModule(fake.module);

    const result = fake.module.Cluster.connect('couchbase://localhost');

    assert.strictEqual(result, fake.staticResult);
    assert.deepEqual(fake.staticConnect.mock.calls[0].arguments[1], {
      tracer: fake.tracer,
    });

    definition.unpatch?.(fake.module, '4.7.0');
  });
});
