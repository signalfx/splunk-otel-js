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

import { CompositePropagator } from '@opentelemetry/core';
import { ComponentProviderRegistry } from '../ComponentProviderRegistry';
import {
  HttpsOpentelemetryIoOtelconfigPropagatorJson,
  OpenTelemetryConfiguration,
} from '../schema';
import { ComponentProvider } from '../types';
import { TextMapPropagator } from '@opentelemetry/api';

export interface OpenTelemetrySdkProviderConfig {
  hooks?: {
    propagator?: (propagator: TextMapPropagator) => TextMapPropagator;
  };
}

export class OpenTelemetrySdkProvider
  implements ComponentProvider<'sdk', 'sdk'>
{
  readonly type = 'sdk';
  readonly name = 'sdk';

  protected config?: OpenTelemetrySdkProviderConfig;

  constructor(config?: OpenTelemetrySdkProviderConfig) {
    this.config = config;
  }

  create(
    config: OpenTelemetryConfiguration,
    providerRegistry: ComponentProviderRegistry
  ): unknown {
    const propagator = this.createPropagators(
      config.propagator,
      providerRegistry
    );
  }

  protected createPropagators(
    config: HttpsOpentelemetryIoOtelconfigPropagatorJson | undefined,
    providerRegistry: ComponentProviderRegistry
  ) {
    if (!config) {
      return new CompositePropagator();
    }

    // composite_list -> composite if not already set
    const configs = config.composite?.slice() ?? [];
    if (config.composite_list) {
      for (const propagator of config.composite_list) {
        if (!configs.find((config) => propagator in config)) {
          configs.push({ propagator: null });
        }
      }
    }

    let propagator: TextMapPropagator = new CompositePropagator({
      propagators: providerRegistry.componentArrayMap(
        'propagator',
        configs
      ) as TextMapPropagator[],
    });

    if (this.config?.hooks?.propagator) {
      propagator = this.config.hooks.propagator(propagator);
    }

    return propagator;
  }
}
