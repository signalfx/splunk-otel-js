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
import {
  Detector,
  Resource,
  ResourceDetectionConfig,
} from '@opentelemetry/resources';

import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

import * as fs from 'fs';
import * as util from 'util';
import { diag } from '@opentelemetry/api';

export class DockerCGroupV1Detector implements Detector {
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

  protected _getContainerId(): string | undefined {
    const CONTAINER_ID_LENGTH = 64;

    try {
      const rawData = DockerCGroupV1Detector.readFileAsync(
        '/proc/self/cgroup',
        'utf8'
      );
      const splitData = rawData.trim().split('\n');
      for (const str of splitData) {
        if (str.length >= CONTAINER_ID_LENGTH) {
          return str.substring(str.length - CONTAINER_ID_LENGTH);
        }
      }
    } catch (e) {
      if (e instanceof Error) {
        const errorMessage = e.message;
        diag.info(
          'Docker CGROUP V1 Detector failed to read the Container ID: ',
          errorMessage
        );
      }
    }
    return undefined;
  }
}

export const dockerCGroupV1Detector = new DockerCGroupV1Detector();
