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
import type * as httpModule from 'http';
import { pickPort } from '../common';

import { context, trace } from '@opentelemetry/api';

const PORT_RANGE = [9_000, 9_999];

export function assertHeaders(
  spanContext: { traceId?: string; spanId?: string },
  response: any
) {
  const { traceId, spanId } = spanContext;

  assert.notStrictEqual(traceId, undefined);
  assert.notStrictEqual(spanId, undefined);

  assert.strictEqual(
    'Server-Timing',
    response.headers['access-control-expose-headers']
  );
  assert.strictEqual(
    `traceparent;desc="00-${traceId}-${spanId}-01"`,
    response.headers['server-timing']
  );
}

export async function mockHttpServer(): Promise<[httpModule.Server, string]> {
  const http: typeof httpModule = require('http');
  const server = http.createServer((_req, res) => {
    const spanContext = trace.getSpanContext(context.active());

    if (spanContext === undefined) {
      return res.end(JSON.stringify({}));
    }

    return res.end(
      JSON.stringify({
        traceId: spanContext.traceId,
        spanId: spanContext.spanId,
      })
    );
  });

  let port = pickPort(PORT_RANGE);
  let attempts = 0;

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      attempts++;

      if (attempts < 10) {
        setImmediate(() => {
          port = pickPort(PORT_RANGE);
          server.listen(port);
        });
      } else {
        throw err;
      }

      return;
    }

    throw err;
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve([server, `http://localhost:${port}`]);
    });
  });
}

export function testHeadersAdded(url: string) {
  return new Promise<void>((resolve) => {
    const http: typeof httpModule = require('http');
    http.get(url, (res) => {
      res.setEncoding('utf8');
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const serverContext = JSON.parse(body);
        assertHeaders(serverContext, res);
        resolve();
      });
    });
  });
}
