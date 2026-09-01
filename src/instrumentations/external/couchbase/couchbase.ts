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
  InstrumentationBase,
  InstrumentationModuleDefinition,
  InstrumentationNodeModuleDefinition,
  isWrapped,
} from '@opentelemetry/instrumentation';
import { getConfigBoolean } from '../../../configuration';
import { VERSION } from '../../../version';

type CouchbaseConnect = (...args: unknown[]) => unknown;

interface CouchbaseConnectTarget {
  connect: CouchbaseConnect;
}

interface CouchbaseConnectOptions {
  tracer?: unknown;
  meter?: unknown;
  tracingConfig?: {
    enableTracing?: boolean;
  };
  metricsConfig?: {
    enableMetrics?: boolean;
  };
  [key: string]: unknown;
}

interface CouchbaseModule extends CouchbaseConnectTarget {
  Cluster?: CouchbaseConnectTarget;
  getOTelTracer: () => unknown;
  getOTelMeter?: () => unknown;
}

export class CouchbaseInstrumentation extends InstrumentationBase {
  constructor() {
    super('splunk-opentelemetry-instrumentation-couchbase', VERSION, {});
  }

  protected init(): InstrumentationModuleDefinition {
    return new InstrumentationNodeModuleDefinition(
      'couchbase',
      ['>=4.7.0 <5'],
      (moduleExports: CouchbaseModule, moduleVersion) => {
        this._diag.debug(
          `couchbase instrumentation: patch couchbase ${moduleVersion ?? ''}`
        );
        this.patchConnect(moduleExports, moduleExports);
        if (moduleExports.Cluster) {
          this.patchConnect(moduleExports, moduleExports.Cluster);
        }
        return moduleExports;
      },
      (moduleExports: CouchbaseModule) => {
        this._diag.debug('couchbase instrumentation: unpatch couchbase');
        this.unpatchConnect(moduleExports);
        if (moduleExports.Cluster) {
          this.unpatchConnect(moduleExports.Cluster);
        }
      }
    );
  }

  private patchConnect(
    moduleExports: CouchbaseModule,
    target: CouchbaseConnectTarget
  ): void {
    if (isWrapped(target.connect)) {
      this._unwrap(target, 'connect');
    }

    const instrumentation = this;
    this._wrap(target, 'connect', (originalConnect) => {
      return function (this: unknown, ...args: unknown[]) {
        const connectArgs = instrumentation.injectTelemetry(
          moduleExports,
          args
        );
        return originalConnect.apply(this, connectArgs);
      };
    });
  }

  private unpatchConnect(target: CouchbaseConnectTarget): void {
    if (isWrapped(target.connect)) {
      this._unwrap(target, 'connect');
    }
  }

  private injectTelemetry(
    moduleExports: CouchbaseModule,
    args: unknown[]
  ): unknown[] {
    const suppliedOptions = args[1];
    if (
      suppliedOptions !== undefined &&
      (suppliedOptions === null || typeof suppliedOptions !== 'object')
    ) {
      return args;
    }

    const options = (suppliedOptions ?? {}) as CouchbaseConnectOptions;
    const injectTracer =
      options.tracer === undefined &&
      options.tracingConfig?.enableTracing !== false;
    const injectMeter =
      getConfigBoolean('SPLUNK_INSTRUMENTATION_METRICS_ENABLED', false) &&
      options.meter === undefined &&
      options.metricsConfig?.enableMetrics !== false &&
      moduleExports.getOTelMeter !== undefined;

    if (!injectTracer && !injectMeter) {
      return args;
    }

    const connectArgs = [...args];
    const injectedOptions = { ...options };

    if (injectTracer) {
      injectedOptions.tracer = moduleExports.getOTelTracer();
    }
    if (injectMeter) {
      injectedOptions.meter = moduleExports.getOTelMeter?.();
    }

    connectArgs[1] = injectedOptions;
    return connectArgs;
  }
}
