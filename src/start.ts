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
import { assertNoExtraneousProperties, parseEnvBooleanString } from './utils';
import { startMetrics, MetricsOptions } from './metrics';
import { startProfiling, ProfilingOptions } from './profiling';
import { startTracing, stopTracing, TracingOptions } from './tracing';

interface Options {
  accessToken: string;
  endpoint: string;
  serviceName: string;
  // Signal-specific configuration options:
  metrics: boolean | MetricsOptions;
  profiling: boolean | ProfilingOptions;
  tracing: boolean | TracingOptions;
}

interface RunningState {
  metrics: ReturnType<typeof startMetrics> | null;
  profiling: ReturnType<typeof startProfiling> | null;
  tracing: ReturnType<typeof startTracing> | null;
}

const running: RunningState = {
  metrics: null,
  profiling: null,
  tracing: null,
};

function isSignalEnabled<T>(
  option: T | undefined | null,
  envVar: string,
  def: boolean
) {
  return option ?? parseEnvBooleanString(process.env[envVar]) ?? def;
}

export const start = (options: Partial<Options> = {}) => {
  if (running.metrics || running.profiling || running.tracing) {
    throw new Error('Splunk APM already started');
  }
  const { metrics, profiling, tracing, ...restOptions } = options;

  assertNoExtraneousProperties(restOptions, [
    'accessToken',
    'endpoint',
    'serviceName',
  ]);

  if (isSignalEnabled(options.profiling, 'SPLUNK_PROFILER_ENABLED', false)) {
    running.profiling = startProfiling(
      Object.assign({}, restOptions, profiling)
    );
  }

  if (isSignalEnabled(options.tracing, 'SPLUNK_TRACING_ENABLED', true)) {
    running.tracing = startTracing(Object.assign({}, restOptions, tracing));
  }

  if (isSignalEnabled(options.metrics, 'SPLUNK_METRICS_ENABLED', false)) {
    running.metrics = startMetrics(Object.assign({}, restOptions, metrics));
  }
};

export const stop = async () => {
  const promises = [];

  if (running.metrics) {
    promises.push(running.metrics.stop());
    running.metrics = null;
  }

  if (running.tracing) {
    promises.push(stopTracing());
    running.tracing = null;
  }

  if (running.profiling) {
    promises.push(
      new Promise<void>((resolve) => {
        running.profiling!.stop();
        resolve();
      })
    );
    running.profiling = null;
  }

  return Promise.all(promises);
};
