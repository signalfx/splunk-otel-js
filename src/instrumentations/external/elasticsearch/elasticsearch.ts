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
import { diag, context, trace, Span } from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';
import type * as elasticsearch from '@elastic/elasticsearch';
import { ElasticsearchInstrumentationConfig } from './types';
import {
  InstrumentationBase,
  InstrumentationModuleDefinition,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
} from '@opentelemetry/instrumentation';
import { VERSION } from '../../../version';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import {
  startSpan,
  onError,
  onResponse,
  defaultDbStatementSerializer,
  normalizeArguments,
  getIndexName,
} from './utils';
import { ELASTICSEARCH_API_FILES } from './helpers';

enum AttributeNames {
  ELASTICSEARCH_INDICES = 'elasticsearch.request.indices',
}

export class ElasticsearchInstrumentation extends InstrumentationBase<
  typeof elasticsearch
> {
  static readonly component = '@elastic/elasticsearch';

  protected override _config: ElasticsearchInstrumentationConfig = {};
  private _isEnabled = false;
  private moduleVersion?: string;

  constructor(config: ElasticsearchInstrumentationConfig = {}) {
    super(
      'splunk-opentelemetry-instrumentation-elasticsearch',
      VERSION,
      Object.assign({}, config)
    );
  }

  override setConfig(config: ElasticsearchInstrumentationConfig = {}) {
    this._config = Object.assign({}, config);
  }

  protected init(): InstrumentationModuleDefinition<typeof elasticsearch> {
    const apiModuleFiles = ELASTICSEARCH_API_FILES.map(
      ({ path, operationClassName }) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        new InstrumentationNodeModuleFile<any>(
          `@elastic/elasticsearch/api/${path}`,
          ['>=5 <8'],
          (moduleExports, moduleVersion) => {
            diag.debug(
              `elasticsearch instrumentation: patch elasticsearch ${operationClassName}.`
            );
            this.moduleVersion = moduleVersion;
            this._isEnabled = true;

            const modulePrototypeKeys = Object.keys(moduleExports.prototype);
            if (modulePrototypeKeys.length > 0) {
              modulePrototypeKeys.forEach((functionName) => {
                this._wrap(
                  moduleExports.prototype,
                  functionName,
                  this.wrappedApiRequest(operationClassName, functionName)
                );
              });
              return moduleExports;
            }

            // For versions <= 7.9.0
            const instrumentation = this;
            return function (opts: unknown) {
              const module = moduleExports(opts);
              instrumentation.patchObject(operationClassName, module);
              return module;
            };
          },
          (moduleExports) => {
            diag.debug(`elasticsearch instrumentation: unpatch elasticsearch.`);
            this._isEnabled = false;

            const modulePrototypeKeys = Object.keys(moduleExports.prototype);
            if (modulePrototypeKeys.length > 0) {
              modulePrototypeKeys.forEach((functionName) => {
                this._unwrap(moduleExports.prototype, functionName);
              });
            } else {
              // Unable to unwrap function for versions <= 7.9.0. Using _isEnabled flag instead.
            }
          }
        )
    );

    const module = new InstrumentationNodeModuleDefinition<
      typeof elasticsearch
    >(
      ElasticsearchInstrumentation.component,
      ['*'],
      undefined,
      undefined,
      apiModuleFiles
    );

    return module;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private patchObject(operationClassName: string, object: any) {
    Object.keys(object).forEach((functionName) => {
      if (typeof object[functionName] === 'object') {
        this.patchObject(functionName, object[functionName]);
      } else {
        this._wrap(
          object,
          functionName,
          this.wrappedApiRequest(operationClassName, functionName)
        );
      }
    });
  }

  private wrappedApiRequest(apiClassName: string, functionName: string) {
    return (original: Function) => {
      const instrumentation = this;
      return function (this: unknown, ...args: unknown[]) {
        if (!instrumentation._isEnabled) {
          return original.apply(this, args);
        }

        const [params, options, originalCallback] = normalizeArguments(
          args[0],
          args[1],
          args[2]
        );
        const operation = `${apiClassName}.${functionName}`;
        const span = startSpan({
          tracer: instrumentation.tracer,
          attributes: {
            [SemanticAttributes.DB_OPERATION]: operation,
            [AttributeNames.ELASTICSEARCH_INDICES]: getIndexName(params),
            [SemanticAttributes.DB_STATEMENT]: (
              instrumentation._config.dbStatementSerializer ||
              defaultDbStatementSerializer
            )(operation, params, options),
          },
        });
        instrumentation._addModuleVersionIfNeeded(span);

        if (originalCallback) {
          const wrappedCallback = function (
            this: unknown,
            err: Error,
            result: elasticsearch.ApiResponse
          ) {
            if (err) {
              onError(span, err);
            } else {
              onResponse(span, result, instrumentation._config.responseHook);
            }

            return originalCallback.call(this, err, result);
          };

          return instrumentation._callOriginalFunction(span, () =>
            original.call(this, params, options, wrappedCallback)
          );
        } else {
          const promise = instrumentation._callOriginalFunction(span, () =>
            original.apply(this, args)
          );
          promise.then(
            (result: elasticsearch.ApiResponse) => {
              onResponse(span, result, instrumentation._config.responseHook);
              return result;
            },
            (err: Error) => {
              onError(span, err);
              return err;
            }
          );

          return promise;
        }
      };
    };
  }

  private _callOriginalFunction<T>(
    span: Span,
    originalFunction: (...args: unknown[]) => T
  ): T {
    if (this._config?.suppressInternalInstrumentation) {
      return context.with(suppressTracing(context.active()), originalFunction);
    } else {
      const activeContextWithSpan = trace.setSpan(context.active(), span);
      return context.with(activeContextWithSpan, originalFunction);
    }
  }

  private _addModuleVersionIfNeeded(span: Span) {
    if (this.moduleVersion === undefined) {
      return;
    }

    if (this._config.moduleVersionAttributeName) {
      span.setAttribute(
        this._config.moduleVersionAttributeName,
        this.moduleVersion
      );
    }
  }
}
