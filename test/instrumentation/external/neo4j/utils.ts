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
import { QueryResult } from 'neo4j-driver';
import { ReadableSpan } from '@opentelemetry/sdk-trace-base';
import {
  SEMATTRS_DB_NAME,
  SEMATTRS_DB_SYSTEM,
  SEMATTRS_DB_USER,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';

export const normalizeResponse = (response: QueryResult) => {
  return JSON.stringify(
    response.records.map((r) => {
      const asObject = r.toObject();
      r.keys.forEach((key) => delete asObject[key as any].identity);

      return asObject;
    })
  );
};

export const assertSpan = (span: ReadableSpan) => {
  assert.strictEqual(span.kind, SpanKind.CLIENT);
  assert.strictEqual(span.status.code, SpanStatusCode.UNSET);
  assert.strictEqual(span.attributes[SEMATTRS_DB_SYSTEM], 'neo4j');
  assert.strictEqual(span.attributes[SEMATTRS_DB_NAME], 'neo4j');
  assert.strictEqual(span.attributes[SEMATTRS_DB_USER], 'neo4j');
  assert.strictEqual(span.attributes[SEMATTRS_NET_PEER_NAME], 'localhost');
  assert.strictEqual(span.attributes[SEMATTRS_NET_PEER_PORT], 11011);
  assert.strictEqual(span.attributes[SEMATTRS_NET_TRANSPORT], 'IP.TCP');
};
