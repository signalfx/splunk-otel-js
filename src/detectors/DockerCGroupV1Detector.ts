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
import { Resource, ResourceDetectionConfig } from '@opentelemetry/resources';

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import * as fs from 'fs';
import { diag } from '@opentelemetry/api';

const isValidBase16String = (hexString: string) => {
  for (let ch = 0; ch < hexString.length; ch++) {
    const code = hexString.charCodeAt(ch);
    if (
      (48 <= code && code <= 57) ||
      (97 <= code && code <= 102) ||
      (65 <= code && code <= 70)
    ) {
      continue;
    }
    return false;
  }
  return true;
};

export class DockerCGroupV1Detector {
  public detect(_config?: ResourceDetectionConfig): Resource {
    try {
      const containerId = this._getContainerId();
      return !containerId
        ? Resource.empty()
        : new Resource({
            [SemanticResourceAttributes.CONTAINER_ID]: containerId,
          });
    } catch (e) {
      diag.info(
        'Docker CGROUP V1 Detector did not identify running inside a supported docker container, no docker attributes will be added to resource: ',
        e
      );
      return Resource.empty();
    }
  }

  protected _getContainerId(): string | null {
    try {
      const rawData = fs.readFileSync('/proc/self/cgroup', 'utf8').trim();
      console.log('rawData', rawData);
      return this._parseFile(rawData);
    } catch (e) {
      if (e instanceof Error) {
        const errorMessage = e.message;
        diag.info(
          'Docker CGROUP V1 Detector failed to read the Container ID: ',
          errorMessage
        );
      }
    }
    return null;
  }

  /*
    This is very likely has false positives since it does not check for the ID length,
    but is very robust in usually finding the right thing, and if not, finding some
    identifier for differentiating between containers.
    It also matches Java: https://github.com/open-telemetry/opentelemetry-java/commit/2cb461d4aef16f1ac1c5e67edc2fb41f90ed96a3#diff-ad68bc34d4da31a50709591d4b7735f88c008be7ed1fc325c6367dd9df033452
  */
  protected _parseFile(contents: string): string | null {
    if (typeof contents !== 'string') {
      return null;
    }
    for (const line of contents.split('\n')) {
      const lastSlashIdx = line.lastIndexOf('/');
      if (lastSlashIdx < 0) {
        return null;
      }

      const lastSection = line.substring(lastSlashIdx + 1);
      let startIdx = lastSection.lastIndexOf('-');
      let endIdx = lastSection.lastIndexOf('.');

      startIdx = startIdx === -1 ? 0 : startIdx + 1;
      if (endIdx === -1) {
        endIdx = lastSection.length;
      }
      if (startIdx > endIdx) {
        return null;
      }

      const containerId = lastSection.substring(startIdx, endIdx);
      if (containerId && isValidBase16String(containerId)) {
        return containerId;
      }
    }
    return null;
  }
}

export const dockerCGroupV1Detector = new DockerCGroupV1Detector();
