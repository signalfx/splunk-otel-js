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

import { ComponentProvider } from '../../types';
import { SplunkSimpleSpanProcessor } from '../../../tracing/SplunkSimpleSpanProcessor';
import { SimpleSpanProcessor as SchemaSimpleSpanProcessor } from '../../schema';
import { ComponentProviderRegistry } from '../../ComponentProviderRegistry';

export class SimpleSpanProcessorProvider
  implements ComponentProvider<'span_processor', 'simple'>
{
  readonly type = 'span_processor';
  readonly name = 'simple';

  create(
    config: SchemaSimpleSpanProcessor,
    providerRegistry: ComponentProviderRegistry,
    context: Record<string, unknown>,
  ) {
    const exporter = providerRegistry.componentMap('span_exporter', config.exporter);

    return new SplunkSimpleSpanProcessor(exporter);
  }
}
