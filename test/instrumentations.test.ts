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

import {
  bundledInstrumentations,
  getInstrumentations,
} from '../src/instrumentations';

import { cleanEnvironment } from './utils';
import { Instrumentation } from '@opentelemetry/instrumentation';

describe('instrumentations', () => {
  beforeEach(cleanEnvironment);
  after(cleanEnvironment);

  it('loads instrumentations if they are installed', () => {
    const loadedInstrumentations = getInstrumentations();
    assert.equal(loadedInstrumentations.length, 39);
  });

  it('does not load instrumentations if OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED is false', () => {
    process.env.OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED = 'false';
    assert.equal(getInstrumentations().length, 0);
  });

  it('can load instrumentations one at a time via env vars', () => {
    for (const bundled of bundledInstrumentations) {
      process.env.OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED = 'false';
      process.env[
        `OTEL_INSTRUMENTATION_${bundled.shortName.toUpperCase()}_ENABLED`
      ] = 'true';
      const instrumentations = getInstrumentations();
      assert.equal(instrumentations.length, 1);
      const instrumentation: Instrumentation = instrumentations[0];
      // Dots in the instrumentation name are removed in the short name, e.g. socket.io -> socketio
      const instrumentationName = instrumentation.instrumentationName.replace(
        '.',
        ''
      );
      assert(
        instrumentationName.includes(bundled.shortName.replace('_', '-')),
        instrumentation.instrumentationName
      );
      cleanEnvironment();
    }
  });

  it('can load multiple instrumentations via env vars', () => {
    process.env.OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED = 'false';
    process.env.OTEL_INSTRUMENTATION_REDIS_ENABLED = 'true';
    process.env.OTEL_INSTRUMENTATION_PG_ENABLED = 'true';
    const instrumentations = getInstrumentations();
    assert.equal(instrumentations.length, 2);
  });

  it('can disable a specific instrumentation', () => {
    process.env.OTEL_INSTRUMENTATION_REDIS_4_ENABLED = 'false';
    const loadedInstrumentations = getInstrumentations();
    assert.equal(
      loadedInstrumentations.find(
        (instr) =>
          instr.instrumentationName === '@opentelemetry/instrumentation-redis-4'
      ),
      undefined
    );
    assert.equal(loadedInstrumentations.length, 38);
  });
});
