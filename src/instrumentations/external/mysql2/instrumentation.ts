/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

/// <reference lib="es2021.weakref" />

import * as api from '@opentelemetry/api';
import { errorMonitor } from 'events';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  isWrapped,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';
import { addSqlCommenterComment } from '@opentelemetry/sql-common';
import type * as mysqlTypes from 'mysql2';
import { MySQL2InstrumentationConfig } from './types';
import {
  getConnectionAttributes,
  getConnectionPrototypeToInstrument,
  getQueryText,
  getSpanName,
  once,
} from './utils';
/** @knipignore */
import { PACKAGE_NAME, PACKAGE_VERSION } from './version';
import {
  ATTR_DB_QUERY_TEXT,
  ATTR_DB_SYSTEM_NAME,
  DB_SYSTEM_NAME_VALUE_MYSQL,
} from '@opentelemetry/semantic-conventions';

type formatType = typeof mysqlTypes.format;
type QueryLike = string | mysqlTypes.Query | mysqlTypes.QueryOptions;

interface PreparedStatement {
  query: string;
  execute: Function;
}

type PreparedStatementRef = WeakRef<PreparedStatement>;
type PreparedStatementConnectionErrorHandler = (err: any) => void;

interface PreparedStatementConnectionErrorState {
  handlers: Set<PreparedStatementConnectionErrorHandler>;
  listener: PreparedStatementConnectionErrorHandler;
}

const supportedVersions = ['>=1.4.2 <4'];

export class MySQL2Instrumentation extends InstrumentationBase<MySQL2InstrumentationConfig> {
  private readonly _preparedStatementConnectionErrorStates = new WeakMap<
    mysqlTypes.Connection,
    PreparedStatementConnectionErrorState
  >();

  constructor(config: MySQL2InstrumentationConfig = {}) {
    super(PACKAGE_NAME, PACKAGE_VERSION, config);
  }

  protected init() {
    let format: formatType | undefined;
    function setFormatFunction(moduleExports: any) {
      if (!format && moduleExports.format) {
        format = moduleExports.format;
      }
    }
    // Keep statements weakly reachable while retaining the ability to unwrap
    // statements that are still alive when the instrumentation is disabled.
    const preparedStatementRefs = new Set<PreparedStatementRef>();
    const preparedStatementFinalizer = new FinalizationRegistry<PreparedStatementRef>(
      statementRef => {
        preparedStatementRefs.delete(statementRef);
      }
    );
    let patchActive = false;
    const patch = (ConnectionPrototype: mysqlTypes.Connection) => {
      patchActive = true;
      if (isWrapped(ConnectionPrototype.query)) {
        this._unwrap(ConnectionPrototype, 'query');
      }
      if (isWrapped(ConnectionPrototype.execute)) {
        this._unwrap(ConnectionPrototype, 'execute');
      }
      if (isWrapped(ConnectionPrototype.prepare)) {
        this._unwrap(ConnectionPrototype, 'prepare');
      }

      this._wrap(
        ConnectionPrototype,
        'query',
        this._patchQuery(format, false) as any
      );
      this._wrap(
        ConnectionPrototype,
        'execute',
        this._patchQuery(format, true) as any
      );
      this._wrap(
        ConnectionPrototype,
        'prepare',
        this._patchPrepare(
          format,
          preparedStatementRefs,
          preparedStatementFinalizer,
          () => patchActive
        ) as any
      );
    };
    const unpatch = (ConnectionPrototype: mysqlTypes.Connection) => {
      patchActive = false;
      this._unwrap(ConnectionPrototype, 'query');
      this._unwrap(ConnectionPrototype, 'execute');
      this._unwrap(ConnectionPrototype, 'prepare');
      for (const statementRef of preparedStatementRefs) {
        preparedStatementFinalizer.unregister(statementRef);
        const statement = statementRef.deref();
        if (statement && isWrapped(statement.execute)) {
          this._unwrap(statement, 'execute');
        }
      }
      preparedStatementRefs.clear();
    };
    return [
      new InstrumentationNodeModuleDefinition(
        'mysql2',
        supportedVersions,
        (moduleExports: any) => {
          setFormatFunction(moduleExports);
          return moduleExports;
        },
        () => {},
        [
          new InstrumentationNodeModuleFile(
            'mysql2/promise.js',
            supportedVersions,
            (moduleExports: any) => {
              setFormatFunction(moduleExports);
              return moduleExports;
            },
            () => {}
          ),
          new InstrumentationNodeModuleFile(
            'mysql2/lib/connection.js',
            supportedVersions,
            (moduleExports: any) => {
              const ConnectionPrototype: mysqlTypes.Connection =
                getConnectionPrototypeToInstrument(moduleExports);
              patch(ConnectionPrototype);
              return moduleExports;
            },
            (moduleExports: any) => {
              if (moduleExports === undefined) return;
              const ConnectionPrototype: mysqlTypes.Connection =
                getConnectionPrototypeToInstrument(moduleExports);
              unpatch(ConnectionPrototype);
            }
          ),
        ]
      ),
    ];
  }

