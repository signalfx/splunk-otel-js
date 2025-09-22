/*
 * Copyright Splunk Inc., The OpenTelemetry Authors
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

import type * as http from 'http';
import type * as https from 'https';
import { Span, Attributes, SpanKind, HrTime } from '@opentelemetry/api';

export type Http = typeof http;
export type Https = typeof https;

export interface Err extends Error {
  errno?: number;
  code?: string;
  path?: string;
  syscall?: string;
  stack?: string;
}

/**
 * Tracks whether this instrumentation emits old experimental,
 * new stable, or both semantic conventions.
 *
 * Enum values chosen such that the enum may be used as a bitmask.
 */
export const enum SemconvStability {
  /** Emit only stable semantic conventions */
  STABLE = 0x1,
  /** Emit only old semantic conventions*/
  OLD = 0x2,
  /** Emit both stable and old semantic conventions*/
  DUPLICATE = 0x1 | 0x2,
}

/**
 * Names of possible synthetic test sources.
 */
export const SYNTHETIC_TEST_NAMES = ['alwayson'];

/**
 * Names of possible synthetic bot sources.
 */
export const SYNTHETIC_BOT_NAMES = ['googlebot', 'bingbot'];

/**
 * REDACTED string used to replace sensitive information in URLs.
 */
export const STR_REDACTED = 'REDACTED';

/**
 * List of URL query keys that are considered sensitive and whose value should be redacted.
 */
export const DEFAULT_QUERY_STRINGS_TO_REDACT = [
  'sig',
  'Signature',
  'AWSAccessKeyId',
  'X-Goog-Signature',
] as const;

/**
 * Holds metadata (span, kind, start time, metric attributes) for an HTTP span used when recording duration
 */
export interface SpanDetails {
  span: Span;
  spanKind: SpanKind;
  startTime: HrTime;
  oldMetricsAttributes: Attributes;
  stableMetricsAttributes: Attributes;
}
