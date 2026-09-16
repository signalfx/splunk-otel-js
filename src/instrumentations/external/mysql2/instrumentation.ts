/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */

import * as api from '@opentelemetry/api';
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

const supportedVersions = ['>=1.4.2 <4'];

export class MySQL2Instrumentation extends InstrumentationBase<MySQL2InstrumentationConfig> {
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
    const preparedStatements = new Set<PreparedStatement>();
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
          preparedStatements,
          () => patchActive
        ) as any
      );
    };
    const unpatch = (ConnectionPrototype: mysqlTypes.Connection) => {
      patchActive = false;
      this._unwrap(ConnectionPrototype, 'query');
      this._unwrap(ConnectionPrototype, 'execute');
      this._unwrap(ConnectionPrototype, 'prepare');
      for (const statement of preparedStatements) {
        if (isWrapped(statement.execute)) {
          this._unwrap(statement, 'execute');
        }
      }
      preparedStatements.clear();
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
    preparedStatements: Set<PreparedStatement>,
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
            preparedStatements,
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
    preparedStatements: Set<PreparedStatement>,
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
          preparedStatements.add(statement);
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
          const streamableQuery: mysqlTypes.Query = originalExecute.apply(
            this,
            arguments
          );

          streamableQuery
            .once('error', err => {
              endSpan(err);
            })
            .once('result', results => {
              endSpan(undefined, results);
            });

          return streamableQuery;
        }

        return originalExecute.apply(this, arguments);
      };
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
