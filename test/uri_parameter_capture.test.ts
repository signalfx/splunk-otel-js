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
import { startTracing, stopTracing } from '../src/tracing';
import { defaultSpanProcessorFactory } from '../src/tracing/options';
import * as utils from './utils';
import {
  InMemorySpanExporter,
  ReadableSpan,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';

const PORT = 9111;
const SERVER_URL = `http://localhost:${PORT}`;

describe('Capturing URI parameters', () => {
  let http;
  let server;
  let exporter;
  let spanProcessor: SpanProcessor;

  beforeEach(() => {
    utils.cleanEnvironment();
    exporter = new InMemorySpanExporter();
  });

  afterEach(() => {
    server?.close();
    stopTracing();
  });

  const setupServer = () => {
    http = require('http');
    server = http.createServer((req, res) => {
      res.end('ok');
    });
    server.listen(PORT);
  };

  const doRequest = (url: string): Promise<ReadableSpan[]> => {
    return new Promise((resolve, reject) => {
      const req = http.get(url, async () => {
        await spanProcessor.forceFlush();
        resolve(exporter.getFinishedSpans());
      });
      req.on('error', reject);
      req.end();
    });
  };

  const testOpts = () => ({
    spanExporterFactory: () => exporter,
    spanProcessorFactory: (options) => {
      return (spanProcessor = defaultSpanProcessorFactory(options));
    },
  });

  it('no uri parameters are captured by default', async () => {
    startTracing(testOpts());
    setupServer();
    const [span] = await doRequest(SERVER_URL);
    for (const key of Object.keys(span.attributes)) {
      assert.equal(key.startsWith('http.request.param'), false);
    }
  });

  it('uri parameters can be captured by keys', async () => {
    startTracing({
      captureHttpRequestUriParams: ['sortBy', 'order', 'yes'],
      ...testOpts(),
    });
    setupServer();
    const [span] = await doRequest(
      `${SERVER_URL}/foo?sortBy=name&order=asc&order=desc&quux=123&yes`
    );
    assert.deepStrictEqual(span.attributes['http.request.param.sortBy'], [
      'name',
    ]);
    assert.deepStrictEqual(span.attributes['http.request.param.order'], [
      'asc',
      'desc',
    ]);
    assert.deepStrictEqual(span.attributes['http.request.param.yes'], ['']);
    assert.deepEqual(span.attributes['http.request.param.quux'], undefined);
  });

  it('uri parameters can be captured by user supplied function', async () => {
    startTracing({
      captureHttpRequestUriParams: (span, params) => {
        const value = params['order'];
        if (value === undefined) {
          return;
        }

        const values = Array.isArray(value) ? value : [value];

        span.setAttribute('http.request.param.order', values);
      },
      ...testOpts(),
    });
    setupServer();
    const [span] = await doRequest(
      `${SERVER_URL}/foo?sortBy=name&order=asc&quux=123`
    );
    assert.equal(span.attributes['http.request.param.sortBy'], undefined);
    assert.equal(span.attributes['http.request.param.quux'], undefined);
    assert.deepStrictEqual(span.attributes['http.request.param.order'], [
      'asc',
    ]);
  });

  it('uri parameter keys are normalized', async () => {
    startTracing({
      captureHttpRequestUriParams: ["'();:@&=+$,/?#[]b ar._&-~-&123!*"],
      ...testOpts(),
    });
    setupServer();
    const [span] = await doRequest(
      `${SERVER_URL}/foo?%27()%3B%3A%40%26%3D%2B%24%2C%2F%3F%23%5B%5Db%20ar._%26-~-%26123!*=42`
    );
    assert.deepStrictEqual(
      span.attributes["http.request.param.'();:@&=+$,/?#[]b ar__&-~-&123!*"],
      ['42']
    );
  });
});
