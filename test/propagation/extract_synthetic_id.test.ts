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

import { context, propagation } from '@opentelemetry/api';
import { RandomIdGenerator } from '@opentelemetry/sdk-trace-base';
import { assertIncludes } from './common';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { startTracing } from '../../src/tracing';
import { strict as assert } from 'assert';
import { test } from 'node:test';

test('propagation: extract synthetic run id', () => {
  const { tracingOptions } = parseOptionsAndConfigureInstrumentations();
  startTracing(tracingOptions);
  assertIncludes(propagation.fields(), 'baggage');

  const syntheticsTraceId = new RandomIdGenerator().generateTraceId();

  const incomingCarrier = {
    baggage: 'Synthetics-RunId=' + syntheticsTraceId,
  };
  const newContext = propagation.extract(context.active(), incomingCarrier);

  const outgoingCarrier = {};
  propagation.inject(newContext, outgoingCarrier);
  assert.strictEqual(
    outgoingCarrier['baggage'],
    'Synthetics-RunId=' + syntheticsTraceId
  );
});
