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
import { afterEach, beforeEach, describe, it, mock } from 'node:test';

import * as logsAPI from '@opentelemetry/api-logs';
import {
  InMemoryLogRecordExporter,
  LoggerProvider,
  SimpleLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { SecureAppInstrumentation } from '@splunk/secureapp-agent';

import { start, stop } from '../src';
import * as secureapp from '../src/secureapp';
import { startSecureapp } from '../src/secureapp';
import type { SecureAppInstrumentationConfig } from '../src/secureapp/types';
import * as logging from '../src/logging';
import * as tracing from '../src/tracing';
import { cleanEnvironment } from './utils';

describe('startSecureapp()', () => {
  beforeEach(cleanEnvironment);

  it('is a no-op when no instrumentation class is provided', () => {
    assert.doesNotThrow(() => {
      startSecureapp({});
    });
  });

  it('passes option values to the instrumentation', () => {
    let capturedConfig: SecureAppInstrumentationConfig | undefined;

    class TestInstrumentation {
      constructor(config?: SecureAppInstrumentationConfig) {
        capturedConfig = config;
      }
    }

    startSecureapp({
      instrumentation: TestInstrumentation as any,
      dependencyScanInterval: 60000,
      initialDelaySeconds: 10,
      runtimePackagesOnly: false,
      noSelfReport: true,
    });

    assert.deepStrictEqual(capturedConfig, {
      dependencyScanInterval: 60000,
      initialDelaySeconds: 10,
      runtimePackagesOnly: false,
      noSelfReport: true,
    });
  });

  it('uses defaults when options are not set', () => {
    let capturedConfig: SecureAppInstrumentationConfig | undefined;

    class TestInstrumentation {
      constructor(config?: SecureAppInstrumentationConfig) {
        capturedConfig = config;
      }
    }

    startSecureapp({ instrumentation: TestInstrumentation as any });

    assert.strictEqual(capturedConfig?.dependencyScanInterval, 86400000);
    assert.strictEqual(capturedConfig?.initialDelaySeconds, 60);
    assert.strictEqual(capturedConfig?.runtimePackagesOnly, true);
    assert.strictEqual(capturedConfig?.noSelfReport, false);
  });

  type EnvVarTest = {
    envVar: string;
    value: string;
    field: keyof SecureAppInstrumentationConfig;
    expected: number | boolean;
  };

  const envVarTests: EnvVarTest[] = [
    { envVar: 'SPLUNK_SECUREAPP_DEPENDENCY_SCAN_INTERVAL', value: '3600000', field: 'dependencyScanInterval', expected: 3600000 },
    { envVar: 'SPLUNK_SECUREAPP_DEPENDENCY_INITIAL_DELAY', value: '120', field: 'initialDelaySeconds', expected: 120 },
    { envVar: 'SPLUNK_SECUREAPP_RUNTIME_PACKAGES_ONLY', value: 'false', field: 'runtimePackagesOnly', expected: false },
    { envVar: 'SPLUNK_SECUREAPP_NO_SELF_REPORT', value: 'true', field: 'noSelfReport', expected: true },
  ];

  for (const { envVar, value, field, expected } of envVarTests) {
    it(`reads ${envVar} from env`, () => {
      process.env[envVar] = value;
      let capturedConfig: SecureAppInstrumentationConfig | undefined;

      class TestInstrumentation {
        constructor(config?: SecureAppInstrumentationConfig) {
          capturedConfig = config;
        }
      }

      startSecureapp({ instrumentation: TestInstrumentation as any });

      assert.strictEqual(capturedConfig?.[field], expected);
    });
  }

  it('option values take precedence over env vars', () => {
    process.env.SPLUNK_SECUREAPP_DEPENDENCY_SCAN_INTERVAL = '999999';
    process.env.SPLUNK_SECUREAPP_DEPENDENCY_INITIAL_DELAY = '999';
    process.env.SPLUNK_SECUREAPP_RUNTIME_PACKAGES_ONLY = 'false';
    process.env.SPLUNK_SECUREAPP_NO_SELF_REPORT = 'true';

    let capturedConfig: SecureAppInstrumentationConfig | undefined;

    class TestInstrumentation {
      constructor(config?: SecureAppInstrumentationConfig) {
        capturedConfig = config;
      }
    }

    startSecureapp({
      instrumentation: TestInstrumentation as any,
      dependencyScanInterval: 60000,
      initialDelaySeconds: 10,
      runtimePackagesOnly: true,
      noSelfReport: false,
    });

    assert.strictEqual(capturedConfig?.dependencyScanInterval, 60000);
    assert.strictEqual(capturedConfig?.initialDelaySeconds, 10);
    assert.strictEqual(capturedConfig?.runtimePackagesOnly, true);
    assert.strictEqual(capturedConfig?.noSelfReport, false);
  });
});

describe('start() with secureapp', () => {
  let startLoggingMock: ReturnType<typeof mock.method>;
  let startSecureappMock: ReturnType<typeof mock.method>;

  beforeEach(() => {
    cleanEnvironment();
    mock.method(tracing, 'startTracing', () => true);
    mock.method(tracing, 'stopTracing', () => {});
    startLoggingMock = mock.method(logging, 'startLogging', () => ({
      stop: async () => {},
    }));
    startSecureappMock = mock.method(secureapp, 'startSecureapp', () => {});
  });

  afterEach(async () => {
    mock.restoreAll();
    await stop();
  });

  it('starts logging when secureapp is enabled', () => {
    process.env.SPLUNK_SECUREAPP_AGENT_ENABLED = 'true';
    start({ serviceName: 'test' });
    assert.strictEqual(startLoggingMock.mock.callCount(), 1);
  });

  it('does not start secureapp when SPLUNK_SECUREAPP_AGENT_ENABLED is false', () => {
    process.env.SPLUNK_SECUREAPP_AGENT_ENABLED = 'false';
    start({ serviceName: 'test' });
    assert.strictEqual(startSecureappMock.mock.callCount(), 0);
  });

  it('starts secureapp when SPLUNK_SECUREAPP_AGENT_ENABLED is true', () => {
    process.env.SPLUNK_SECUREAPP_AGENT_ENABLED = 'true';
    start({ serviceName: 'test' });
    assert.strictEqual(startSecureappMock.mock.callCount(), 1);
  });
});

describe('SecureAppInstrumentation log emission', () => {
  let exporter: InMemoryLogRecordExporter;
  let provider: LoggerProvider;

  beforeEach(() => {
    exporter = new InMemoryLogRecordExporter();
    provider = new LoggerProvider({
      processors: [new SimpleLogRecordProcessor(exporter)],
    });
    logsAPI.logs.setGlobalLoggerProvider(provider);
  });

  afterEach(async () => {
    await provider.shutdown();
    logsAPI.logs.disable();
  });

  it('emits a log record with event.name on scan', async () => {
    const instrumentation = new SecureAppInstrumentation();
    // Call scan() directly rather than relying on the timer
    await (instrumentation as any).scan();
    await provider.forceFlush();

    const records = exporter.getFinishedLogRecords();
    assert.ok(records.length > 0, 'expected at least one log record');
    assert.strictEqual(records[0].attributes['event.name'], 'com.cisco.secureapp.report.v1');
  });
});
