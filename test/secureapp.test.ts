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
import { describe, it } from 'node:test';

import { startSecureapp } from '../src/secureapp';
import type { SecureAppInstrumentationConfig } from '../src/secureapp/types';

describe('startSecureapp()', () => {
  it('instantiates the instrumentation class with config', () => {
    let capturedConfig: SecureAppInstrumentationConfig | undefined;
    let instantiated = false;

    class TestInstrumentation {
      constructor(config?: SecureAppInstrumentationConfig) {
        capturedConfig = config;
        instantiated = true;
      }
    }

    startSecureapp({
      instrumentation: TestInstrumentation as any,
      dependencyScanInterval: 60000,
      initialDelaySeconds: 10,
    });

    assert.strictEqual(instantiated, true);
    assert.deepStrictEqual(capturedConfig, {
      dependencyScanInterval: 60000,
      initialDelaySeconds: 10,
    });
  });

  it('is a no-op when no instrumentation class is provided', () => {
    assert.doesNotThrow(() => {
      startSecureapp({});
    });
  });

  it('passes undefined for unset config fields', () => {
    let capturedConfig: SecureAppInstrumentationConfig | undefined;

    class TestInstrumentation {
      constructor(config?: SecureAppInstrumentationConfig) {
        capturedConfig = config;
      }
    }

    startSecureapp({ instrumentation: TestInstrumentation as any });

    assert.strictEqual(capturedConfig?.dependencyScanInterval, undefined);
    assert.strictEqual(capturedConfig?.initialDelaySeconds, undefined);
  });

  it('passes partial config correctly', () => {
    let capturedConfig: SecureAppInstrumentationConfig | undefined;

    class TestInstrumentation {
      constructor(config?: SecureAppInstrumentationConfig) {
        capturedConfig = config;
      }
    }

    startSecureapp({
      instrumentation: TestInstrumentation as any,
      dependencyScanInterval: 5000,
    });

    assert.strictEqual(capturedConfig?.dependencyScanInterval, 5000);
    assert.strictEqual(capturedConfig?.initialDelaySeconds, undefined);
  });
});
