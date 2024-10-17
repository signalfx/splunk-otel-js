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

import { mockHttpServer, testHeadersAdded } from './common';
import { test } from 'node:test';

import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing, stopTracing } from '../../src/tracing';

test('Server-Timing injection can be enabled via env var', async () => {
  process.env.SPLUNK_TRACE_RESPONSE_HEADER_ENABLED = 'true';
  const [server, url] = await mockHttpServer();

  test.after(async () => {
    server.close();
    await stopTracing();
  });

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  await testHeadersAdded(url);
});
