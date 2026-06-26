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

import type { Resource } from '@opentelemetry/resources';
import type { ResourceFactory } from '../types';

export interface EffectiveConfig {
  // Selects the wire format (content type) per the GDI spec.
  type: 'yaml' | 'env';
  // The AgentConfigFile name used as the key in the OpAMP ConfigMap. For the
  // env format this is always `environment`; for the yaml format it is the
  // effective declarative config filename (OTEL_CONFIG_FILE).
  name: string;
  content: string;
}

// Normalized runtime profiling configuration parsed out of a remote config
// document. The OpAMP client builds this from the `splunk.remote.config` file
// and hands it to the `applyRemoteConfig` callback; the client itself imports
// nothing from `profiling/`. Per the GDI datamodel, presence of a feature key
// means "on" and its absence means "off", so each feature is a discrete flag
// rather than an optional value.
export interface RemoteProfilingConfig {
  // Always-on CPU profiler.
  cpuProfiler: {
    enabled: boolean;
    // Sampling interval in milliseconds, when the server specified one.
    samplingInterval?: number;
  };
  // Always-on memory profiler.
  memoryProfiler: {
    enabled: boolean;
  };
  // Snapshot profiling (callgraphs).
  callgraphs: {
    enabled: boolean;
  };
}

export interface OpAMPOptions {
  endpoint: string;
  serviceName: string;
  resource: Resource;
  pollingIntervalMs: number;
  accessToken?: string;
  getEffectiveConfig: () => EffectiveConfig;
  // When provided, the client advertises remote-config capabilities and routes
  // received `splunk.remote.config` documents here. Absent ⇒ remote config is
  // not opted in and the client ignores any server-pushed config.
  applyRemoteConfig?: (config: RemoteProfilingConfig) => Promise<void>;
}

export type StartOpAMPOptions = Partial<
  Omit<
    OpAMPOptions,
    'resource' | 'serviceName' | 'getEffectiveConfig' | 'applyRemoteConfig'
  >
> & {
  serviceName?: string;
  resourceFactory?: ResourceFactory;
};

export interface OpAMPHandle {
  stop(): Promise<void>;
}
