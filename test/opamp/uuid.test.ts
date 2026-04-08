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
import { describe, it } from 'node:test';
import { uuid7 } from '../../src/opamp/uuid';

describe('uuid7', () => {
  it('returns 16 bytes', () => {
    assert.strictEqual(uuid7().length, 16);
  });

  it('has version 7 in the high nibble of byte 6', () => {
    const bytes = uuid7();
    assert.strictEqual(bytes[6] >> 4, 0x7);
  });

  it('has RFC 4122 variant bits (10xx) in byte 8', () => {
    const bytes = uuid7();
    assert.strictEqual(bytes[8] >> 6, 0b10);
  });

  it('encodes the current timestamp in bytes 0-5', () => {
    const before = Date.now();
    const bytes = uuid7();
    const after = Date.now();

    const ts =
      bytes[0] * 0x10000000000 +
      bytes[1] * 0x100000000 +
      bytes[2] * 0x1000000 +
      bytes[3] * 0x10000 +
      bytes[4] * 0x100 +
      bytes[5];

    assert(ts >= before, 'timestamp should be >= time before call');
    assert(ts <= after, 'timestamp should be <= time after call');
  });

  it('produces unique values', () => {
    const a = uuid7();
    const b = uuid7();
    assert.notDeepStrictEqual(a, b);
  });
});
