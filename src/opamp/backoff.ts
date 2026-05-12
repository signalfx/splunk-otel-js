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

export class ExponentialBackoff {
  private readonly _baseMs: number;
  private readonly _maxMs: number;
  private _failures: number = 0;
  private _minDelayOverride: number | null = null;

  constructor(opts: { baseMs: number; maxMs: number }) {
    this._baseMs = opts.baseMs;
    this._maxMs = opts.maxMs;
  }

  nextDelay(normalIntervalMs: number): number {
    if (this._failures === 0 && this._minDelayOverride === null) {
      return normalIntervalMs;
    }

    const randomDelayMs = Math.random() * 1_000;
    const expDelayMs = Math.min(
      this._baseMs * Math.pow(2, this._failures),
      this._maxMs
    );
    let delay = expDelayMs + randomDelayMs;

    if (this._minDelayOverride !== null) {
      delay = Math.max(delay, this._minDelayOverride);
      this._minDelayOverride = null;
    }

    this._failures++;
    return delay;
  }

  setMinDelay(delayMs: number): void {
    this._minDelayOverride = delayMs;
  }

  reset(): void {
    this._failures = 0;
    this._minDelayOverride = null;
  }
}
