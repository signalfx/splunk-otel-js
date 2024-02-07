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
import { startLogging, _setDefaultOptions } from '../src/logging';
import * as logsAPI from '@opentelemetry/api-logs';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs';

describe('logging', () => {
  describe('startLogging', () => {
    it('sets logprovider', () => {
      startLogging();
      const provider = logsAPI.logs.getLoggerProvider();
      assert(provider instanceof LoggerProvider);
    });

    it('allows overriding log processors', () => {
      const options = _setDefaultOptions({
        logRecordProcessorFactory: (options) => {
          return new SimpleLogRecordProcessor(new ConsoleLogRecordExporter());
        },
        serviceName: '',
      });
      const exporter = options.logRecordProcessorFactory(options);
      assert(exporter instanceof SimpleLogRecordProcessor);
    });
  });
});
