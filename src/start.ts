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
import { startTracing, stopTracing, TracingOptions } from './tracing';

interface GeneralOptions {
  accessToken: string;
  endpoint: string;
  serviceName: string;
}

interface Options extends GeneralOptions {
  metrics: boolean | MetricsOptions;
  profiling: boolean | ProfilingOptions;
  tracing: boolean | TracingOptions;
}

let runningMetrics: ReturnType<typeof startMetrics> | null = null;
let runningProfiling: ReturnType<typeof startProfiling> | null = null;
let runningTracing: ReturnType<typeof startTracing> | null = null;

export const start = (options: Partial<Options>) => {
  if (runningMetrics || runningProfiling || runningTracing) {
    console.warn('Splunk APM already started');
    return;
  }
  const { metrics, profiling, tracing, ...restOptions } = options;

  if (
    options.profiling ??
    getEnvBoolean('SPLUNK_PROFILER_ENABLED', undefined) ??
    false
  ) {
    runningProfiling = startProfiling(Object.assign({}, restOptions, profiling));
  }

  if (
    options.tracing ??
    getEnvBoolean('SPLUNK_TRACING_ENABLED', undefined) ??
    true
  ) {
    runningTracing = startTracing(Object.assign({}, restOptions, tracing));
  }

  if (
    options.metrics ??
    getEnvBoolean('SPLUNK_METRICS_ENABLED', undefined) ??
    false
  ) {
    runningMetrics = startMetrics(Object.assign({}, restOptions, metrics));
  }
};

export const stop = () => {
  if (runningMetrics) {
    runningMetrics.stopMetrics();
    runningMetrics = null;
  }

  if (runningTracing) {
    stopTracing();
    runningTracing = null;
  }

  if (runningProfiling) {
    runningProfiling.stop();
    runningProfiling = null;
  }
};
