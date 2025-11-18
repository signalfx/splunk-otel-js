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
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ComponentProviderRegistry } from '../ComponentProviderRegistry';
import {
  AttributeLimits,
  HttpsOpentelemetryIoOtelconfigPropagatorJson,
  HttpsOpentelemetryIoOtelconfigResourceJson,
  HttpsOpentelemetryIoOtelconfigTracerProviderJson,
  OpenTelemetryConfiguration,
} from '../schema';
import { ComponentProvider } from '../types';
import {
  Attributes,
  diag,
  DiagConsoleLogger,
  TextMapPropagator,
} from '@opentelemetry/api';
import { SDK } from '../SDK';
import { parseLogLevel } from '../../utils';
import { getDetectedResource, setResource } from '../../resource';
import { parseResourceAttributes } from './utils/resource';

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
    providerRegistry: ComponentProviderRegistry,
    context: Record<string, unknown>
  ): SDK {
    const logLevel = parseLogLevel(config.log_level ?? 'info');
    if (logLevel) {
      diag.setLogger(new DiagConsoleLogger(), logLevel);
    }

    const sdk = new SDK();

    const propagator = this.createPropagators(
      config.propagator,
      providerRegistry,
      context
    );
    sdk.propagator = propagator;
    if (config.disabled) {
      return sdk;
    }

    const resource = this.createResource(
      config.resource,
      providerRegistry,
      context
    );
    sdk.resource = resource;

    const tracerProvider = this.createTracerProvider(
      config.tracer_provider,
      providerRegistry,
      context,
      resource,
      config.attribute_limits
    );

    return sdk;
  }

  protected createPropagators(
    config: HttpsOpentelemetryIoOtelconfigPropagatorJson | undefined,
    providerRegistry: ComponentProviderRegistry,
    context: Record<string, unknown>
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
        configs,
        context
      ) as TextMapPropagator[],
    });

    if (this.config?.hooks?.propagator) {
      propagator = this.config.hooks.propagator(propagator);
    }

    return propagator;
  }

  protected createResource(
    config: HttpsOpentelemetryIoOtelconfigResourceJson | undefined,
    providerRegistry: ComponentProviderRegistry,
    context: Record<string, unknown>
  ) {
    /* Not implementing for now
    const detectors = providerRegistry.componentArrayMap(
      'detector',
      config?.['detection/development']?.detectors ?? [],
      context
    ) as ResourceDetector[];
    */

    let resource = getDetectedResource();
    const attributes: Attributes = {
      ...(config?.attributes_list
        ? parseResourceAttributes(config?.attributes_list)
        : {}),
    };

    if (config?.attributes) {
      for (const { name, value } of config.attributes) {
        if (value !== null) {
          attributes[name] = value;
        } else {
          delete attributes[name];
        }
      }
    }

    resource = resource.merge(resourceFromAttributes(attributes));

    // For profiler
    setResource(resource);

    return resource;
  }

  protected createTracerProvider(
    config: HttpsOpentelemetryIoOtelconfigTracerProviderJson | undefined,
    providerRegistry: ComponentProviderRegistry,
    context: Record<string, unknown>,
    resource: Resource,
    attribute_limits: AttributeLimits | undefined
  ) {
    const spanProcessors = providerRegistry.componentArrayMap(
      'span_processor',
      config?.processors ?? [],
      context
    );
  }
}
