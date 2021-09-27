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
import * as util from 'util';
import { Writable } from 'stream';
import { context, trace } from '@opentelemetry/api';
import { startTracing, stopTracing } from '../src/tracing';
import { defaultLogHook } from '../src/instrumentations/logging.ts';
import type * as pino from 'pino';
import type * as bunyan from 'bunyan';
import type * as winston from 'winston';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';

describe('log injection', () => {
  let stream: Writable;
  let record: any;

  function assertInjection(logger, extra?) {
    const span = trace.getTracer('test').startSpan('main');
    extra = extra ?? [['service.name', 'test-service']];
    let traceId;
    let spanId;
    context.with(trace.setSpan(context.active(), span), () => {
      traceId = span.spanContext().traceId;
      spanId = span.spanContext().spanId;
      logger.info('my-log-message');
    });

    assert.strictEqual(record['trace_id'], traceId);
    assert.strictEqual(record['span_id'], spanId);

    for (const [key, value] of extra || []) {
      assert.strictEqual(record[key], value, `Invalid value for "${key}": ${util.inspect(record[key])}`);
    }
  }

  beforeEach(() => {
    stream = new Writable({
      write: chunk => {
        record = JSON.parse(chunk);
      },
    });
    record = {};
  });

  describe('default flow', () => {
    before(() => {
      startTracing({ logInjectionEnabled: true, serviceName: 'test-service' });
    });

    after(() => {
      stopTracing();
    });

    it('injects context to bunyan records', () => {
      const logger: bunyan = require('bunyan').createLogger({
        name: 'test',
        stream,
      });
      assertInjection(logger);
    });

    it('injects context to pino records', () => {
      const logger: pino.Logger = require('pino')(stream);
      assertInjection(logger);
    });

    it('injects context to winston records', () => {
      const winston: winston = require('winston');
      const logger = winston.createLogger({
        transports: [new winston.transports.Stream({ stream })],
      });
      assertInjection(logger);
    });
  });

  describe('injecting with custom hook', () => {
    afterEach(() => {
      stopTracing();
    });

    it('is possible to opt out from injecting resource attributes', () => {
      const MY_VALUE = 'myValue';
      const MY_ATTRIBUTE = 'myAttribute';
      startTracing({
        logInjectionEnabled: true,
        serviceName: 'test-service',
        instrumentations: [
          new PinoInstrumentation({
            logHook: (span, logRecord) => {
              logRecord[MY_ATTRIBUTE] = MY_VALUE;
            }
          }),
        ]
      });

      const logger: pino.Logger = require('pino')(stream);

      assertInjection(logger, [
        ['service.name', undefined],
        [MY_ATTRIBUTE, MY_VALUE],
      ]);
    });

    it('is easy enough do do both', () => {
      const MY_VALUE = 'myValue';
      const MY_ATTRIBUTE = 'myAttribute';
      startTracing({
        logInjectionEnabled: true,
        serviceName: 'test-service',
        instrumentations: [
          new PinoInstrumentation({
            logHook: (span, logRecord) => {
              defaultLogHook(span, logRecord);
              logRecord[MY_ATTRIBUTE] = MY_VALUE;
            }
          }),
        ]
      });

      const logger: pino.Logger = require('pino')(stream);

      assertInjection(logger, [
        ['service.name', 'test-service'],
        [MY_ATTRIBUTE, MY_VALUE],
      ]);
    });
  });

  describe('injecting version and environment', () => {
    before(() => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'service.version=1,deployment.environment=test';
    });

    after(() => {
      delete process.env.OTEL_RESOURCE_ATTRIBUTES;
    });

    it('injects service version and service environment if available', () => {
      startTracing({ logInjectionEnabled: true, serviceName: 'test-service' });

      const logger: bunyan = require('bunyan').createLogger({
        name: 'test',
        stream,
      });

      assertInjection(logger, [
        ['service.name', 'test-service'],
        ['service.version', '1'],
        ['service.environment', 'test'],
      ]);

      stopTracing();
    });
  });
});
