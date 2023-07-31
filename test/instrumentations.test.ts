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
import * as rewire from 'rewire';

import {
  bundledInstrumentations,
  getInstrumentations,
} from '../src/instrumentations';
import * as loader from '../src/instrumentations/loader';

import { cleanEnvironment } from './utils';
import { Instrumentation } from '@opentelemetry/instrumentation';

describe('instrumentations', () => {
  beforeEach(cleanEnvironment);
  after(cleanEnvironment);

  it('loads instrumentations if they are installed', () => {
    const loadedInstrumentations = getInstrumentations();
    assert.equal(loadedInstrumentations.length, 36);
  });

  it('loader silently fails when instrumentation is not installed', () => {
    const loader = require('../src/instrumentations/loader');
    const result = loader.load(
      '@opentelemetry/instrumentation-fs',
      'FsInstrumentation'
    );
    assert.strictEqual(result, null);
  });

  it('loader imports and returns object when package is available', () => {
    const HttpInstrumentation = function () {};
    const loader = rewire('../src/instrumentations/loader');
    const revert = loader.__set__('require', (module) => {
      return { HttpInstrumentation };
    });

    const got = loader.load(
      '@opentelemetry/instrumentation-http',
      'HttpInstrumentation'
    );
    assert.strictEqual(got, HttpInstrumentation);

    revert();
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
      assert(instrumentation.instrumentationName.includes(bundled.shortName));
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
});
