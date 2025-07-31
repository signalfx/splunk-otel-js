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
import * as path from 'path';
import * as fs from 'fs';
import {
  InstrumentationBase,
  InstrumentationModuleDefinition,
  InstrumentationNodeModuleDefinition,
  InstrumentationNodeModuleFile,
  isWrapped,
} from '@opentelemetry/instrumentation';
import { InstrumentationConfig } from '@opentelemetry/instrumentation';
import { VERSION } from '../../../version';
import { context, trace } from '@opentelemetry/api';

export interface AttributeDefinition {
  attrIndex: number;
  attrPath?: string;
  key: string;
}

export interface InstrumentationFileDefinition {
  name: string;
  method: string;
  spanName?: string;
  attributes?: AttributeDefinition[];
}

export interface InstrumentationDefinition {
  moduleName?: string;
  absolutePath?: string;
  supportedVersions?: string[];
  files: InstrumentationFileDefinition[];
}

export interface NoCodeInstrumentationConfig extends InstrumentationConfig {
  definitions?: InstrumentationDefinition[];
}

export class NoCodeInstrumentation extends InstrumentationBase<NoCodeInstrumentationConfig> {
  constructor(config: NoCodeInstrumentationConfig = {}) {
    super('splunk-opentelemetry-instrumentation-nocode', VERSION, config);
  }

  protected init(): InstrumentationModuleDefinition[] {
    const configPath = process.env.NOCODE_CONFIG_PATH
      ? path.normalize(process.env.NOCODE_CONFIG_PATH)
      : path.resolve(process.cwd(), 'nocode.config.json');

    this._diag.debug(`Loading NoCodeInstrumentation config from ${configPath}`);

    try {
      if (!fs.existsSync(configPath)) {
        this._diag.debug(
          `NoCode config file not found at ${configPath}, skipping instrumentation`
        );
        return [];
      }
      const fileContent = fs.readFileSync(configPath, 'utf-8');
      const definitions = JSON.parse(fileContent);

      if (Array.isArray(definitions)) {
        this._config.definitions = definitions;

        // Normalize all paths
        for (const def of definitions) {
          if (def.absolutePath) {
            if (!path.isAbsolute(def.absolutePath)) {
              def.absolutePath = path.resolve(process.cwd(), def.absolutePath);
            }
            def.absolutePath = path.normalize(def.absolutePath);
          }
          def.files?.forEach((file: InstrumentationFileDefinition) => {
            file.name = path.normalize(file.name);
          });
        }
      } else {
        this._diag.warn(`Config at ${configPath} is not a valid array`);
      }
    } catch (err) {
      this._diag.error(
        `Failed to load NoCodeInstrumentation config from ${configPath}`,
        err
      );
    }

    return this.parseConfig(this._config);
  }

  private _wrappedFunction(fileDef: InstrumentationFileDefinition) {
    return (original: Function) => {
      const instrumentation = this;

      return function wrapped(this: unknown, ...args: unknown[]) {
        function getAttribute(
          attrDefinition: AttributeDefinition,
          args: unknown[]
        ): Record<string, unknown> {
          const index = attrDefinition.attrIndex;
          if (!Array.isArray(args) || index >= args.length) return {};

          let current: unknown = args[index];

          // attrPath not defined == primitive value
          if (!attrDefinition.attrPath) {
            return { [attrDefinition.key]: current };
          }

          for (const key of attrDefinition.attrPath.split('.')) {
            if (
              current !== null &&
              typeof current === 'object' &&
              key in current
            ) {
              current = (current as Record<string, unknown>)[key];
            } else {
              return {};
            }
          }

          return { [attrDefinition.key]: current };
        }

        const spanName =
          fileDef.spanName || `${fileDef.name}.${fileDef.method}`;
        const attrDefinitions = fileDef.attributes || [];
        const spanAttributes: Record<string, unknown>[] = [];

        for (const attrDefinition of attrDefinitions) {
          const attr = getAttribute(attrDefinition, args);
          if (Object.keys(attr).length > 0) {
            spanAttributes.push(attr);
            instrumentation._diag.info(
              `Extracted attributes for ${attrDefinition.key}: ${JSON.stringify(attr)}`
            );
          } else {
            instrumentation._diag.info(
              `No attributes extracted for ${attrDefinition.key}`
            );
          }
        }

        const span = instrumentation.tracer.startSpan(spanName, {
          attributes: Object.assign({}, ...spanAttributes),
        });

        const activeContext = trace.setSpan(context.active(), span);

        return context.with(activeContext, () => {
          let result: unknown;
          try {
            result = original.apply(this, args);
          } catch (error) {
            if (error instanceof Error) {
              span.recordException(error);
              span.setStatus({ code: 2, message: error.message });
            }
            span.end();
            throw error;
          }

          if (result instanceof Promise) {
            return result
              .then((res) => {
                span.end();
                return res;
              })
              .catch((err) => {
                if (err instanceof Error) {
                  span.recordException(err);
                  span.setStatus({ code: 2, message: err.message });
                }
                span.end();
                throw err;
              });
          } else {
            span.end();
            return result;
          }
        });
      };
    };
  }

  private parseConfig(
    config: NoCodeInstrumentationConfig
  ): InstrumentationNodeModuleDefinition[] {
    const definitions = config.definitions || [];
    const moduleDefs: InstrumentationNodeModuleDefinition[] = [];

    for (const def of definitions) {
      const fileDefs = def.files.map(
        (f) =>
          new InstrumentationNodeModuleFile(
            f.name,
            ['*'],
            this.generatePatchFunction(f),
            this.generateUnpatchFunction(f)
          )
      );

      if (def.moduleName) {
        moduleDefs.push(
          new InstrumentationNodeModuleDefinition(
            def.moduleName,
            def.supportedVersions || ['*'],
            undefined,
            undefined,
            fileDefs
          )
        );
      } else if (def.absolutePath) {
        moduleDefs.push(
          new InstrumentationNodeModuleDefinition(
            def.absolutePath,
            ['*'], // for absolute paths otel does no version checking
            undefined,
            undefined,
            fileDefs
          )
        );
      }
    }

    return moduleDefs;
  }

  private generatePatchFunction(
    fileDef: InstrumentationFileDefinition
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): (moduleExports: any) => any {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (moduleExports: any) => {
      const { method } = fileDef;
      if (!moduleExports || typeof moduleExports[method] !== 'function') {
        this._diag.warn(`Method ${method} not found on module`);
        return moduleExports;
      }

      this._wrap(moduleExports, method, this._wrappedFunction(fileDef));
      return moduleExports;
    };
  }

  private generateUnpatchFunction(fileDef: InstrumentationFileDefinition) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (moduleExports: any) => {
      const original = moduleExports?.[fileDef.method];
      if (isWrapped(original)) {
        this._unwrap?.(moduleExports, fileDef.method);
      }
    };
  }
}
