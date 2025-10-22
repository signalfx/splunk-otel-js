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

import { CompositePropagator } from '@opentelemetry/core';
import { Configuration } from './configuration/index';
import {
  OpenTelemetrySdkProvider,
  OpenTelemetrySdkProviderConfig,
} from './configuration/component_providers/sdk';
import { isSnapshotProfilingEnabled } from './tracing/snapshots/Snapshots';
import { SnapshotPropagator } from './tracing/snapshots';
import { getEnvNumber } from './utils';
import { B3PropagatorProvider } from './configuration/component_providers/propagators/b3';
import { B3MultiPropagatorProvider } from './configuration/component_providers/propagators/b3multi';
import { BaggagePropagatorProvider } from './configuration/component_providers/propagators/baggage';
import { TraceContextPropagatorProvider } from './configuration/component_providers/propagators/tracecontext';
import { HostDetectorProvider } from './configuration/component_providers/detectors/host';
import { ProcessDetectorProvider } from './configuration/component_providers/detectors/process';
import { ContainerDetectorProvider } from './configuration/component_providers/detectors/container';
import { ServiceDetectorProvider } from './configuration/component_providers/detectors/service';
import { DistroDetectorProvider } from './detectors/DistroDetector';

export function createConfiguration() {
  const hooks: OpenTelemetrySdkProviderConfig['hooks'] = {
    propagator(propagator) {
      if (isSnapshotProfilingEnabled()) {
        return new CompositePropagator({
          propagators: [
            propagator,
            new SnapshotPropagator(
              getEnvNumber('SPLUNK_SNAPSHOT_SELECTION_RATE', 0.01)
            ),
          ],
        });
      }

      return propagator;
    },
  };

  return new Configuration([
    new OpenTelemetrySdkProvider({ hooks }),
    // Propagators
    new B3PropagatorProvider(),
    new B3MultiPropagatorProvider(),
    new BaggagePropagatorProvider(),
    new TraceContextPropagatorProvider(),
    // Detectors
    new ContainerDetectorProvider(),
    new HostDetectorProvider(),
    new ProcessDetectorProvider(),
    new ServiceDetectorProvider(),
    new DistroDetectorProvider(),
  ]);
}
