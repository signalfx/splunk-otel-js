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

import { randomBytes } from 'node:crypto';

export function uuid7(): Uint8Array {
  const bytes = new Uint8Array(randomBytes(16));
  const ms = Date.now();
  // Bytes 0-5: Unix timestamp in milliseconds, big-endian
  bytes[0] = Math.floor(ms / 0x10000000000) & 0xff;
  bytes[1] = Math.floor(ms / 0x100000000) & 0xff;
  bytes[2] = Math.floor(ms / 0x1000000) & 0xff;
  bytes[3] = Math.floor(ms / 0x10000) & 0xff;
  bytes[4] = Math.floor(ms / 0x100) & 0xff;
  bytes[5] = ms & 0xff;
  // Version 7 in the high nibble of byte 6
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  // Variant 10xx in the high 2 bits of byte 8
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return bytes;
}
