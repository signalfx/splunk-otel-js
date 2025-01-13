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

import { TestLogStream, assertInjection } from './utils';
import { startTracing, stopTracing } from '../src/tracing';
import type * as bunyan from 'bunyan';

describe('log injection', () => {
  let logStream: TestLogStream;

  beforeEach(() => {
    logStream = new TestLogStream();
  });

  describe('injecting version and environment', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.version=1,deployment.environment=test';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    // it('injects service version and service environment if available', () => {
    //   startTracing({ serviceName: 'test-service' });

    //   const logger: bunyan = require('bunyan').createLogger({
    //     name: 'test',
    //     stream: logStream.stream,
    //   });

    //   assertInjection(logStream, logger, [
    //     ['service.name', 'test-service'],
    //     ['service.version', '1'],
    //     ['service.environment', 'test'],
    //   ]);

    //   stopTracing();
    // });
  });
});
