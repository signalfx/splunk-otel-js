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
import * as sinon from 'sinon';
import * as api from '@opentelemetry/api';

import { getNonEmptyEnvVar, parseLogLevel } from '../src/utils';
import { cleanEnvironment } from './utils';
import { DiagLogLevel } from '@opentelemetry/api';

describe('utils', () => {
  describe('logLevel', () => {
    it('can parse log levels', () => {
      assert.deepStrictEqual(parseLogLevel('none'), DiagLogLevel.NONE);
      assert.deepStrictEqual(parseLogLevel('abc'), DiagLogLevel.NONE);
      assert.deepStrictEqual(parseLogLevel('verbose'), DiagLogLevel.VERBOSE);
      assert.deepStrictEqual(parseLogLevel('debug'), DiagLogLevel.DEBUG);
      assert.deepStrictEqual(parseLogLevel('info'), DiagLogLevel.INFO);
      assert.deepStrictEqual(parseLogLevel('warn'), DiagLogLevel.WARN);
      assert.deepStrictEqual(parseLogLevel('error'), DiagLogLevel.ERROR);
      assert.deepStrictEqual(parseLogLevel(' error'), DiagLogLevel.ERROR);
      assert.deepStrictEqual(parseLogLevel('ERROR'), DiagLogLevel.ERROR);
    });
  });

  describe('getNonEmptyEnvVar', () => {
    const sandbox = sinon.createSandbox();
    let logger;

    beforeEach(() => {
      cleanEnvironment();
      logger = {
        warn: sandbox.spy(),
      };
      api.diag.setLogger(logger, api.DiagLogLevel.ALL);
      logger.warn.resetHistory();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('returns an empty environment variable as undefined', () => {
      process.env.OTEL_SERVICE_NAME = '';
      assert.deepStrictEqual(getNonEmptyEnvVar('OTEL_SERVICE_NAME'), undefined);
    });

    it('returns a whitespace environment variable as undefined', () => {
      process.env.OTEL_SERVICE_NAME = '  ';
      assert.deepStrictEqual(getNonEmptyEnvVar('OTEL_SERVICE_NAME'), undefined);
    });

    it('returns a defined environment variable', () => {
      process.env.OTEL_SERVICE_NAME = 'TEST';
      assert.deepStrictEqual(getNonEmptyEnvVar('OTEL_SERVICE_NAME'), 'TEST');
    });

    it('trims whitespace', () => {
      process.env.OTEL_SERVICE_NAME = ' TEST ';
      assert.deepStrictEqual(getNonEmptyEnvVar('OTEL_SERVICE_NAME'), 'TEST');
    });

    it('warns when reading an empty environment variable', () => {
      process.env.OTEL_SERVICE_NAME = '';
      assert.deepStrictEqual(getNonEmptyEnvVar('OTEL_SERVICE_NAME'), undefined);

      sinon.assert.calledWith(
        logger.warn,
        `Defined, but empty environment variable: 'OTEL_SERVICE_NAME'. The value will be considered as undefined.`
      );
    });
  });
});
