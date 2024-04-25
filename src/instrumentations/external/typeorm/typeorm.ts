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
  Span,
  SpanKind,
  SpanStatusCode,
  trace,
  context,
  diag,
} from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import {
  ExtendedDatabaseAttribute,
  TypeormInstrumentationConfig,
} from './types';
import {
  getParamNames,
  isTypeormInternalTracingSuppressed,
  suppressTypeormInternalTracing,
} from './utils';
import { VERSION } from '../../../version';
import type * as typeorm from 'typeorm';
import {
  InstrumentationBase,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  isWrapped,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';
import isPromise from 'is-promise';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SelectQueryBuilderMethod = keyof typeorm.SelectQueryBuilder<any>;
const selectQueryBuilderExecuteMethods: SelectQueryBuilderMethod[] = [
  'getRawOne',
  'getCount',
  'getManyAndCount',
  'stream',
  'getMany',
  'getOneOrFail',
  'getOne',
  'getRawAndEntities',
  'getRawMany',
];
const rawQueryFuncName = 'query';
type EntityManagerMethods = keyof typeorm.EntityManager;
const functionsUsingEntityPersistExecutor: EntityManagerMethods[] = [
  'save',
  'remove',
  'softRemove',
  'recover',
];
const functionsUsingQueryBuilder: EntityManagerMethods[] = [
  'insert',
  'update',
  'delete',
  'softDelete',
  'restore',
  'count',
  'find',
  'findAndCount',
  'findByIds',
  'findOne',
  'increment',
  'decrement',
];
const entityManagerMethods: EntityManagerMethods[] = [
  ...functionsUsingEntityPersistExecutor,
  ...functionsUsingQueryBuilder,
];

export class TypeormInstrumentation extends InstrumentationBase {
  protected override _config!: TypeormInstrumentationConfig;
  constructor(config: TypeormInstrumentationConfig = {}) {
    super(
      'splunk-opentelemetry-instrumentation-typeorm',
      VERSION,
      Object.assign({}, config)
    );
  }

  protected init() {
    const selectQueryBuilder = new InstrumentationNodeModuleFile(
      'typeorm/query-builder/SelectQueryBuilder.js',
      ['>0.2.28'],
      (moduleExports) => {
        selectQueryBuilderExecuteMethods.map((method) => {
          if (isWrapped(moduleExports.SelectQueryBuilder.prototype?.[method])) {
            this._unwrap(moduleExports.SelectQueryBuilder.prototype, method);
          }
          this._wrap(
            moduleExports.SelectQueryBuilder.prototype,
            method,
            this._patchQueryBuilder()
          );
        });

        return moduleExports;
      },
      (moduleExports) => {
        selectQueryBuilderExecuteMethods.map((method) => {
          if (isWrapped(moduleExports.SelectQueryBuilder.prototype?.[method])) {
            this._unwrap(moduleExports.SelectQueryBuilder.prototype, method);
          }
        });
        return moduleExports;
      }
    );

    const connection = new InstrumentationNodeModuleFile(
      'typeorm/connection/Connection.js',
      ['>0.2.28 <0.3.0'],
      (moduleExports) => {
        if (isWrapped(moduleExports.Connection.prototype?.[rawQueryFuncName])) {
          this._unwrap(moduleExports.Connection.prototype, rawQueryFuncName);
        }
        this._wrap(
          moduleExports.Connection.prototype,
          rawQueryFuncName,
          this._patchRawQuery()
        );

        return moduleExports;
      },
      (moduleExports) => {
        if (isWrapped(moduleExports.Connection.prototype?.[rawQueryFuncName])) {
          this._unwrap(moduleExports.Connection.prototype, rawQueryFuncName);
        }
        return moduleExports;
      }
    );

    const dataSource = new InstrumentationNodeModuleFile(
      'typeorm/data-source/DataSource.js',
      ['>=0.3.0'],
      (moduleExports) => {
        if (isWrapped(moduleExports.DataSource.prototype?.[rawQueryFuncName])) {
          this._unwrap(moduleExports.DataSource.prototype, rawQueryFuncName);
        }
        this._wrap(
          moduleExports.DataSource.prototype,
          rawQueryFuncName,
          this._patchRawQuery()
        );

        return moduleExports;
      },
      (moduleExports) => {
        if (isWrapped(moduleExports.DataSource.prototype?.[rawQueryFuncName])) {
          this._unwrap(moduleExports.DataSource.prototype, rawQueryFuncName);
        }
        return moduleExports;
      }
    );

    const entityManager = new InstrumentationNodeModuleFile(
      'typeorm/entity-manager/EntityManager.js',
      ['>0.2.28'],
      (moduleExports, moduleVersion) => {
        entityManagerMethods.map((method) => {
          if (isWrapped(moduleExports.EntityManager.prototype?.[method])) {
            this._unwrap(moduleExports.EntityManager.prototype, method);
          }
          this._wrap(
            moduleExports.EntityManager.prototype,
            method,
            this._patchEntityManagerFunction(method, moduleVersion)
          );
        });

        return moduleExports;
      },
      (moduleExports) => {
        entityManagerMethods.map((method) => {
          if (isWrapped(moduleExports.EntityManager.prototype?.[method])) {
            this._unwrap(moduleExports.EntityManager.prototype, method);
          }
        });
        return moduleExports;
      }
    );

    const module = new InstrumentationNodeModuleDefinition(
      'typeorm',
      ['>0.2.28'],
      undefined,
      undefined,
      [selectQueryBuilder, entityManager, connection, dataSource]
    );
    return module;
  }

  private _patchEntityManagerFunction(opName: string, moduleVersion?: string) {
    const self = this;
    diag.debug(
      `typeorm instrumentation: patched EntityManager ${opName} prototype`
    );
    return (original: Function) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function (this: any, ...args: unknown[]) {
        if (isTypeormInternalTracingSuppressed(context.active())) {
          return original.apply(this, args);
        }
        const connectionOptions = this?.connection?.options ?? {};
        const attributes: Record<string, any> = {
          [SemanticAttributes.DB_SYSTEM]: connectionOptions.type,
          [SemanticAttributes.DB_USER]: connectionOptions.username,
          [SemanticAttributes.NET_PEER_NAME]: connectionOptions.host,
          [SemanticAttributes.NET_PEER_PORT]: connectionOptions.port,
          [SemanticAttributes.DB_NAME]: connectionOptions.database,
          [SemanticAttributes.DB_OPERATION]: opName,
          [SemanticAttributes.DB_STATEMENT]: JSON.stringify(
            buildStatement(original, args)
          ),
        };

        if (self._config.moduleVersionAttributeName && moduleVersion) {
          attributes[self._config.moduleVersionAttributeName] = moduleVersion;
        }

        //ignore EntityMetadataNotFoundError
        try {
          if (this.metadata) {
            attributes[SemanticAttributes.DB_SQL_TABLE] =
              this.metadata.tableName;
          } else {
            const entity = args[0];
            const name =
              typeof entity === 'object' ? entity?.constructor?.name : entity;
            const metadata = this.connection.getMetadata(name);
            if (metadata?.tableName) {
              attributes[SemanticAttributes.DB_SQL_TABLE] = metadata.tableName;
            }
          }
        } catch {
          /* */
        }

        Object.entries(attributes).forEach(([key, value]) => {
          if (value === undefined) delete attributes[key];
        });

        const span: Span = self.tracer.startSpan(`TypeORM ${opName}`, {
          kind: SpanKind.CLIENT,
          attributes,
        });

        const contextWithSpan = trace.setSpan(context.active(), span);

        const traceContext = self._config.enableInternalInstrumentation
          ? contextWithSpan
          : suppressTypeormInternalTracing(contextWithSpan);

        const contextWithSuppressTracing = self._config
          .suppressInternalInstrumentation
          ? suppressTracing(traceContext)
          : traceContext;

        return context.with(contextWithSuppressTracing, () =>
          self._endSpan(() => original.apply(this, args), span)
        );
      };
    };
  }

  private _patchQueryBuilder() {
    const self = this;
    return (original: Function) => {
      return function (
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this: typeorm.SelectQueryBuilder<any>,
        ...args: unknown[]
      ) {
        if (isTypeormInternalTracingSuppressed(context.active())) {
          return original.apply(this, args);
        }
        const sql = this.getQuery();
        const parameters = this.getParameters();
        const mainTableName = this.getMainTableName();
        const operation = this.expressionMap.queryType;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connectionOptions: any = this.connection?.options;
        const attributes: Record<string, any> = {
          [SemanticAttributes.DB_SYSTEM]: connectionOptions.type,
          [SemanticAttributes.DB_USER]: connectionOptions.username,
          [SemanticAttributes.NET_PEER_NAME]: connectionOptions.host,
          [SemanticAttributes.NET_PEER_PORT]: connectionOptions.port,
          [SemanticAttributes.DB_NAME]: connectionOptions.database,
          [SemanticAttributes.DB_OPERATION]: operation,
          [SemanticAttributes.DB_STATEMENT]: sql,
          [SemanticAttributes.DB_SQL_TABLE]: mainTableName,
        };
        if (self._config.collectParameters) {
          try {
            attributes[ExtendedDatabaseAttribute.DB_STATEMENT_PARAMETERS] =
              JSON.stringify(parameters);
          } catch (err) {
            /* */
          }
        }
        const span: Span = self.tracer.startSpan(
          `TypeORM ${operation} ${mainTableName}`,
          {
            kind: SpanKind.CLIENT,
            attributes,
          }
        );

        const contextWithSpan = trace.setSpan(context.active(), span);

        const traceContext = self._config.enableInternalInstrumentation
          ? contextWithSpan
          : suppressTypeormInternalTracing(contextWithSpan);

        const contextWithSuppressTracing = self._config
          ?.suppressInternalInstrumentation
          ? suppressTracing(traceContext)
          : traceContext;

        return context.with(contextWithSuppressTracing, () =>
          self._endSpan(() => original.apply(this, args), span)
        );
      };
    };
  }

  private getOperationName(statement: string) {
    let operation = 'raw query';
    if (typeof statement === 'string') {
      statement = statement.trim();
      try {
        operation = statement.split(' ')[0].toUpperCase();
      } catch (e) {
        /* */
      }
    }

    return operation;
  }

  private _patchRawQuery() {
    const self = this;
    return (original: Function) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return function (this: any, ...args: unknown[]) {
        if (isTypeormInternalTracingSuppressed(context.active())) {
          return original.apply(this, args);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sql = args[0] as any;
        const operation = self.getOperationName(sql);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const connectionOptions: any = this.options;
        const attributes = {
          [SemanticAttributes.DB_SYSTEM]: connectionOptions.type,
          [SemanticAttributes.DB_USER]: connectionOptions.username,
          [SemanticAttributes.NET_PEER_NAME]: connectionOptions.host,
          [SemanticAttributes.NET_PEER_PORT]: connectionOptions.port,
          [SemanticAttributes.DB_NAME]: connectionOptions.database,
          [SemanticAttributes.DB_OPERATION]: operation,
          [SemanticAttributes.DB_STATEMENT]: sql,
        };

        const span: Span = self.tracer.startSpan(`TypeORM ${operation}`, {
          kind: SpanKind.CLIENT,
          attributes,
        });

        const contextWithSpan = trace.setSpan(context.active(), span);

        const traceContext = self._config.enableInternalInstrumentation
          ? contextWithSpan
          : suppressTypeormInternalTracing(contextWithSpan);

        const contextWithSuppressTracing = self._config
          ?.suppressInternalInstrumentation
          ? suppressTracing(traceContext)
          : traceContext;

        return context.with(contextWithSuppressTracing, () =>
          self._endSpan(() => original.apply(this, args), span)
        );
      };
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _endSpan(traced: any, span: Span) {
    const executeResponseHook = (response: unknown) => {
      const hook = this._config?.responseHook;
      if (hook !== undefined) {
        safeExecuteInTheMiddle(
          () => hook(span, response),
          (e) => {
            if (e) diag.error('typeorm instrumentation: responseHook error', e);
          },
          true
        );
      }
      return response;
    };
    try {
      const response = traced();
      if (isPromise(response)) {
        return Promise.resolve(response)
          .then((response) => executeResponseHook(response))
          .catch((err) => {
            if (err) {
              if (typeof err === 'string') {
                span.setStatus({ code: SpanStatusCode.ERROR, message: err });
              } else {
                span.recordException(err);
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: err?.message,
                });
              }
            }
            throw err;
          })
          .finally(() => span.end());
      } else {
        span.end();
        return executeResponseHook(response);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message });
      span.end();
      throw error;
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildStatement = (func: Function, args: any[]) => {
  const paramNames = getParamNames(func) || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const statement = {} as any;
  paramNames.forEach((pName, i) => {
    const value = args[i];
    if (!value) return;

    try {
      const stringified = JSON.stringify(value);
      if (stringified) {
        statement[pName] = args[i];
        return;
      }
    } catch (_err) {
      /* */
    }
    if (value?.name) {
      statement[pName] = value.name;
      return;
    }
    if (value?.constructor?.name) {
      statement[pName] = value.constructor.name;
    }
  });
  return statement;
};
