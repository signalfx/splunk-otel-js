/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { Span, TextMapPropagator } from '@opentelemetry/api';

/** Information about the server selected for an operation. */
export interface MongoDBServerInfo {
  readonly address: string;
  readonly maxWireVersion: number | undefined;
  readonly maxBsonObjectSize: number;
  readonly maxMessageSizeBytes: number;
}

export interface MongoDBInstrumentationExecutionResponseHook {
  (span: Span, responseInfo: MongoResponseHookInformation): void;
}

/**
 * Function that can be used to serialize db.statement tag
 * @param cmd - MongoDB command object
 *
 * @returns serialized string that will be used as the db.statement attribute.
 */
export type DbStatementSerializer = (cmd: Record<string, unknown>) => string;

export interface MongoDBInstrumentationConfig extends InstrumentationConfig {
  /**
   * Propagate context through OP_MSG command comments. Defaults to false.
   * Read at construction; later setConfig() calls cannot change this option.
   */
  addCommentToCommands?: boolean;

  /**
   * Overrides the global propagator for command comments only.
   * Read at construction; later setConfig() calls cannot change this option.
   */
  commentPropagator?: TextMapPropagator;

  /**
   * Confirms that the selected server accepts document-valued command comments.
   * Defaults to a MongoDB server check: maxWireVersion must be a valid integer
   * >= 9 (MongoDB 4.4 or later). Unknown or older versions skip injection.
   * MongoDB-compatible services must override this with their own capability check.
   * Injection is skipped unless the selected callback returns true.
   * The callback is selected at construction and evaluated for each operation.
   * Later setConfig() calls cannot replace it.
   */
  supportsDocumentComments?: (server: MongoDBServerInfo) => boolean;

  /**
   * If true, additional information about query parameters and
   * results will be attached (as `attributes`) to spans representing
   * database operations.
   */
  enhancedDatabaseReporting?: boolean;

  /**
   * Hook that allows adding custom span attributes based on the data
   * returned from MongoDB actions.
   *
   * @default undefined
   */
  responseHook?: MongoDBInstrumentationExecutionResponseHook;

  /**
   * Custom serializer function for the db.statement tag
   */
  dbStatementSerializer?: DbStatementSerializer;

  /**
   * Require parent to create mongodb span, default when unset is true
   */
  requireParentSpan?: boolean;
}

export interface MongoResponseHookInformation {
  data: CommandResult;
}

// https://github.com/mongodb/node-mongodb-native/blob/3.6/lib/core/connection/command_result.js
export type CommandResult = {
  result?: unknown;
  connection?: unknown;
  message?: unknown;
};

export enum MongodbCommandType {
  CREATE_INDEXES = 'createIndexes',
  FIND_AND_MODIFY = 'findAndModify',
  IS_MASTER = 'isMaster',
  COUNT = 'count',
  UNKNOWN = 'unknown',
}
