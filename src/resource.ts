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

import { diag } from '@opentelemetry/api';
import {
  Resource,
  envDetectorSync,
  hostDetectorSync,
  osDetectorSync,
  processDetectorSync,
} from '@opentelemetry/resources';

import { distroDetector } from './detectors/DistroDetector';
import { containerDetector } from './detectors/ContainerDetector';

const detectors = [
  distroDetector,
  containerDetector,
  envDetectorSync,
  hostDetectorSync,
  osDetectorSync,
  processDetectorSync,
];

export const detect = (): Resource => {
  return detectors
    .map((detector) => {
      try {
        return detector.detect();
      } catch (e) {
        diag.error(`${detector.constructor.name} failed:`, e);
        return Resource.empty();
      }
    })
    .reduce((acc, resource) => {
      return acc.merge(resource);
    }, Resource.empty());
};
