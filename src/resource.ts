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
  detectResources,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  Resource,
  ResourceDetector,
  serviceInstanceIdDetector,
} from '@opentelemetry/resources';
import { containerDetector } from '@opentelemetry/resource-detector-container';
import { distroDetector } from './detectors/DistroDetector';
import { telemetrySdkDetector } from './detectors/TelemetrySdkDetector';
import { getConfigResourceDetectors } from './configuration';
import type { ExperimentalResourceDetector } from './configuration/schema';

const defaultDetectors = [
  distroDetector,
  containerDetector,
  envDetector,
  hostDetector,
  osDetector,
  processDetector,
  telemetrySdkDetector,
];

let detectedResource: Resource | undefined;

function toDetector(
  rd: ExperimentalResourceDetector
): ResourceDetector | undefined {
  if (rd.container !== undefined) return containerDetector;
  if (rd.host !== undefined) return hostDetector;
  if (rd.process !== undefined) return processDetector;
  if (rd.service !== undefined) return serviceInstanceIdDetector;

  return undefined;
}

export function getDetectedResource() {
  if (detectedResource === undefined) {
    const configDetectors = getConfigResourceDetectors();

    if (configDetectors === undefined) {
      detectedResource = detectResources({
        detectors: defaultDetectors,
      });
    } else {
      const detectors = configDetectors
        .map(toDetector)
        .filter((d) => d !== undefined);
      detectedResource = detectResources({
        detectors: [distroDetector, telemetrySdkDetector, ...detectors],
      });
    }
  }

  return detectedResource;
}

export function setResource(resource: Resource) {
  detectedResource = resource;
}

export function clearResource() {
  detectedResource = undefined;
}
