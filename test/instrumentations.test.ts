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

import * as sinon from 'sinon';
import * as assert from 'assert';
import * as rewire from 'rewire';

import * as instrumentations from '../src/instrumentations';
import * as loader from '../src/instrumentations/loader';

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http'

describe('instrumentations', () => {
  it('does not load if packages are not installed', () => {
    const inst = instrumentations.getInstrumentations();
    // Note: the list here is the instrumentations among devDependencies
    assert.deepEqual(
      inst.map(i => i.instrumentationName),
      [
        '@opentelemetry/instrumentation-bunyan',
        '@opentelemetry/instrumentation-http',
        '@opentelemetry/instrumentation-pino',
        '@opentelemetry/instrumentation-redis',
        '@opentelemetry/instrumentation-winston',
      ]
    );
  });

  it('load instrumentations if they are not installed', () => {
    const loadStub = sinon.stub(loader, 'load');
    try {
      const inst = instrumentations.getInstrumentations();
      sinon.assert.callCount(loadStub, 28);
    } finally {
      loadStub.reset();
      loadStub.restore();
    }
  });

  it('loader silently fails when package is not installed', () => {
    const loader = require('../src/instrumentations/loader');
    const result = loader.load(
      '@opentelemetry/instrumentation-dns',
      'DnsInstrumentation'
    );
    assert.strictEqual(result, null);
  });

  it('loader imports and returns object when package is available', () => {
    const loader = require('../src/instrumentations/loader');

    const got = loader.load(
      '@opentelemetry/instrumentation-http',
      'HttpInstrumentation'
    );

    assert.strictEqual(got, HttpInstrumentation);
  });
});
