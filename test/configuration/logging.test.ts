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
import { startLogging, _setDefaultOptions } from '../../src/logging';
import * as logsAPI from '@opentelemetry/api-logs';
import {
  LoggerProvider,
  SimpleLogRecordProcessor,
  ConsoleLogRecordExporter,
  BatchLogRecordProcessor,
} from '@opentelemetry/sdk-logs';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { strict as assert } from 'assert';
import { describe, it } from 'node:test';
import { loadAndSetExampleConfig } from './utils';
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http';

describe('logger provider via config file', () => {
  describe('startLogging', () => {
    it('sets up the logger provider', () => {
      loadAndSetExampleConfig();
      const { loggingOptions } = parseOptionsAndConfigureInstrumentations();

      startLogging(loggingOptions);

      assert.deepStrictEqual(loggingOptions.serviceName, 'test_service');

      const provider = logsAPI.logs.getLoggerProvider();
      assert(provider instanceof LoggerProvider);

      const internalState = provider['_sharedState'];
      const attributes = internalState.resource.attributes;
      assert.deepStrictEqual(attributes['string_key'], 'test_value');

      assert.deepStrictEqual(internalState['logRecordLimits'], {
        attributeCountLimit: 512,
        attributeValueLengthLimit: 8192,
      });

      const processors = internalState.processors;
      assert.deepStrictEqual(processors.length, 2);

      const [batchProcessor, simpleProcessor] = processors;

      assert.ok(simpleProcessor instanceof SimpleLogRecordProcessor);
      assert.ok(
        simpleProcessor['_exporter'] instanceof ConsoleLogRecordExporter
      );

      assert.ok(batchProcessor instanceof BatchLogRecordProcessor);

      assert.deepStrictEqual(batchProcessor['_maxExportBatchSize'], 256);
      assert.deepStrictEqual(batchProcessor['_maxQueueSize'], 1024);
      assert.deepStrictEqual(batchProcessor['_scheduledDelayMillis'], 6000);
      assert.deepStrictEqual(batchProcessor['_exportTimeoutMillis'], 25000);

      const bspExporter = batchProcessor['_exporter'];

      assert.ok(bspExporter instanceof OTLPLogExporter);

      const delegate = bspExporter['_delegate'];
      const transportParams =
        delegate['_transport']['_transport']['_parameters'];
      assert.deepStrictEqual(transportParams['timeoutMillis'], 12000);
      assert.deepStrictEqual(transportParams['compression'], 'gzip');
      assert.deepStrictEqual(
        transportParams['url'],
        'http://localhost:4318/v1/logs'
      );
      assert.deepStrictEqual(transportParams.headers(), {
        'api-key': '1234',
        'Content-Type': 'application/json',
      });
    });

    it('allows overriding log processors', () => {
      const options = _setDefaultOptions({
        logRecordProcessorFactory: () => {
          return new SimpleLogRecordProcessor(new ConsoleLogRecordExporter());
        },
        serviceName: '',
      });
      const exporter = options.logRecordProcessorFactory(options);
      assert(exporter instanceof SimpleLogRecordProcessor);
    });
  });
});
