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

// Effective configuration state holder.
//
// The OpAMP "Effective Configuration" report must reflect the configuration
// actually in effect at runtime, regardless of how it was supplied
// (programmatic API, environment variables, declarative YAML, or defaults) and
// regardless of whether a feature actually managed to start. Re-deriving these
// values from process.env / the parsed config cannot capture programmatic
// options or runtime outcomes (e.g. the profiler failing to load).
//
// Instead, each component writes back the value it actually ended up with as it
// starts, via recordEffectiveState(). The effective-config builders read this
// holder first and only fall back to env/config derivation for values nothing
// has reported yet.

export interface EffectiveState {
  // Whether each signal pipeline actually started. A declarative config file can
  // declare a provider for a signal that is then disabled via the programmatic
  // API or an env var, in which case no pipeline starts and the corresponding
  // provider block must be dropped from the effective declarative config.
  tracingEnabled: boolean;
  metricsEnabled: boolean;
  loggingEnabled: boolean;
  // Resolved OTLP exporter base endpoints (no trailing resource path).
  tracesEndpoint: string | null;
  metricsEndpoint: string | null;
  logsEndpoint: string | null;
  // Whether the always-on CPU profiler actually started (false if requested but
  // the native extension could not be loaded).
  profilerEnabled: boolean;
  memoryProfilerEnabled: boolean;
  callStackInterval: number;
  // Whether the snapshot profiler actually started.
  snapshotProfilerEnabled: boolean;
  snapshotSamplingInterval: number;
}

let state: Partial<EffectiveState> = {};

export function recordEffectiveState(patch: Partial<EffectiveState>): void {
  state = { ...state, ...patch };
}

export function getEffectiveState(): Partial<EffectiveState> {
  return state;
}

// Clears all recorded state. Called on stop() so a subsequent start() does not
// report stale values, and used to isolate tests.
export function resetEffectiveState(): void {
  state = {};
}
