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
  getEnvBoolean,
  getNonEmptyEnvVar,
  parseEnvBooleanString,
  parseLogLevel,
  toDiagLogLevel,
} from './utils';
import { startMetrics, StartMetricsOptions } from './metrics';
import { startProfiling, StartProfilingOptions } from './profiling';
import type { EnvVarKey, LogLevel } from './types';
import {
  getLoadedInstrumentations,
  startTracing,
  stopTracing,
  StartTracingOptions,
} from './tracing';
import { parseOptionsAndConfigureInstrumentations } from './instrumentations';
import {
  diag,
  DiagConsoleLogger,
  DiagLogLevel,
  metrics as metricsApi,
  MeterOptions,
  createNoopMeter,
} from '@opentelemetry/api';
import { StartLoggingOptions, startLogging } from './logging';

export interface Options {
  accessToken: string;
  endpoint: string;
  serviceName: string;
  logLevel?: LogLevel;
  // Signal-specific configuration options:
  metrics: boolean | StartMetricsOptions;
  profiling: boolean | StartProfilingOptions;
  tracing: boolean | StartTracingOptions;
  logging: boolean | StartLoggingOptions;
}

interface RunningState {
  metrics: ReturnType<typeof startMetrics> | null;
  profiling: ReturnType<typeof startProfiling> | null;
  tracing: ReturnType<typeof startTracing> | null;
  logging: ReturnType<typeof startLogging> | null;
}

const running: RunningState = {
  metrics: null,
  profiling: null,
  tracing: null,
  logging: null,
};

function isSignalEnabled<T>(
  option: T | undefined | null,
  envVar: EnvVarKey,
  def: boolean
) {
  return option ?? parseEnvBooleanString(getNonEmptyEnvVar(envVar)) ?? def;
}

export const start = (options: Partial<Options> = {}) => {
  if (
    running.logging ||
    running.metrics ||
    running.profiling ||
    running.tracing
  ) {
    throw new Error('Splunk APM already started');
  }
  const logLevel = options.logLevel
    ? toDiagLogLevel(options.logLevel)
    : parseLogLevel(getNonEmptyEnvVar('OTEL_LOG_LEVEL'));

  if (logLevel !== DiagLogLevel.NONE) {
    diag.setLogger(new DiagConsoleLogger(), logLevel);
  }

  const { tracingOptions, loggingOptions, profilingOptions, metricsOptions } =
    parseOptionsAndConfigureInstrumentations(options);

  let metricsEnabledByDefault = false;
  if (isSignalEnabled(options.profiling, 'SPLUNK_PROFILER_ENABLED', false)) {
    running.profiling = startProfiling(profilingOptions);
    if (profilingOptions.memoryProfilingEnabled) {
      metricsEnabledByDefault = true;
    }
  }

  if (isSignalEnabled(options.tracing, 'SPLUNK_TRACING_ENABLED', true)) {
    running.tracing = startTracing(tracingOptions);
  }

  if (
    isSignalEnabled(options.logging, 'SPLUNK_AUTOMATIC_LOG_COLLECTION', false)
  ) {
    running.logging = startLogging(loggingOptions);
  }

  if (
    isSignalEnabled(
      options.metrics,
      'SPLUNK_METRICS_ENABLED',
      metricsEnabledByDefault
    )
  ) {
    running.metrics = startMetrics(metricsOptions);
  }

  const meterProvider = getEnvBoolean(
    'SPLUNK_INSTRUMENTATION_METRICS_ENABLED',
    false
  )
    ? metricsApi.getMeterProvider()
    : createNoopMeterProvider();
  for (const instrumentation of getLoadedInstrumentations()) {
    instrumentation.setMeterProvider(meterProvider);
  }
};

function createNoopMeterProvider() {
  const meter = createNoopMeter();
  return {
    getMeter(_name: string, _version?: string, _options?: MeterOptions) {
      return meter;
    },
    // AWS Lambda instrumentation check for the existence of forceFlush,
    // if it does not exist, an error is logged for each span.
    forceFlush() {
      return Promise.resolve();
    },
  };
}

export const stop = async () => {
  const promises = [];

  if (running.logging) {
    promises.push(running.logging.stop());
    running.logging = null;
  }

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
