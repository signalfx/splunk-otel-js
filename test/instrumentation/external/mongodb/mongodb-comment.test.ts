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

import * as assert from 'assert';
import { after, afterEach, before, beforeEach, describe, it } from 'node:test';
import {
  context,
  propagation,
  trace,
  TextMapPropagator,
} from '@opentelemetry/api';
import {
  suppressTracing,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import { exporter, getTestSpans, provider, registerProvider } from '../setup';
import {
  MongoDBInstrumentation,
  MongoDBInstrumentationConfig,
} from '../../../../src/instrumentations/external/mongodb';
import type { MongoClient, CommandStartedEvent } from 'mongodb';
import { AlwaysOffSampler, TracerProvider } from '@opentelemetry/sdk-trace';

describe(
  'MongoDB command comment propagation',
  { skip: !process.env.RUN_MONGODB_TESTS },
  () => {
    let instrumentation: MongoDBInstrumentation;
    let client: MongoClient;
    let events: CommandStartedEvent[];
    const config: MongoDBInstrumentationConfig = {
      addCommentToCommands: true,
    };

    // Register each configuration before MongoDB loads, then enable only the one
    // needed by a test. Propagation settings cannot change on an existing instance.
    function create(options: MongoDBInstrumentationConfig = {}) {
      const instance = new MongoDBInstrumentation(options);
      instance.setTracerProvider(provider);
      instance.disable();
      return instance;
    }
    const instrumentations = {
      enabled: create(config),
      disabled: create(),
      unsupported: create({ ...config, supportsDocumentComments: () => false }),
      throwingSupport: create({
        ...config,
        supportsDocumentComments: () => {
          throw new Error('unknown support');
        },
      }),
      throwingPropagator: create({
        ...config,
        commentPropagator: {
          inject() {
            throw new Error('propagation failed');
          },
        } as unknown as TextMapPropagator,
      }),
      traceContextOnly: create({
        ...config,
        commentPropagator: new W3CTraceContextPropagator(),
      }),
    };

    before(async () => {
      registerProvider();
      const mongodb = require('mongodb');
      client = new mongodb.MongoClient(
        `mongodb://${process.env.MONGODB_HOST || '127.0.0.1'}:${process.env.MONGODB_PORT || 27017}`,
        { monitorCommands: true, serverSelectionTimeoutMS: 2000 }
      );
      await client.connect();
      client.on('commandStarted', (event) => events.push(event));
    });

    function configure(instance = instrumentations.disabled) {
      instrumentation?.disable();
      instrumentation = instance;
      instrumentation.setConfig();
      instrumentation.enable();
    }

    beforeEach(() => {
      configure(instrumentations.enabled);
      events = [];
      exporter.reset();
    });

    afterEach(() => {
      instrumentation.disable();
      instrumentation.setTracerProvider(trace.getTracerProvider());
    });

    after(async () => {
      await client?.close();
      for (const instance of Object.values(instrumentations)) {
        instance.disable();
      }
      context.disable();
      propagation.disable();
      trace.disable();
      await provider.shutdown();
    });

    async function run(command: Record<string, unknown> = { ping: 1 }) {
      const span = trace.getTracer('test').startSpan('application');
      try {
        return await context.with(trace.setSpan(context.active(), span), () =>
          client.db('otel_comment').command(command)
        );
      } finally {
        span.end();
      }
    }

    function assertPropagated(event: CommandStartedEvent) {
      const spanId = event.command.comment.traceparent.split('-')[2];
      const mongoSpan = getTestSpans().find(
        (span) => span.spanContext().spanId === spanId
      );
      assert.ok(
        mongoSpan,
        'propagated span must be an exported MongoDB client span'
      );
      assert.strictEqual(
        mongoSpan.instrumentationScope.name,
        '@opentelemetry/instrumentation-mongodb'
      );
      assert.ok(
        !String(mongoSpan.attributes['db.query.text']).includes('traceparent')
      );
    }

    it('propagates the MongoDB client span and preserves an application comment', async () => {
      const command = Object.freeze({
        ping: 1,
        comment: Object.freeze({ job: 'rollup' }),
      });
      await run(command);
      assert.deepStrictEqual(
        events[0].command.comment.originalComment,
        command.comment
      );
      assertPropagated(events[0]);
    });

    it('is disabled by default', async () => {
      configure();
      await run({ ping: 1, comment: null });
      assert.strictEqual(events[0].command.comment, null);
    });

    it('retains propagation settings when runtime configuration changes', async () => {
      instrumentation.setConfig({
        addCommentToCommands: false,
        supportsDocumentComments: () => false,
        commentPropagator: { inject() {} } as unknown as TextMapPropagator,
      });
      await run();
      assertPropagated(events[0]);
    });

    it('uses the default MongoDB support check when no callback is supplied', async () => {
      await run();
      assertPropagated(events[0]);
    });

    it('skips unsupported servers', async () => {
      configure(instrumentations.unsupported);
      await run();
      assert.ok(!Object.hasOwn(events[0].command, 'comment'));
    });

    it('does not fail commands when the support predicate throws', async () => {
      configure(instrumentations.throwingSupport);
      await run({ ping: 1, comment: null });
      assert.strictEqual(events[0].command.comment, null);
    });

    it('does not fail commands when the propagator throws', async () => {
      configure(instrumentations.throwingPropagator);
      await run({ ping: 1, comment: null });
      assert.strictEqual(events[0].command.comment, null);
    });

    it('uses the global propagator with baggage', async () => {
      const ctx = propagation.setBaggage(
        context.active(),
        propagation.createBaggage({ job: { value: 'rollup' } })
      );
      await context.with(ctx, () => run());
      assert.strictEqual(events[0].command.comment.baggage, 'job=rollup');
      assertPropagated(events[0]);
    });

    it('allows a trace-context-only override without changing global propagation', async () => {
      configure(instrumentations.traceContextOnly);
      const ctx = propagation.setBaggage(
        context.active(),
        propagation.createBaggage({ job: { value: 'rollup' } })
      );
      await context.with(ctx, () => run());
      assert.ok(!Object.hasOwn(events[0].command.comment, 'baggage'));
      assertPropagated(events[0]);
      const carrier = {};
      propagation.inject(ctx, carrier);
      assert.strictEqual(
        (carrier as Record<string, string>).baggage,
        'job=rollup'
      );
    });

    it('honors requireParentSpan and tracing suppression', async () => {
      await context.with(trace.deleteSpan(context.active()), () =>
        client.db('otel_comment').command({ ping: 1 })
      );
      assert.ok(!Object.hasOwn(events[0].command, 'comment'));
      await context.with(suppressTracing(context.active()), () => run());
      assert.ok(!Object.hasOwn(events[1].command, 'comment'));
    });

    it('propagates newly created root spans when requireParentSpan is false', async () => {
      instrumentation.setConfig({ requireParentSpan: false });
      await context.with(trace.deleteSpan(context.active()), () =>
        client.db('otel_comment').command({ ping: 1 })
      );
      assertPropagated(events[0]);
    });

    it('propagates valid unsampled MongoDB spans', async () => {
      const provider = new TracerProvider({ sampler: new AlwaysOffSampler() });
      instrumentation.setTracerProvider(provider);
      try {
        await run();
        const traceparent = events[0].command.comment.traceparent;
        assert.ok(traceparent.endsWith('-00'));
        const parent = getTestSpans().find(
          (span) => span.name === 'application'
        )!;
        assert.strictEqual(
          traceparent.split('-')[1],
          parent.spanContext().traceId
        );
        assert.notStrictEqual(
          traceparent.split('-')[2],
          parent.spanContext().spanId
        );
      } finally {
        await provider.shutdown();
      }
    });

    it('does not nest comments when a command object is reused', async () => {
      const command = { ping: 1, comment: { job: 'rollup' } };
      await run(command);
      await run(command);
      for (const event of events) {
        assert.deepStrictEqual(event.command.comment.originalComment, {
          job: 'rollup',
        });
        assertPropagated(event);
      }
      assert.notStrictEqual(
        events[0].command.comment.traceparent,
        events[1].command.comment.traceparent
      );
      assert.deepStrictEqual(command.comment, { job: 'rollup' });
    });

    it('propagates separate spans for CRUD and cursor batches', async () => {
      const collection = client.db('otel_comment').collection('items');
      const parent = trace.getTracer('test').startSpan('application');
      try {
        await context.with(
          trace.setSpan(context.active(), parent),
          async () => {
            await collection.deleteMany({});
            await collection.insertMany([{ a: 1 }, { a: 2 }, { a: 3 }]);
            await collection.updateOne({ a: 1 }, { $set: { b: 1 } });
            await collection
              .find({}, { batchSize: 1, comment: 'cursor-job' })
              .toArray();
            await collection.aggregate([{ $match: { a: 1 } }]).toArray();
            await collection.bulkWrite([{ insertOne: { document: { a: 4 } } }]);
            await collection.deleteMany({});
          }
        );
      } finally {
        parent.end();
      }
      assert.ok(events.some((event) => event.commandName === 'getMore'));
      for (const event of events) {
        assertPropagated(event);
        if (event.commandName === 'find' || event.commandName === 'getMore') {
          assert.strictEqual(
            event.command.comment.originalComment,
            'cursor-job'
          );
        }
      }
    });

    it('removes patches when instrumentation is disabled and restores them on enable', async () => {
      instrumentation.disable();
      await run();
      assert.ok(!Object.hasOwn(events[0].command, 'comment'));
      instrumentation.enable();
      await run();
      assertPropagated(events[1]);
    });
  }
);
