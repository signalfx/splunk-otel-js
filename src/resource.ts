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
  detectResources,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  Resource,
} from '@opentelemetry/resources';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { distroDetector } from './detectors/DistroDetector';

const detectors = [
  distroDetector,
  containerDetector,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
];

let detectedResource: Resource | undefined;

export function getDetectedResource() {
  if (detectedResource === undefined) {
    detectedResource = detectResources({
      detectors,
    });
  }

  return detectedResource;
}

export function setResource(resource: Resource) {
  detectedResource = resource;
}

export function clearResource() {
  detectedResource = undefined;
}
