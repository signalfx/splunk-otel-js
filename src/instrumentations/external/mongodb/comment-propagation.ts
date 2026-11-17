/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Context,
  DiagLogger,
  Span,
  TextMapPropagator,
  context,
  createContextKey,
  propagation,
  trace,
} from '@opentelemetry/api';
import { isTracingSuppressed } from '@opentelemetry/core';
import { Document, V4Connection } from './internal-types';
import { MongoDBInstrumentationConfig, MongoDBServerInfo } from './types';

interface CommentConnection {
  address: string;
  description?: Omit<MongoDBServerInfo, 'address'>;
}

export const MONGODB_COMMENT_CONTEXT_KEY = createContextKey(
  'mongodb-comment-propagation'
);

export interface CommentPropagationContext {
  span: Span;
  server: MongoDBServerInfo;
  propagator?: TextMapPropagator;
  inheritedComment?: { value: unknown };
}

export interface MongoDBMessage {
  command: Document;
  toBin(): Uint8Array[];
}

export interface MongoDBCommands {
  Msg?: new (...args: unknown[]) => MongoDBMessage;
  OpMsgRequest?: new (...args: unknown[]) => MongoDBMessage;
}

export function getCommentContext(
  config: Readonly<MongoDBInstrumentationConfig>,
  span: Span | undefined,
  connection: CommentConnection,
  commandType: string | undefined,
  options: unknown,
  diag: DiagLogger
): Context {
  const activeContext = context
    .active()
    .deleteValue(MONGODB_COMMENT_CONTEXT_KEY);
  if (
    !config.supportsDocumentComments ||
    !span ||
    !trace.isSpanContextValid(span.spanContext()) ||
    isTracingSuppressed(activeContext)
  ) {
    return activeContext;
  }
  try {
    const description = connection.description;
    if (!description) return activeContext;
    const server = Object.freeze({
      address: connection.address,
      maxWireVersion: description.maxWireVersion,
      maxBsonObjectSize: description.maxBsonObjectSize,
      maxMessageSizeBytes: description.maxMessageSizeBytes,
    });
    if (
      !Number.isSafeInteger(server.maxBsonObjectSize) ||
      server.maxBsonObjectSize <= 0 ||
      !Number.isSafeInteger(server.maxMessageSizeBytes) ||
      server.maxMessageSizeBytes <= 0 ||
      config.supportsDocumentComments(server) !== true
    ) {
      return activeContext;
    }
    return activeContext.setValue(MONGODB_COMMENT_CONTEXT_KEY, {
      span,
      server,
      propagator: config.commentPropagator,
      inheritedComment:
        commandType === 'getMore' &&
        options &&
        typeof options === 'object' &&
        'comment' in options
          ? { value: options.comment }
          : undefined,
    } satisfies CommentPropagationContext);
  } catch (err) {
    diag.debug('Skipping MongoDB comment propagation', err);
    return activeContext;
  }
}

export function createCallbackCommandRunner(
  original: V4Connection['commandCallback'],
  config: Readonly<MongoDBInstrumentationConfig>,
  diag: DiagLogger
) {
  return function (
    this: CommentConnection,
    span: Span | undefined,
    ...args: Parameters<V4Connection['commandCallback']>
  ) {
    return context.with(
      getCommentContext(
        config,
        span,
        this,
        Object.keys(args[1])[0],
        args[2],
        diag
      ),
      original,
      this,
      ...args
    );
  };
}

export function createPromiseCommandRunner(
  original: V4Connection['commandPromise'],
  config: Readonly<MongoDBInstrumentationConfig>,
  diag: DiagLogger
) {
  return function (
    this: CommentConnection,
    span: Span | undefined,
    args: Parameters<V4Connection['commandPromise']>
  ) {
    return context.with(
      getCommentContext(
        config,
        span,
        this,
        Object.keys(args[1])[0],
        args[2],
        diag
      ),
      original,
      this,
      ...args
    );
  };
}

/** Inject after the driver has added session, API, and database fields. */
export function addCommentToMessage(
  message: MongoDBMessage,
  activeContext: Context,
  propagationContext: CommentPropagationContext
): void {
  const injected: Record<string, unknown> = Object.create(null);
  const setter = {
    set(target: Record<string, unknown>, key: string, value: string) {
      if (key === 'originalComment') return;
      target[key] = value;
    },
  };
  const injectionContext = trace.setSpan(
    activeContext,
    propagationContext.span
  );
  if (propagationContext.propagator) {
    propagationContext.propagator.inject(injectionContext, injected, setter);
  } else {
    propagation.inject(injectionContext, injected, setter);
  }
  const carrier: Record<string, unknown> = Object.create(null);
  for (const [key, value] of Object.entries(injected)) {
    if (key === 'originalComment') continue;
    if (typeof value !== 'string' || key.includes('\0')) {
      throw new TypeError(
        'MongoDB propagation fields must be BSON string fields'
      );
    }
    carrier[key] = value;
  }
  if (Object.keys(carrier).length === 0) return;

  const originalCommand = message.command;
  if (Object.prototype.hasOwnProperty.call(originalCommand, 'comment')) {
    carrier.originalComment = originalCommand.comment;
  } else if (propagationContext.inheritedComment) {
    carrier.originalComment = propagationContext.inheritedComment.value;
  }
  const candidate: Document = { ...originalCommand, comment: carrier };
  // OP_MSG encoding removes document-sequence fields. Serialize a separate copy
  // so command monitoring still sees the complete command before it is sent.
  const serializedCommand = { ...candidate };
  const toBin = message.toBin;
  let buffers: Uint8Array[];
  try {
    message.command = serializedCommand;
    buffers = toBin.call(message);
  } finally {
    message.command = originalCommand;
  }
  const { maxBsonObjectSize, maxMessageSizeBytes } = propagationContext.server;
  const body = buffers[2];
  const messageSize = buffers.reduce(
    (size, buffer) => size + buffer.byteLength,
    0
  );
  if (
    !body ||
    body.byteLength > maxBsonObjectSize ||
    messageSize > maxMessageSizeBytes
  ) {
    return;
  }

  message.command = candidate;
  // Reuse the driver's encoded buffers rather than serializing values twice.
  message.toBin = function (): Uint8Array[] {
    this.command = serializedCommand;
    return buffers;
  };
}
