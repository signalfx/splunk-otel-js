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
import { describe, it, beforeEach } from 'node:test';
import {
  getLoadedConfigurationString,
  loadConfiguration,
} from '../../src/configuration';
import { cleanEnvironment } from '../utils';

describe('EffectiveConfig', () => {
  describe('getLoadedConfigurationString', () => {
    beforeEach(() => {
      cleanEnvironment();
    });

    it('returns env type with SPLUNK_ and OTEL_ vars when no yaml config loaded', () => {
      process.env.SPLUNK_ACCESS_TOKEN = 'test-token';
      process.env.OTEL_SERVICE_NAME = 'my-service';
      process.env.UNRELATED_VAR = 'should-not-appear';

      const config = getLoadedConfigurationString();

      assert.strictEqual(config.type, 'env');
      assert(
        config.content.includes('SPLUNK_ACCESS_TOKEN=test-token'),
        'should include SPLUNK_ vars'
      );
      assert(
        config.content.includes('OTEL_SERVICE_NAME=my-service'),
        'should include OTEL_ vars'
      );
      assert(
        !config.content.includes('UNRELATED_VAR'),
        'should not include unrelated vars'
      );
    });

    it('returns empty content when no SPLUNK_ or OTEL_ vars are set', () => {
      const config = getLoadedConfigurationString();

      assert.strictEqual(config.type, 'env');
      assert.strictEqual(config.content, '');
    });

    it('includes multiple env vars separated by newlines', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.OTEL_LOG_LEVEL = 'debug';
      process.env.SPLUNK_TRACE_RESPONSE_HEADER_ENABLED = 'true';

      const config = getLoadedConfigurationString();

      assert.strictEqual(config.type, 'env');
      const lines = config.content.split('\n');
      assert.strictEqual(lines.length, 3, 'should have 3 env var lines');
      assert(lines.some((l) => l === 'SPLUNK_REALM=us0'));
      assert(lines.some((l) => l === 'OTEL_LOG_LEVEL=debug'));
      assert(
        lines.some((l) => l === 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED=true')
      );
    });

    it('returns yaml type when yaml configuration is loaded', () => {
      process.env.MY_LOG_LEVEL = 'warn';
      const yamlContent =
        'file_format: "1.0-rc.2"\nlog_level: ${MY_LOG_LEVEL}\n';
      loadConfiguration(yamlContent);

      const config = getLoadedConfigurationString();

      assert.strictEqual(config.type, 'yaml');
      assert.strictEqual(
        config.content,
        'file_format: "1.0-rc.2"\nlog_level: warn\n'
      );
    });
  });
});
