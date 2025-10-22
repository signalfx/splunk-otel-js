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

import { ComponentProviderRegistry } from './ComponentProviderRegistry';
import { OpenTelemetryConfiguration } from './schema';
import { SDK } from './SDK';
import { ComponentProvider } from './types';
import { loadFile } from './YamlLoader';

export class Configuration {
  protected registry = new ComponentProviderRegistry();

  constructor(providers: ComponentProvider[]) {
    for (const provider of providers) {
      this.registerComponentProvider(provider);
    }
  }

  parse(filePath: string, format = 'yaml'): OpenTelemetryConfiguration {
    switch (format) {
      case 'yaml':
        return loadFile(filePath);
      default:
        throw new Error('Unknown configuration file format');
    }
  }

  create(configuration: OpenTelemetryConfiguration): SDK {
    return this.registry.create('sdk', 'sdk', configuration) as SDK;
  }

  registerComponentProvider(provider: ComponentProvider) {
    this.registry.register(provider);
  }
}
