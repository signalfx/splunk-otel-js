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

/* This is based on a detector from OTel https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-resources/src/detectors/
 We're copying this code and changing the implementation to a synchronous one from async. This is required for our distribution to not incur ~1 second of overhead
 when setting up the tracing pipeline. This is a temporary solution until we can agree upon and implement a solution upstream.
*/

/*
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { platform, release } from 'os';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  Resource,
  ResourceAttributes,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';

/**
 * OSDetector detects the resources related to the operating system (OS) on
 * which the process represented by this resource is running.
 */
class OSDetector {
  public detect(_config?: ResourceDetectionConfig): Resource {
    const attributes: ResourceAttributes = {
      [SemanticResourceAttributes.OS_TYPE]: this._normalizeType(platform()),
      [SemanticResourceAttributes.OS_VERSION]: release(),
    };
    return new Resource(attributes);
  }

  private _normalizeType(nodePlatform: string): string {
    // Maps from https://nodejs.org/api/os.html#osplatform to arch values in spec:
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/os.md
    switch (nodePlatform) {
      case 'sunos':
        return 'solaris';
      case 'win32':
        return 'windows';
      default:
        return nodePlatform;
    }
  }
}

export const osDetector = new OSDetector();
