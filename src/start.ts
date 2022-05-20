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
import { getEnvBoolean } from './utils';
import { startMetrics, MetricsOptions } from './metrics';
import { startProfiling, ProfilingOptions } from './profiling';
import { startTracing, TracingOptions } from './tracing';

interface GeneralOptions {
  /**
   * This is intentionally optional so that the exporters would be able to enforce
   * their own default.
   */
  endpoint?: string;
  serviceName: string;
  accessToken: string;
}

interface Options extends GeneralOptions {
  metrics: MetricsOptions;
  profiling: ProfilingOptions;
  tracing: TracingOptions;
}

export const start = (options: Partial<Options>) => {
  const { metrics, profiling, tracing, ...restOptions } = options;

  if (
    options.profiling ??
    getEnvBoolean('SPLUNK_PROFILER_ENABLED', undefined) ??
    false
  ) {
    startProfiling(Object.assign({}, restOptions, profiling));
  }

  if (
    options.tracing ??
    getEnvBoolean('SPLUNK_TRACING_ENABLED', undefined) ??
    true
  ) {
    startTracing(Object.assign({}, restOptions, tracing));
  }

  if (
    options.metrics ??
    getEnvBoolean('SPLUNK_METRICS_ENABLED', undefined) ??
    false
  ) {
    startMetrics(Object.assign({}, restOptions, metrics));
  }
};
