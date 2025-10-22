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

import { B3InjectEncoding, B3Propagator } from '@opentelemetry/propagator-b3';
import { ComponentProvider } from '../../types';

export class B3MultiPropagatorProvider
  implements ComponentProvider<'propagator', 'b3multi'>
{
  readonly type = 'propagator';
  readonly name = 'b3multi';

  create() {
    return new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER });
  }
}