  private _patchQuery(format: formatType | undefined, isPrepared: boolean) {
    return (originalQuery: Function): Function => {
      const thisPlugin = this;
      return function query(
        this: mysqlTypes.Connection,
        query: string | mysqlTypes.Query | mysqlTypes.QueryOptions,
        _valuesOrCallback?: unknown[] | Function,
        _callback?: Function
      ) {
        let values;
        if (Array.isArray(_valuesOrCallback)) {
          values = _valuesOrCallback;
        } else if (arguments[2]) {
          values = [_valuesOrCallback];
        }
        const { span, endSpan } = thisPlugin._createSpan(
          query,
          format,
          values,
          this.config
        );

        if (
          !isPrepared &&
          thisPlugin.getConfig().addSqlCommenterCommentToQueries
        ) {
          arguments[0] = query =
            typeof query === 'string'
              ? addSqlCommenterComment(span, query)
              : Object.assign(query, {
                  sql: addSqlCommenterComment(span, query.sql),
                });
        }

        if (arguments.length === 1) {
          if (typeof (query as any).onResult === 'function') {
            thisPlugin._wrap(
              query as any,
              'onResult',
              thisPlugin._patchCallbackQuery(endSpan)
            );
          }

          const streamableQuery: mysqlTypes.Query = originalQuery.apply(
            this,
            arguments
          );

          // `end` in mysql behaves similarly to `result` in mysql2.
          streamableQuery
            .once('error', err => {
              endSpan(err);
            })
            .once('result', results => {
              endSpan(undefined, results);
            });

          return streamableQuery;
        }

        if (typeof arguments[1] === 'function') {
          thisPlugin._wrap(
            arguments,
            1,
            thisPlugin._patchCallbackQuery(endSpan)
          );
        } else if (typeof arguments[2] === 'function') {
          thisPlugin._wrap(
            arguments,
            2,
            thisPlugin._patchCallbackQuery(endSpan)
          );
        }

        return originalQuery.apply(this, arguments);
      };
    };
  }

  private _patchPrepare(
    format: formatType | undefined,
    preparedStatementRefs: Set<PreparedStatementRef>,
    preparedStatementFinalizer: FinalizationRegistry<PreparedStatementRef>,
    isPatchActive: () => boolean
  ) {
    return (originalPrepare: Function): Function => {
      const thisPlugin = this;
      return function prepare(
        this: mysqlTypes.Connection,
        _options: string | mysqlTypes.QueryOptions,
        _callback?: Function
      ) {
        if (typeof arguments[1] !== 'function') {
          return originalPrepare.apply(this, arguments);
        }

        thisPlugin._wrap(
          arguments,
          1,
          thisPlugin._patchPreparedStatementCallback(
            format,
            this,
            preparedStatementRefs,
            preparedStatementFinalizer,
            isPatchActive
          )
        );

        return originalPrepare.apply(this, arguments);
      };
    };
  }

  private _patchPreparedStatementCallback(
    format: formatType | undefined,
    connection: mysqlTypes.Connection,
    preparedStatementRefs: Set<PreparedStatementRef>,
    preparedStatementFinalizer: FinalizationRegistry<PreparedStatementRef>,
    isPatchActive: () => boolean
  ) {
    return (originalCallback: Function) => {
      const thisPlugin = this;
      return function preparedStatementCallback(
        err: mysqlTypes.QueryError | null,
        statement?: PreparedStatement
      ) {
        if (
          isPatchActive() &&
          !err &&
          statement &&
          typeof statement.execute === 'function' &&
          !isWrapped(statement.execute)
        ) {
          thisPlugin._wrap(
            statement,
            'execute',
            thisPlugin._patchPreparedStatementExecute(
              format,
              connection
            )
          );
          const statementRef = new WeakRef(statement);
          preparedStatementRefs.add(statementRef);
          preparedStatementFinalizer.register(
            statement,
            statementRef,
            statementRef
          );
        }

        return originalCallback(...arguments);
      };
    };
  }

