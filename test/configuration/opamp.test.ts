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
import { afterEach, beforeEach, describe, it } from 'node:test';
import {
  getConfigBoolean,
  loadConfiguration,
  resetConfiguration,
  setGlobalConfiguration,
} from '../../src/configuration';
import { cleanEnvironment } from '../utils';

describe('SPLUNK_OPAMP_REMOTE_CONFIG resolution', () => {
  beforeEach(() => {
    cleanEnvironment();
    resetConfiguration();
  });

  afterEach(() => {
    cleanEnvironment();
    resetConfiguration();
  });

  describe('from environment', () => {
    it('defaults to false when unset', () => {
      assert.strictEqual(
        getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false),
        false
      );
    });

    it('resolves true from the env var', () => {
      process.env.SPLUNK_OPAMP_REMOTE_CONFIG = 'true';
      assert.strictEqual(
        getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false),
        true
      );
    });

    it('resolves false from the env var', () => {
      process.env.SPLUNK_OPAMP_REMOTE_CONFIG = 'false';
      assert.strictEqual(
        getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false),
        false
      );
    });
  });

  describe('from declarative config', () => {
    function setConfig(yaml: string) {
      setGlobalConfiguration(loadConfiguration(yaml));
    }

    it('resolves true from opamp.features.remote_config', () => {
      setConfig(
        [
          'distribution:',
          '  splunk:',
          '    opamp:',
          '      features:',
          '        remote_config: true',
        ].join('\n')
      );
      assert.strictEqual(
        getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false),
        true
      );
    });

    it('resolves false when remote_config is false', () => {
      setConfig(
        [
          'distribution:',
          '  splunk:',
          '    opamp:',
          '      features:',
          '        remote_config: false',
        ].join('\n')
      );
      assert.strictEqual(
        getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false),
        false
      );
    });

    it('resolves false when the features block is absent', () => {
      setConfig(['distribution:', '  splunk:', '    opamp: {}'].join('\n'));
      assert.strictEqual(
        getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false),
        false
      );
    });
  });
});
