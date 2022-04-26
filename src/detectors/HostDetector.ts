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

import { arch, hostname } from 'os';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  Resource,
  ResourceAttributes,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';

/**
 * HostDetector detects the resources related to the host current process is
 * running on. Currently only non-cloud-based attributes are included.
 */
class HostDetector {
  public detect(_config?: ResourceDetectionConfig): Resource {
    const attributes: ResourceAttributes = {
      [SemanticResourceAttributes.HOST_NAME]: hostname(),
      [SemanticResourceAttributes.HOST_ARCH]: this._normalizeArch(arch()),
    };
    return new Resource(attributes);
  }

  private _normalizeArch(nodeArchString: string): string {
    // Maps from https://nodejs.org/api/os.html#osarch to arch values in spec:
    // https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/resource/semantic_conventions/host.md
    switch (nodeArchString) {
      case 'arm':
        return 'arm32';
      case 'ppc':
        return 'ppc32';
      case 'x64':
        return 'amd64';
      default:
        return nodeArchString;
    }
  }
}

export const hostDetector = new HostDetector();
