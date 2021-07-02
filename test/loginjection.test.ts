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
import { Writable } from 'stream';
import { context, trace } from '@opentelemetry/api';
import { startTracing } from '../src/tracing';
import type * as pino from 'pino';
import type * as bunyan from 'bunyan';
import type * as winston from 'winston';

describe('log injection', () => {
  let stream: Writable;
  let record: any;

  function assertInjection(logger, done, extra) {
    const span = trace.getTracer('test').startSpan('main');
    context.with(trace.setSpan(context.active(), span), () => {
      const { traceId, spanId } = span.spanContext();
      logger.info('my-log-message');
      assert.strictEqual(record['trace_id'], traceId);
      assert.strictEqual(record['span_id'], spanId);
      assert.strictEqual(record['service.name'], 'test-service');

      for (const [key, value] of extra || []) {
        assert.strictEqual(record[key], value);
      }

      done();
    });
  }

  before(() => {
    startTracing({ logInjectionEnabled: true, serviceName: 'test-service' });
  });

  beforeEach(() => {
    stream = new Writable({
      write: chunk => {
        record = JSON.parse(chunk);
      },
    });
    record = {};
  });

  it('injects context to bunyan records', done => {
    const logger: bunyan = require('bunyan').createLogger({
      name: 'test',
      stream,
    });
    assertInjection(logger, done);
  });

  it('injects context to pino records', done => {
    const logger: pino = require('pino')(stream);
    assertInjection(logger, done);
  });

  it('injects context to winston records', done => {
    const winston: winston = require('winston');
    const logger = winston.createLogger({
      transports: [new winston.transports.Stream({ stream })],
    });
    assertInjection(logger, done);
  });

  describe('injecting version and environment', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.version=1,deployment.environment=test';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('injects service version and service environment if available', done => {
      startTracing({ logInjectionEnabled: true, serviceName: 'test-service' });

      const logger: bunyan = require('bunyan').createLogger({
        name: 'test',
        stream,
      });

      assertInjection(logger, done, [
        ['service.version', '1'],
        ['service.environment', 'test'],
      ]);
    });
  });
});
