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
import { after, before, beforeEach, describe, it } from 'node:test';
import {
  ROOT_CONTEXT,
  TraceFlags,
  context,
  diag,
  propagation,
  trace,
  TextMapPropagator,
} from '@opentelemetry/api';
import {
  suppressTracing,
  W3CTraceContextPropagator,
} from '@opentelemetry/core';
import {
  MongoDBInstrumentation,
  MongoDBInstrumentationConfig,
} from '../../../../src/instrumentations/external/mongodb';
import {
  addCommentToMessage,
  getCommentContext,
  CommentPropagationContext,
  MongoDBMessage,
  MONGODB_COMMENT_CONTEXT_KEY,
} from '../../../../src/instrumentations/external/mongodb/comment-propagation';
import { provider, registerProvider } from '../setup';

before(registerProvider);
after(async () => {
  context.disable();
  propagation.disable();
  trace.disable();
  await provider.shutdown();
});

const commands = require('mongodb/lib/cmap/commands');
const bson = require('mongodb/lib/bson');

describe('MongoDB comment serialization', () => {
  const span = trace.wrapSpanContext({
    traceId: '0123456789abcdef0123456789abcdef',
    spanId: '0123456789abcdef',
    traceFlags: TraceFlags.SAMPLED,
  });
  const expectedTraceparent =
    '00-0123456789abcdef0123456789abcdef-0123456789abcdef-01';
  const defaults: CommentPropagationContext = {
    span,
    propagator: new W3CTraceContextPropagator(),
    server: {
      address: 'localhost:27017',
      maxWireVersion: 9,
      maxBsonObjectSize: 16777216,
      maxMessageSizeBytes: 48000000,
    },
  };

  function message(command: Record<string, unknown>, options = {}) {
    const Constructor = commands.OpMsgRequest || commands.Msg;
    return new Constructor(
      commands.OpMsgRequest ? 'test' : 'test.$cmd',
      { ...command },
      options
    );
  }

  function inject(
    msg: MongoDBMessage,
    config: Partial<CommentPropagationContext> = {}
  ) {
    addCommentToMessage(msg, ROOT_CONTEXT, {
      ...defaults,
      ...config,
    });
  }

  function decode(msg: ReturnType<typeof message>) {
    return bson.deserialize(msg.toBin()[2], { promoteValues: false });
  }

  it('injects a BSON document without an absent original comment', () => {
    const msg = message({ find: 'items', $clusterTime: { clusterTime: 42 } });
    inject(msg);
    assert.deepStrictEqual(decode(msg).comment, {
      traceparent: expectedTraceparent,
    });
  });

  for (const [name, value] of Object.entries({
    null: null,
    string: '',
    number: 0,
    boolean: false,
    array: ['job', 42],
    document: { traceparent: 'application-owned', job: 'rollup' },
    binary: Buffer.from([1, 2, 3]),
    date: new Date('2026-01-01'),
    long: bson.Long.fromString('9007199254740993'),
    objectId: new bson.ObjectId(),
    regexp: /job/i,
    decimal: bson.Decimal128.fromString('1.25'),
  })) {
    it(`preserves the BSON value and type of a ${name} comment`, () => {
      const msg = message({ find: 'items', comment: value });
      inject(msg);
      assert.deepStrictEqual(
        bson.serialize({ value: decode(msg).comment.originalComment }),
        bson.serialize({ value })
      );
      assert.strictEqual(msg.command.comment.originalComment, value);
    });
  }

  it('preserves the command and application comment objects', () => {
    const comment = Object.freeze({ job: 'rollup' });
    const msg = message({ find: 'items', comment });
    const originalCommand = msg.command;
    inject(msg);
    assert.notStrictEqual(msg.command, originalCommand);
    assert.strictEqual(originalCommand.comment, comment);
    assert.strictEqual(msg.command.comment.originalComment, comment);
  });

  it('uses the global propagator and retains baggage from the parent context', () => {
    const msg = message({ find: 'items' });
    const activeContext = propagation.setBaggage(
      ROOT_CONTEXT,
      propagation.createBaggage({ job: { value: 'rollup' } })
    );
    addCommentToMessage(msg, activeContext, {
      ...defaults,
      propagator: undefined,
    });
    assert.deepStrictEqual(decode(msg).comment, {
      traceparent: expectedTraceparent,
      baggage: 'job=rollup',
    });
  });

  it('propagates valid unsampled spans', () => {
    const msg = message({ find: 'items' });
    inject(msg, {
      span: trace.wrapSpanContext({
        ...span.spanContext(),
        traceFlags: TraceFlags.NONE,
      }),
    });
    assert.strictEqual(
      decode(msg).comment.traceparent,
      expectedTraceparent.slice(0, -2) + '00'
    );
  });

  it('reserves originalComment and safely handles special object keys', () => {
    const msg = message({ find: 'items', comment: null });
    inject(msg, {
      propagator: {
        inject(_ctx, carrier, setter) {
          setter!.set(carrier, 'originalComment', 'overwrite');
          setter!.set(carrier, '__proto__', 'propagated');
          setter!.set(carrier, 'custom', 'format');
        },
      } as TextMapPropagator,
    });
    const comment = decode(msg).comment;
    assert.strictEqual(comment.originalComment, null);
    assert.strictEqual(comment.custom, 'format');
    assert.strictEqual(comment.__proto__, 'propagated');
  });

  it('leaves the original command alone when the propagator injects nothing', () => {
    const msg = message({ find: 'items', comment: null });
    const original = msg.command;
    inject(msg, {
      propagator: { inject() {} } as unknown as TextMapPropagator,
    });
    assert.strictEqual(msg.command, original);
  });

  it('reserves originalComment even when a propagator writes directly to the carrier', () => {
    const msg = message({ find: 'items' });
    inject(msg, {
      propagator: {
        inject(_ctx: unknown, carrier: Record<string, unknown>) {
          carrier.originalComment = 'overwrite';
          carrier.custom = 'format';
        },
      } as unknown as TextMapPropagator,
    });
    assert.deepStrictEqual(decode(msg).comment, { custom: 'format' });
  });

  for (const limit of ['maxBsonObjectSize', 'maxMessageSizeBytes'] as const) {
    for (const hasComment of [false, true]) {
      it(`preserves the original command when ${limit} is exceeded (${hasComment ? 'with' : 'without'} comment)`, () => {
        const command = {
          find: 'items',
          lsid: { id: new bson.ObjectId() },
          ...(hasComment ? { comment: null } : {}),
        };
        const candidate = message(command);
        inject(candidate);
        const buffers = candidate.toBin();
        const required =
          limit === 'maxBsonObjectSize'
            ? buffers[2].byteLength
            : buffers.reduce((n: number, b: Uint8Array) => n + b.byteLength, 0);
        const msg = message(command);
        const original = msg.command;
        inject(msg, { server: { ...defaults.server, [limit]: required - 1 } });
        assert.strictEqual(msg.command, original);
        assert.deepStrictEqual(msg.toBin()[2], message(command).toBin()[2]);

        const exact = message(command);
        inject(exact, { server: { ...defaults.server, [limit]: required } });
        assert.strictEqual(
          decode(exact).comment.traceparent,
          expectedTraceparent
        );
      });
    }
  }

  it('accounts for bulk-write document sequences in the wire size', (t) => {
    if (!commands.DocumentSequence) {
      t.skip('Document sequences are unavailable in this driver version');
      return;
    }
    const command = () => ({
      bulkWrite: 1,
      ops: new commands.DocumentSequence('ops', [
        { insert: 0, document: { a: 1 } },
      ]),
      nsInfo: new commands.DocumentSequence('nsInfo', [{ ns: 'test.items' }]),
    });
    const candidate = message(command());
    inject(candidate);
    const required = candidate
      .toBin()
      .reduce((n: number, b: Uint8Array) => n + b.byteLength, 0);
    const msg = message(command());
    const original = msg.command;
    inject(msg, {
      server: { ...defaults.server, maxMessageSizeBytes: required - 1 },
    });
    assert.strictEqual(msg.command, original);
    const exact = message(command());
    inject(exact, {
      server: { ...defaults.server, maxMessageSizeBytes: required },
    });
    const buffers = exact.toBin();
    assert.strictEqual(
      buffers.reduce((n: number, b: Uint8Array) => n + b.byteLength, 0),
      required
    );
    assert.strictEqual(
      bson.deserialize(buffers[2]).comment.traceparent,
      expectedTraceparent
    );
  });

  it('serializes application BSON values only once on successful injection', () => {
    let calls = 0;
    const msg = message({
      find: 'items',
      filter: { toBSON: () => ({ calls: ++calls }) },
    });
    inject(msg);
    assert.strictEqual(calls, 1);
    decode(msg);
    assert.strictEqual(calls, 1);
  });

  it('preserves cursor comments retained in operation options by older drivers', () => {
    const msg = message({
      getMore: bson.Long.fromNumber(1),
      collection: 'items',
    });
    inject(msg, { inheritedComment: { value: null } });
    assert.strictEqual(decode(msg).comment.originalComment, null);
  });

  for (const key of ['invalid\0key', 'non-string']) {
    it(`rejects invalid propagator output (${key.replace('\0', 'NUL')}) before modifying a command`, () => {
      const msg = message({ find: 'items', comment: null });
      const original = msg.command;
      assert.throws(
        () =>
          inject(msg, {
            propagator: {
              inject(_ctx, carrier, setter) {
                setter!.set(
                  carrier,
                  key,
                  key === 'non-string' ? (42 as any) : 'value'
                );
              },
            } as TextMapPropagator,
          }),
        TypeError
      );
      assert.strictEqual(msg.command, original);
    });
  }

  it('uses the driver ignoreUndefined serialization option', () => {
    for (const ignoreUndefined of [true, false]) {
      const msg = message(
        { find: 'items', comment: undefined },
        { ignoreUndefined }
      );
      inject(msg);
      const comment = decode(msg).comment;
      assert.strictEqual(
        Object.hasOwn(comment, 'originalComment'),
        !ignoreUndefined
      );
      if (!ignoreUndefined) assert.strictEqual(comment.originalComment, null);
    }
  });

  describe('connection capabilities', () => {
    let config: MongoDBInstrumentationConfig;
    const getConnectionContext = (connection: unknown) =>
      getCommentContext(
        config,
        span,
        connection as any,
        undefined,
        undefined,
        diag
      );

    beforeEach(() => {
      config = { supportsDocumentComments: () => true };
    });

    for (const [name, maxWireVersion, supported] of [
      ['missing', undefined, false],
      ['MongoDB 4.2', 8, false],
      ['MongoDB 4.4', 9, true],
      ['newer MongoDB', 25, true],
      ['NaN', NaN, false],
      ['infinite', Infinity, false],
      ['fractional', 9.5, false],
    ] as const) {
      it(`checks document-comment support by default (${name})`, () => {
        config = new MongoDBInstrumentation({
          enabled: false,
          addCommentToCommands: true,
        }).getConfig();
        const ctx = getConnectionContext({
          address: 'localhost:27017',
          description: { ...defaults.server, maxWireVersion },
        });
        assert.strictEqual(
          ctx.getValue(MONGODB_COMMENT_CONTEXT_KEY) !== undefined,
          supported
        );
      });
    }

    for (const description of [
      undefined,
      { ...defaults.server, maxBsonObjectSize: undefined },
      { ...defaults.server, maxMessageSizeBytes: NaN },
      { ...defaults.server, maxMessageSizeBytes: 0 },
    ]) {
      it(`skips unknown or invalid negotiated limits (${JSON.stringify(description)})`, () => {
        const ctx = getConnectionContext({ address: 'localhost', description });
        assert.strictEqual(
          ctx.getValue(MONGODB_COMMENT_CONTEXT_KEY),
          undefined
        );
      });
    }

    it('allows an explicitly supported compatible server with its own wire version', () => {
      config = {
        supportsDocumentComments: (server) =>
          server.address === 'known-compatible:27017',
      };
      const ctx = getConnectionContext({
        address: 'known-compatible:27017',
        description: { ...defaults.server, maxWireVersion: 8 },
      });
      const propagationContext = ctx.getValue(
        MONGODB_COMMENT_CONTEXT_KEY
      ) as CommentPropagationContext;
      assert.strictEqual(propagationContext.server.maxWireVersion, 8);
    });

    it('does not propagate while tracing is suppressed', () => {
      const ctx = context.with(suppressTracing(context.active()), () =>
        getConnectionContext({
          address: 'localhost',
          description: defaults.server,
        })
      );
      assert.strictEqual(ctx.getValue(MONGODB_COMMENT_CONTEXT_KEY), undefined);
    });
  });
});
