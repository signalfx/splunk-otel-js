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
import { beforeEach, describe, it } from 'node:test';
import { _setDefaultOptions } from '../../src/opamp';
import { cleanEnvironment } from '../utils';

describe('opamp options', () => {
  beforeEach(cleanEnvironment);

  it('uses default endpoint when not configured', () => {
    const options = _setDefaultOptions();
    assert.strictEqual(options.endpoint, 'http://localhost:4320/v1/opamp');
  });

  it('reads endpoint from SPLUNK_OPAMP_ENDPOINT', () => {
    process.env.SPLUNK_OPAMP_ENDPOINT =
      'http://opamp.example.com:4320/v1/opamp';
    const options = _setDefaultOptions();
    assert.strictEqual(
      options.endpoint,
      'http://opamp.example.com:4320/v1/opamp'
    );
  });

  it('prefers explicit endpoint over env var', () => {
    process.env.SPLUNK_OPAMP_ENDPOINT = 'http://env.example.com/v1/opamp';
    const options = _setDefaultOptions({
      endpoint: 'http://explicit.example.com/v1/opamp',
    });
    assert.strictEqual(
      options.endpoint,
      'http://explicit.example.com/v1/opamp'
    );
  });

  it('uses default polling interval', () => {
    const options = _setDefaultOptions();
    assert.strictEqual(options.pollingIntervalMs, 30_000);
  });

  it('reads polling interval from SPLUNK_OPAMP_POLLING_INTERVAL', () => {
    process.env.SPLUNK_OPAMP_POLLING_INTERVAL = '10000';
    const options = _setDefaultOptions();
    assert.strictEqual(options.pollingIntervalMs, 10_000);
  });

  it('resolves serviceName from OTEL_SERVICE_NAME', () => {
    process.env.OTEL_SERVICE_NAME = 'my-service';
    const options = _setDefaultOptions();
    assert.strictEqual(options.serviceName, 'my-service');
  });

  it('reads accessToken from SPLUNK_ACCESS_TOKEN', () => {
    process.env.SPLUNK_ACCESS_TOKEN = 'test-token';
    const options = _setDefaultOptions();
    assert.strictEqual(options.accessToken, 'test-token');
  });

  it('prefers explicit accessToken over env var', () => {
    process.env.SPLUNK_ACCESS_TOKEN = 'env-token';
    const options = _setDefaultOptions({ accessToken: 'explicit-token' });
    assert.strictEqual(options.accessToken, 'explicit-token');
  });
});
