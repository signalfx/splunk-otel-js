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
import { SpanKind } from '@opentelemetry/api';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { HttpTransport } from '../../src/opamp/HttpTransport';

const httpInstrumentation = new HttpInstrumentation();

import * as http from 'http';

const memoryExporter = new InMemorySpanExporter();
const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(memoryExporter)],
});
httpInstrumentation.setTracerProvider(provider);
provider.register();

describe('HttpTransport', () => {
  let server: http.Server;
  let port: number;
  let lastRequestBody: Buffer;
  let lastRequestHeaders: http.IncomingHttpHeaders;
  let lastRequestMethod: string | undefined;
  let responseBody: Uint8Array;
  let responseStatus: number;

  beforeEach(async () => {
    lastRequestBody = Buffer.alloc(0);
    lastRequestHeaders = {};
    lastRequestMethod = undefined;
    responseStatus = 200;
    responseBody = new Uint8Array(0);

    server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      lastRequestMethod = req.method;
      lastRequestHeaders = req.headers;
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        lastRequestBody = Buffer.concat(chunks);
        res.writeHead(responseStatus, {
          'Content-Type': 'application/x-protobuf',
        });
        res.end(Buffer.from(responseBody));
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        port = (server.address() as { port: number }).port;
        resolve();
      });
    });
  });

  afterEach(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it('sends data via POST', async () => {
    const transport = new HttpTransport(`http://127.0.0.1:${port}/v1/opamp`);
    const payload = new Uint8Array([1, 2, 3, 4]);
    await transport.send(payload);

    assert.strictEqual(lastRequestMethod, 'POST');
    assert.deepStrictEqual(new Uint8Array(lastRequestBody), payload);
  });

  it('sets Content-Type to application/x-protobuf', async () => {
    const transport = new HttpTransport(`http://127.0.0.1:${port}/v1/opamp`);
    await transport.send(new Uint8Array([1]));

    assert.strictEqual(
      lastRequestHeaders['content-type'],
      'application/x-protobuf'
    );
  });

  it('includes Authorization header when accessToken is provided', async () => {
    const transport = new HttpTransport(
      `http://127.0.0.1:${port}/v1/opamp`,
      'my-token'
    );
    await transport.send(new Uint8Array([1]));

    assert.strictEqual(lastRequestHeaders['authorization'], 'Bearer my-token');
  });

  it('does not include Authorization header when no accessToken', async () => {
    const transport = new HttpTransport(`http://127.0.0.1:${port}/v1/opamp`);
    await transport.send(new Uint8Array([1]));

    assert.strictEqual(lastRequestHeaders['authorization'], undefined);
  });

  it('returns response status code and body', async () => {
    responseStatus = 200;
    responseBody = new Uint8Array([10, 20, 30]);

    const transport = new HttpTransport(`http://127.0.0.1:${port}/v1/opamp`);
    const response = await transport.send(new Uint8Array([1]));

    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.body, new Uint8Array([10, 20, 30]));
  });

  it('returns non-200 status codes', async () => {
    responseStatus = 500;
    responseBody = new Uint8Array(0);

    const transport = new HttpTransport(`http://127.0.0.1:${port}/v1/opamp`);
    const response = await transport.send(new Uint8Array([1]));

    assert.strictEqual(response.statusCode, 500);
  });

  it('rejects on connection error', async () => {
    const transport = new HttpTransport('http://127.0.0.1:1/v1/opamp');
    await assert.rejects(() => transport.send(new Uint8Array([1])));
  });

  it('does not generate traces for HTTP requests', async () => {
    memoryExporter.reset();

    const transport = new HttpTransport(`http://127.0.0.1:${port}/v1/opamp`);
    await transport.send(new Uint8Array([1, 2, 3]));

    const clientSpans = memoryExporter
      .getFinishedSpans()
      .filter((s) => s.kind === SpanKind.CLIENT);
    assert.strictEqual(
      clientSpans.length,
      0,
      `expected no client spans, got ${clientSpans.length}`
    );
  });
});