  private _patchPreparedStatementExecute(
    format: formatType | undefined,
    connection: mysqlTypes.Connection
  ) {
    return (originalExecute: Function): Function => {
      const thisPlugin = this;
      return function execute(
        this: PreparedStatement,
        _parametersOrCallback?: unknown,
        _callback?: Function
      ) {
        const values =
          typeof arguments[0] === 'function' ? undefined : arguments[0];
        const query: mysqlTypes.QueryOptions = {
          sql: this.query,
          values,
        };
        const { endSpan } = thisPlugin._createSpan(
          query,
          format,
          values,
          connection.config
        );

        if (typeof arguments[0] === 'function') {
          thisPlugin._wrap(
            arguments,
            0,
            thisPlugin._patchCallbackQuery(endSpan)
          );
        } else if (typeof arguments[1] === 'function') {
          thisPlugin._wrap(
            arguments,
            1,
            thisPlugin._patchCallbackQuery(endSpan)
          );
        } else {
          let streamableQuery: mysqlTypes.Query | undefined;
          let completed = false;
          let removeConnectionErrorHandler = () => {};

          const cleanup = () => {
            removeConnectionErrorHandler();
            streamableQuery?.removeListener('error', onCommandError);
            streamableQuery?.removeListener('end', onCommandEnd);
          };
          const complete = (err?: any) => {
            if (completed) return;
            completed = true;
            cleanup();
            endSpan(err);
          };
          const onCommandError = (err: any) => {
            complete(err);
          };
          const onCommandEnd = () => {
            complete();
          };

          // A callback-less SELECT emits `result` once per row, and no
          // `result` event at all for an empty result set. Wait for `end` so
          // the span covers the whole command and can still record a later
          // command error.
          //
          // Fatal/network errors for callback-less commands are emitted only
          // by the connection. Register before calling mysql2 because a
          // closed connection emits that error synchronously.
          removeConnectionErrorHandler =
            thisPlugin._registerPreparedStatementConnectionErrorHandler(
              connection,
              complete
            );

          try {
            streamableQuery = originalExecute.apply(this, arguments);
          } catch (err) {
            complete(err);
            throw err;
          }

          if (
            !streamableQuery ||
            typeof streamableQuery.once !== 'function' ||
            typeof streamableQuery.removeListener !== 'function'
          ) {
            // Closed connections return no command after emitting their
            // connection error. `complete` is idempotent, so the original
            // connection error wins; this fallback covers an unexpected
            // driver implementation that returns no event emitter silently.
            complete(
              new Error(
                'Prepared statement execution did not return a query command'
              )
            );
            return streamableQuery;
          }

          if (!completed) {
            streamableQuery.once('error', onCommandError);
            streamableQuery.once('end', onCommandEnd);
          }

          return streamableQuery;
        }

        try {
          return originalExecute.apply(this, arguments);
        } catch (err) {
          endSpan(err);
          throw err;
        }
      };
    };
  }

  private _registerPreparedStatementConnectionErrorHandler(
    connection: mysqlTypes.Connection,
    handler: PreparedStatementConnectionErrorHandler
  ): () => void {
    let state = this._preparedStatementConnectionErrorStates.get(connection);

    if (!state) {
      // One fatal connection error invalidates the active command and every
      // queued callback-less command. Share one monitor per connection to end
      // all affected spans without adding a listener per queued execution.
      // `errorMonitor` observes the error without consuming it, preserving
      // Node's normal handled/unhandled `error` behavior for the application.
      const handlers = new Set<PreparedStatementConnectionErrorHandler>();
      const listener = (err: any) => {
        this._preparedStatementConnectionErrorStates.delete(connection);

        for (const pendingHandler of [...handlers]) {
          pendingHandler(err);
        }
        handlers.clear();
      };

      state = { handlers, listener };
      this._preparedStatementConnectionErrorStates.set(connection, state);
      connection.prependOnceListener(errorMonitor, listener);
    }

    state.handlers.add(handler);

    return () => {
      state.handlers.delete(handler);
      if (state.handlers.size === 0) {
        connection.removeListener(errorMonitor, state.listener);
        if (
          this._preparedStatementConnectionErrorStates.get(connection) ===
          state
        ) {
          this._preparedStatementConnectionErrorStates.delete(connection);
        }
      }
    };
  }

  private _createSpan(
    query: QueryLike,
    format: formatType | undefined,
    values: any,
    config: mysqlTypes.Connection['config']
  ) {
    const { maskStatement, maskStatementHook, responseHook } =
      this.getConfig();
    const attributes: api.Attributes = getConnectionAttributes(config);
    const dbQueryText = getQueryText(
      query,
      format,
      values,
      maskStatement,
      maskStatementHook
    );

    attributes[ATTR_DB_SYSTEM_NAME] = DB_SYSTEM_NAME_VALUE_MYSQL;
    attributes[ATTR_DB_QUERY_TEXT] = dbQueryText;

    const span = this.tracer.startSpan(getSpanName(query), {
      kind: api.SpanKind.CLIENT,
      attributes,
    });

    const endSpan = once((err?: any, results?: any) => {
      if (err) {
        span.setStatus({
          code: api.SpanStatusCode.ERROR,
          message: err.message,
        });
      } else {
        if (typeof responseHook === 'function') {
          safeExecuteInTheMiddle(
            () => {
              responseHook(span, {
                queryResults: results,
              });
            },
            err => {
              if (err) {
                this._diag.warn('Failed executing responseHook', err);
              }
            },
            true
          );
        }
      }

      span.end();
    });

    return { span, endSpan };
  }

  private _patchCallbackQuery(endSpan: Function) {
    return (originalCallback: Function) => {
      return function (
        err: mysqlTypes.QueryError | null,
        results?: any,
        fields?: mysqlTypes.FieldPacket[]
      ) {
        endSpan(err, results);
        return originalCallback(...arguments);
      };
    };
  }
}
