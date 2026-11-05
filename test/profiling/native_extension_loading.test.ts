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
import { diag, DiagLogLevel } from '@opentelemetry/api';
import { it, mock } from 'node:test';

import { loadExtension } from '../../src/profiling';

it('logs an error when the profiling native extension is unavailable', () => {
  const logger = {
    error: mock.fn(),
  };
  diag.setLogger(logger, DiagLogLevel.ERROR);

  const nativeExtensionPath = require.resolve('../../src/native_ext');
  const cachedNativeExtension = require.cache[nativeExtensionPath];
  const missingExtensionError = new Error('No native build was found');
  const NativeModule = require('node:module');
  const missingNativeExtension = new NativeModule(nativeExtensionPath);
  missingNativeExtension.filename = nativeExtensionPath;
  missingNativeExtension.loaded = true;
  Object.defineProperty(missingNativeExtension.exports, 'profiling', {
    get() {
      throw missingExtensionError;
    },
  });
  require.cache[nativeExtensionPath] = missingNativeExtension;

  try {
    assert.strictEqual(loadExtension(), undefined);
    assert.strictEqual(logger.error.mock.callCount(), 1);
    assert.deepStrictEqual(logger.error.mock.calls[0].arguments, [
      'profiling: Unable to load extension. Profiling data will not be reported',
      missingExtensionError,
    ]);
  } finally {
    if (cachedNativeExtension === undefined) {
      delete require.cache[nativeExtensionPath];
    } else {
      require.cache[nativeExtensionPath] = cachedNativeExtension;
    }
    diag.disable();
  }
});
