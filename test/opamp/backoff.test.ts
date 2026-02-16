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
    // Must be at least the override
    assert(delay >= 5000, `delay ${delay} should be >= 5000`);
    // First failure: max exponential is baseMs * 2^0 = 1000, but override wins
    assert(delay <= 60_000, `delay ${delay} should be <= 60000`);
  });

  it('increases delay range exponentially on failures', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    backoff.setMinDelay(0); // trigger failure mode

    // Consume first call (failure 0): exp = 1000 * 2^0 = 1000
    backoff.nextDelay(30_000);

    // Now on failure 1: exp = 1000 * 2^1 = 2000, delay = 2000 + jitter(0..1000)
    backoff.setMinDelay(0);
    const delay = backoff.nextDelay(30_000);
    assert(delay >= 2000, `delay ${delay} should be >= 2000 (failure 1)`);
    assert(delay <= 3000, `delay ${delay} should be <= 3000 (failure 1)`);
  });

  it('caps delay at maxMs', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 5000 });
    backoff.setMinDelay(0);

    // Burn through many failures to exceed maxMs
    for (let i = 0; i < 20; i++) {
      backoff.setMinDelay(0);
      backoff.nextDelay(30_000);
    }

    backoff.setMinDelay(0);
    const delay = backoff.nextDelay(30_000);
    // exp is capped at maxMs (5000), delay = 5000 + jitter(0..1000)
    assert(delay >= 5000, `delay ${delay} should be >= 5000`);
    assert(delay <= 6000, `delay ${delay} should be capped at 6000`);
  });

  it('resets to normal after reset()', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    backoff.setMinDelay(0);
    backoff.nextDelay(30_000); // trigger a failure

    backoff.reset();
    assert.strictEqual(backoff.nextDelay(30_000), 30_000);
  });

  it('clears minDelay override after one use', () => {
    const backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    backoff.setMinDelay(10_000);
    const first = backoff.nextDelay(30_000);
    assert(first >= 10_000, `first delay ${first} should honor minDelay`);

    // Second call: in failure mode (failure=1), but no override
    // exp = 1000 * 2^1 = 2000, delay = 2000 + jitter(0..1000)
    const second = backoff.nextDelay(30_000);
    assert(second >= 2000, `second delay ${second} should be >= 2000`);
    assert(second <= 3000, `second delay ${second} should not have override`);
  });
});
