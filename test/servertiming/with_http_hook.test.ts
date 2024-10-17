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
import { mockHttpServer, testHeadersAdded } from './common';
import { test } from 'node:test';

import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';

test('Server-Timing injection calls user provided hooks', async () => {
  const [server, url] = await mockHttpServer();

  test.after(async () => {
    server.close();
    await stopTracing();
  });

  let userHookCalled = false;
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      serverTimingEnabled: true,
      instrumentations: [
        new HttpInstrumentation({
          responseHook: (_span, _response) => {
            userHookCalled = true;
          },
        }),
      ],
    },
  });

  startTracing(tracingOptions);
  await testHeadersAdded(url);
  assert.strictEqual(userHookCalled, true);
});
