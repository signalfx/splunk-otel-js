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

import * as instrumentations from '../src/instrumentations';
import * as loader from '../src/instrumentations/loader';

describe('instrumentations', () => {
  it('loads instrumentations if they are installed', () => {
    const loadedInstrumentations = instrumentations.getInstrumentations();
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
});
