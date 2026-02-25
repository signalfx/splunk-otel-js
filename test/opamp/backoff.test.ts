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
import { ExponentialBackoff } from '../../src/opamp/backoff';

describe('ExponentialBackoff', () => {
  it('returns normal interval when no failures', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    assert.strictEqual(backoff.nextDelay(30_000), 30_000);
  });

  it('returns a value within the exponential range after setMinDelay', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    backoff.setMinDelay(5000);
    const delay = backoff.nextDelay(30_000);
    assert(delay >= 5000, `delay ${delay} should be >= 5000`);
    assert(delay <= 60_000, `delay ${delay} should be <= 60000`);
  });

  it('increases delay range exponentially on failures', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 128_000 });
    backoff.setMinDelay(0);

    for (let i = 0; i < 8; i++) {
      const delay = backoff.nextDelay(30_000);
      const exp = Math.pow(2, i) * 1000;
      const maxJitter = 1000;
      assert(
        delay >= exp,
        `delay ${delay} should be >= ${exp} (failure ${i + 1})`
      );
      assert(
        delay <= exp + maxJitter,
        `delay ${delay} should be <= ${exp + maxJitter} (failure ${i + 1})`
      );
    }
  });

  it('caps delay at maxMs', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 5000 });
    backoff.setMinDelay(0);

    for (let i = 0; i < 20; i++) {
      backoff.nextDelay(30_000);
    }

    const delay = backoff.nextDelay(30_000);
    assert(delay >= 5000, `delay ${delay} should be >= 5000`);
    assert(delay <= 6000, `delay ${delay} should be capped at 6000`);
  });

  it('resets to normal after reset()', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    backoff.setMinDelay(0);
    assert(backoff.nextDelay(30_000) < 30_000);

    backoff.reset();
    assert.strictEqual(backoff.nextDelay(30_000), 30_000);
  });

  it('clears minDelay override after one use', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    backoff.setMinDelay(10_000);
    const first = backoff.nextDelay(30_000);
    assert(first >= 10_000, `first delay ${first} should honor minDelay`);

    const second = backoff.nextDelay(30_000);
    assert(second >= 2000, `second delay ${second} should be >= 2000`);
    assert(second <= 3000, `second delay ${second} should not have override`);
  });
});
