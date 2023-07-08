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
  context,
  Span,
  SpanKind,
  SpanStatusCode,
  trace,
  diag,
} from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import {
  NetTransportValues,
  SemanticAttributes,
} from '@opentelemetry/semantic-conventions';
import type * as sequelize from 'sequelize';
import { SequelizeInstrumentationConfig } from './types';
import { VERSION } from '../../../version';
import { extractTableFromQuery } from './utils';
import {
  InstrumentationBase,
  InstrumentationModuleDefinition,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  isWrapped,
  safeExecuteInTheMiddle,
} from '@opentelemetry/instrumentation';

export class SequelizeInstrumentation extends InstrumentationBase<
  typeof sequelize
> {
  static readonly component = 'sequelize';
  protected override _config!: SequelizeInstrumentationConfig;
  private moduleVersion?: string;

  constructor(config: SequelizeInstrumentationConfig = {}) {
    super(
      'splunk-opentelemetry-instrumentation-sequelize',
      VERSION,
      Object.assign({}, config)
    );
  }

  override setConfig(config: SequelizeInstrumentationConfig = {}) {
    this._config = Object.assign({}, config);
  }

  protected init(): InstrumentationModuleDefinition<typeof sequelize> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const unpatchConnectionManager = (moduleExports: any) => {
      if (
        isWrapped(moduleExports?.ConnectionManager?.prototype?.getConnection)
      ) {
        this._unwrap(
          moduleExports.ConnectionManager.prototype,
          'getConnection'
        );
      }
      return moduleExports;
    };
    const connectionManagerInstrumentation =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new InstrumentationNodeModuleFile<any>(
        'sequelize/lib/dialects/abstract/connection-manager.js',
        ['*'],
        (moduleExports) => {
          if (moduleExports === undefined || moduleExports === null) {
            return moduleExports;
          }
          diag.debug(
            `sequelize instrumentation: applying patch to sequelize ConnectionManager`
          );
          unpatchConnectionManager(moduleExports);
          this._wrap(
            moduleExports.ConnectionManager.prototype,
            'getConnection',
            this._getConnectionPatch()
          );
          return moduleExports;
        },
        unpatchConnectionManager
      );

    const unpatch = (moduleExports: typeof sequelize) => {
      if (isWrapped(moduleExports.Sequelize.prototype.query)) {
        this._unwrap(moduleExports.Sequelize.prototype, 'query');
      }
    };
    const module = new InstrumentationNodeModuleDefinition<typeof sequelize>(
      SequelizeInstrumentation.component,
      ['*'],
      (moduleExports, moduleVersion) => {
        this.moduleVersion = moduleVersion;
        if (moduleExports === undefined || moduleExports === null) {
          return moduleExports;
        }

        diag.debug(`sequelize instrumentation: applying patch to sequelize`);
        unpatch(moduleExports);
        this._wrap(
          moduleExports.Sequelize.prototype,
          'query',
          this._createQueryPatch()
        );

        return moduleExports;
      },
      unpatch,
      [connectionManagerInstrumentation]
    );
    return module;
  }

  // run getConnection with suppressTracing, as it might call internally to `databaseVersion` function
  // which calls `query` and create internal span which we don't need to instrument
  private _getConnectionPatch() {
    return (original: Function) => {
      return function (this: unknown, ...args: unknown[]) {
        return context.with(suppressTracing(context.active()), () =>
          original.apply(this, args)
        );
      };
    };
  }

  private _createQueryPatch() {
    const self = this;
    return (original: sequelize.Sequelize['query']) => {
      return function query(
        this: sequelize.Sequelize,
        ...args: Parameters<sequelize.Sequelize['query']>
      ) {
        if (
          self._config?.ignoreOrphanedSpans &&
          !trace.getSpan(context.active())
        ) {
          return original.apply(this, args);
        }

        const sqlOrQuery = args[0];
        const extractStatement = (sql: typeof sqlOrQuery) => {
          if (typeof sql === 'string') return sql;
          return sql?.query || '';
        };
        const statement = extractStatement(args[0]).trim();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const option = args[1] as any;
        let operation = option?.type;

        if (!operation) operation = statement.split(' ')[0];

        const sequelizeInstance: sequelize.Sequelize = this;
        const config = sequelizeInstance?.config;

        let tableName = option?.instance?.constructor?.tableName;
        if (!tableName) {
          if (Array.isArray(option?.tableNames) && option.tableNames.length > 0)
            tableName = option?.tableNames.sort().join(',');
          else tableName = extractTableFromQuery(statement);
        }

        const attributes = {
          [SemanticAttributes.DB_SYSTEM]: sequelizeInstance.getDialect(),
          [SemanticAttributes.DB_USER]: config?.username,
          [SemanticAttributes.NET_PEER_NAME]: config?.host,
          [SemanticAttributes.NET_PEER_PORT]: config?.port
            ? Number(config?.port)
            : undefined,
          [SemanticAttributes.NET_TRANSPORT]: self._getNetTransport(
            config?.protocol
          ),
          [SemanticAttributes.DB_NAME]: config?.database,
          [SemanticAttributes.DB_OPERATION]: operation,
          [SemanticAttributes.DB_STATEMENT]: statement,
          [SemanticAttributes.DB_SQL_TABLE]: tableName,
          // [SemanticAttributes.NET_PEER_IP]: '?', // Part of protocol
        };

        if (self._config.moduleVersionAttributeName) {
          attributes[self._config.moduleVersionAttributeName] =
            self.moduleVersion;
        }

        Object.entries(attributes).forEach(([key, value]) => {
          if (value === undefined) delete attributes[key];
        });

        const newSpan: Span = self.tracer.startSpan(`Sequelize ${operation}`, {
          kind: SpanKind.CLIENT,
          attributes,
        });

        const activeContextWithSpan = trace.setSpan(context.active(), newSpan);

        const hook = self._config?.queryHook;
        if (hook !== undefined && sqlOrQuery !== undefined) {
          safeExecuteInTheMiddle(
            () => hook(newSpan, { sql: sqlOrQuery, option }),
            (e) => {
              if (e)
                diag.error('sequelize instrumentation: queryHook error', e);
            },
            true
          );
        }

        return (
          context
            .with(
              self._config.suppressInternalInstrumentation
                ? suppressTracing(activeContextWithSpan)
                : activeContextWithSpan,
              () => original.apply(this, args)
            )
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .then((response: any) => {
              const responseHook = self._config?.responseHook;
              if (responseHook !== undefined) {
                safeExecuteInTheMiddle(
                  () => responseHook(newSpan, response),
                  (e) => {
                    if (e)
                      diag.error(
                        'sequelize instrumentation: responseHook error',
                        e
                      );
                  },
                  true
                );
              }
              return response;
            })
            .catch((err: Error) => {
              newSpan.setStatus({
                code: SpanStatusCode.ERROR,
                message: err.message,
              });
              throw err;
            })
            .finally(() => {
              newSpan.end();
            })
        );
      };
    };
  }

  private _getNetTransport(protocol: string) {
    switch (protocol) {
      case 'tcp':
        return NetTransportValues.IP_TCP;
      default:
        return undefined;
    }
  }
}
