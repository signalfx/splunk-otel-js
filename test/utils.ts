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

import {
  AggregationTemporality,
  InstrumentType,
  MetricReader,
} from '@opentelemetry/sdk-metrics';
import * as assert from 'assert';
import * as util from 'util';
import { Writable } from 'stream';
import { context, trace } from '@opentelemetry/api';

const isConfigVarEntry = (key) => {
  const lowercased = key.toLowerCase();
  return (
    lowercased.includes('splunk_') ||
    lowercased.includes('signal_') ||
    lowercased.includes('otel_')
  );
};

/*
  Has a side-effect of deleting environment variables in the running process.
  To be used in tests to make sure:
  1. that we don't depend on the actual environment in the tests.
  2. there are no leaking setup between tests;

  An alternative would be to sinon.stub all relevant options and restore them
  between runs.
*/
export const cleanEnvironment = () => {
  Object.keys(process.env)
    .filter(isConfigVarEntry)
    .forEach((key) => {
      delete process.env[key];
    });
};

export const spinMs = (ms: number) => {
  const start = Date.now();
  while (Date.now() - start < ms) {}
};

export class TestMetricReader extends MetricReader {
  constructor(public temporality: AggregationTemporality) {
    super();
  }
  selectAggregationTemporality(
    instrumentType: InstrumentType
  ): AggregationTemporality {
    return this.temporality;
  }
  protected async onForceFlush() {}
  protected async onShutdown() {}
}

export class TestLogStream {
  public stream: Writable;
  public record = {};

  constructor() {
    this.stream = new Writable({
      write: (chunk) => {
        this.record = JSON.parse(chunk);
      },
    });
  }
}

export function assertInjection(
  stream: TestLogStream,
  logger: any,
  extra = [['service.name', 'test-service']]
) {
  const span = trace.getTracer('test').startSpan('main');
  let traceId;
  let spanId;
  context.with(trace.setSpan(context.active(), span), () => {
    traceId = span.spanContext().traceId;
    spanId = span.spanContext().spanId;
    logger.info('my-log-message');
  });

  assert.strictEqual(stream.record['trace_id'], traceId);
  assert.strictEqual(stream.record['span_id'], spanId);

  for (const [key, value] of extra || []) {
    assert.strictEqual(
      stream.record[key],
      value,
      `Invalid value for "${key}": ${util.inspect(stream.record[key])}`
    );
  }
}

export function calledWithExactly(mocked, expected) {
  const match = mocked.mock.calls.some((call) => {
    try {
      assert.deepStrictEqual(call.arguments[0], expected);
      return true;
    } catch (error) {
      return false;
    }
  });

  assert(match, `Expected call with: ${JSON.stringify(expected)} not found`);
}

export function calledOnceWithMatch(mocked, match: Object) {
  assert.strictEqual(
    mocked.mock.calls.length,
    1,
    'calledOnceWithMatch can only be used with a single call'
  );

  const callArgs = mocked.mock.calls[0].arguments[0];
  for (const key in match) {
    assert.deepEqual(callArgs[key], match[key], `key ${key} does not match`);
  }
}

export function mockMocha() {
  const isMocha = [
    'afterEach',
    'after',
    'beforeEach',
    'before',
    'describe',
    'it',
  ].forEach((fn) => {
    global[fn] = () => {
      console.error(`Attempted to call mock global mocha function`);
    };
  });
}
