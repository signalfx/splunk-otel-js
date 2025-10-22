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
  DetectedResource,
  ResourceDetectionConfig,
  resourceFromAttributes,
} from '@opentelemetry/resources';
import { VERSION } from '../version';
import { ComponentProvider } from '../configuration/types';

class DistroDetector {
  detect(_config?: ResourceDetectionConfig): DetectedResource {
    return resourceFromAttributes({
      'telemetry.distro.name': 'splunk-nodejs',
      'telemetry.distro.version': VERSION,
    });
  }
}

export const distroDetector = new DistroDetector();

export class DistroDetectorProvider
  implements ComponentProvider<'detector', 'distro'>
{
  readonly type = 'detector';
  readonly name = 'distro';

  create() {
    return distroDetector;
  }
}
