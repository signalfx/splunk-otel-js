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

import type * as pino from 'pino';
import { startTracing, stopTracing } from '../src/tracing';
import { TestLogStream, assertInjection } from './utils';
import { defaultLogHook } from '../src/instrumentations/logging';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

describe('pino with with custom hooks', () => {
  let logStream: TestLogStream;

  beforeEach(() => {
    logStream = new TestLogStream();
  });
  afterEach(() => {
    stopTracing();
  });

  it('is possible to opt out from injecting resource attributes', () => {
    const MY_VALUE = 'myValue';
    const MY_ATTRIBUTE = 'myAttribute';
    startTracing({
      serviceName: 'test-service',
      instrumentations: [
        new PinoInstrumentation({
          logHook: (span, logRecord) => {
            logRecord[MY_ATTRIBUTE] = MY_VALUE;
          },
        }),
      ],
    });

    const logger: pino.Logger = require('pino')(logStream.stream);

    assertInjection(logStream, logger, [
      ['service.name', undefined],
      [MY_ATTRIBUTE, MY_VALUE],
    ]);
  });

  it('is easy enough do do both', () => {
    const MY_VALUE = 'myValueBoth';
    const MY_ATTRIBUTE = 'myAttributeBoth';
    startTracing({
      serviceName: 'test-service',
      instrumentations: [
        new PinoInstrumentation({
          logHook: (span, logRecord) => {
            defaultLogHook(span, logRecord);
            logRecord[MY_ATTRIBUTE] = MY_VALUE;
          },
        }),
      ],
    });

    const logger: pino.Logger = require('pino')(logStream.stream);

    assertInjection(logStream, logger, [
      ['service.name', 'test-service'],
      [MY_ATTRIBUTE, MY_VALUE],
    ]);
  });
});
