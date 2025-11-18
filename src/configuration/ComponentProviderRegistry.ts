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
  ComponentProvider,
  ComponentTypes,
  TypeComponentConfigMapping,
} from './types';

export class ComponentProviderRegistry {
  providers = new Map<ComponentTypes, Map<string, ComponentProvider>>();

  constructor(providers: ComponentProvider[] = []) {
    for (const provider of providers) {
      this.register(provider);
    }
  }

  /**
   *
   * @param provider Component provider
   * @param type Optional component type override
   * @param name Optional component name override
   */
  register(
    provider: ComponentProvider,
    type: ComponentTypes = provider.type,
    name: string = provider.name
  ) {
    if (!this.providers.has(type)) {
      this.providers.set(type, new Map());
    }
    const typeMap = this.providers.get(type)!;

    if (typeMap.get(name)) {
      throw new Error(
        `Component provider for ${type} ${name} already registerred`
      );
    }
    typeMap.set(name, provider);
  }

  public component<T extends ComponentTypes = ComponentTypes>(
    type: T,
    config: TypeComponentConfigMapping[T],
    context: Record<string, unknown> = {}
  ): unknown {
    const kind = Object.keys(config);
    if (kind.length !== 1) {
      const text = kind.length ? kind.join(', ') : '(none)';
      throw new Error(
        `Component ${type} must have exactly one provider, got ${text}`
      );
    }

    return this.create(type, kind[0], config[kind[0]], context);
  }

  public componentMap<T extends ComponentTypes = ComponentTypes>(
    type: T,
    config: TypeComponentConfigMapping[T],
    context: Record<string, unknown> = {}
  ): Array<unknown> {
    return Object.keys(config).map((name) =>
      this.create(
        type,
        name,
        config[name as keyof TypeComponentConfigMapping[T]],
        context
      )
    );
  }

  public componentArrayMap<T extends ComponentTypes = ComponentTypes>(
    type: T,
    configs: TypeComponentConfigMapping[T][],
    context: Record<string, unknown> = {}
  ): Array<unknown> {
    const components = [];

    for (const config of configs as unknown as Array<Record<string, unknown>>) {
      components.push(this.component(type, config, context));
    }

    return components;
  }

  protected oneOfMap<T extends ComponentTypes = ComponentTypes>(
    type: T,
    config: TypeComponentConfigMapping[T],
    context: Record<string, unknown> = {}
  ): unknown {
    const kind = Object.keys(config);
    if (kind.length !== 1) {
      const text = kind.length ? kind.join(', ') : '(none)';
      throw new Error(
        `Component ${type} must have exactly one provider, got ${text}`
      );
    }

    return this.create(type, kind[0], config[kind[0]], context);
  }

  public create(
    type: ComponentTypes,
    name: string,
    config: unknown,
    context: Record<string, unknown> = {}
  ): unknown {
    const provider = this.providers.get(type)?.get(name);
    if (!provider) {
      throw new Error(
        `No component provider for ${type} ${name} has been registerred`
      );
    }

    return provider.create(config, this, context);
  }
}
