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

import { deduplicateByLast, parseLogLevel } from '../src/utils';
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

  describe('deduplicateBy', () => {
    it('returns an empty array for empty input', () => {});
    it('deduplicates by keys keeping the last element', () => {
      assert.deepStrictEqual(
        deduplicateByLast(
          [
            { a: 33 },
            { a: 1 },
            { a: 42 },
            { a: 0 },
            { a: 1, b: 'abc' },
            { a: 42 },
            { a: 33, b: 'xyz' },
          ],
          (v) => v.a
        ),
        [{ a: 0 }, { a: 1, b: 'abc' }, { a: 42 }, { a: 33, b: 'xyz' }]
      );
    });
  });
});
