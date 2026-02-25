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
import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import { opampGetEffectiveConfig } from '../../src/opamp/EffectiveConfig';
import { loadConfiguration } from '../../src/configuration';
import { cleanEnvironment } from '../utils';

describe('EffectiveConfig', () => {
  describe('opampGetEffectiveConfig', () => {
    beforeEach(() => {
      cleanEnvironment();
    });

    it('returns env type config with SPLUNK_ and OTEL_ vars when no yaml config loaded', () => {
      process.env.SPLUNK_ACCESS_TOKEN = 'test-token';
      process.env.OTEL_SERVICE_NAME = 'my-service';
      process.env.UNRELATED_VAR = 'should-not-appear';

      const config = opampGetEffectiveConfig();

      assert(config.configMap, 'should have configMap');
      assert(config.configMap.configMap, 'should have inner configMap');

      const envEntry = config.configMap.configMap['env'];
      assert(envEntry, 'should have env entry');
      assert.strictEqual(envEntry.contentType, 'text/plain');

      const body = new TextDecoder().decode(envEntry.body as Uint8Array);
      assert(
        body.includes('SPLUNK_ACCESS_TOKEN=test-token'),
        'should include SPLUNK_ vars'
      );
      assert(
        body.includes('OTEL_SERVICE_NAME=my-service'),
        'should include OTEL_ vars'
      );
      assert(
        !body.includes('UNRELATED_VAR'),
        'should not include unrelated vars'
      );
    });

    it('encodes body as Uint8Array', () => {
      process.env.OTEL_TRACES_EXPORTER = 'otlp';

      const config = opampGetEffectiveConfig();
      const envEntry = config.configMap!.configMap!['env'];

      assert(envEntry!.body instanceof Uint8Array, 'body should be Uint8Array');
    });

    it('returns empty content when no SPLUNK_ or OTEL_ vars are set', () => {
      const config = opampGetEffectiveConfig();
      const envEntry = config.configMap!.configMap!['env'];
      assert(envEntry, 'should still have env entry');

      const body = new TextDecoder().decode(envEntry.body as Uint8Array);
      assert.strictEqual(
        body,
        '',
        'body should be empty when no matching env vars'
      );
    });

    it('includes multiple env vars separated by newlines', () => {
      process.env.SPLUNK_REALM = 'us0';
      process.env.OTEL_LOG_LEVEL = 'debug';
      process.env.SPLUNK_TRACE_RESPONSE_HEADER_ENABLED = 'true';

      const config = opampGetEffectiveConfig();
      const envEntry = config.configMap!.configMap!['env'];
      const body = new TextDecoder().decode(envEntry!.body as Uint8Array);

      const lines = body.split('\n');
      assert.strictEqual(lines.length, 3, 'should have 3 env var lines');
      assert(lines.some((l) => l === 'SPLUNK_REALM=us0'));
      assert(lines.some((l) => l === 'OTEL_LOG_LEVEL=debug'));
      assert(
        lines.some((l) => l === 'SPLUNK_TRACE_RESPONSE_HEADER_ENABLED=true')
      );
    });

    it('returns yaml type config when yaml configuration is loaded', () => {
      const yamlContent = 'file_format: "1.0-rc.2"\nlog_level: warn\n';
      loadConfiguration(yamlContent);

      const config = opampGetEffectiveConfig();
      const yamlEntry = config.configMap!.configMap!['yaml'];
      assert(yamlEntry, 'should have yaml entry');
      assert.strictEqual(yamlEntry.contentType, 'application/yaml');

      const body = new TextDecoder().decode(yamlEntry.body as Uint8Array);
      assert.strictEqual(
        body,
        yamlContent,
        'body should match the raw yaml content'
      );

      assert.strictEqual(
        config.configMap!.configMap!['env'],
        undefined,
        'should not have env entry when yaml config is loaded'
      );
    });
  });
});
