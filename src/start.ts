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
  findAttribute,
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
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { StartLoggingOptions, startLogging } from './logging';
import { startOpAMP, type StartOpAMPOptions, type OpAMPHandle } from './opamp';
import { Resource } from '@opentelemetry/resources';
import { getDetectedResource } from './resource';
import {
  isSnapshotProfilingEnabled,
  startSnapshotProfiling,
} from './tracing/snapshots/Snapshots';
import { getNonEmptyEnvVar } from './utils';
import {
  getNonEmptyConfigVar,
  getConfigBoolean,
  setGlobalConfiguration,
  loadConfiguration,
} from './configuration';
import { readFileSync } from 'node:fs';

export interface Options {
  accessToken: string;
  endpoint: string;
  realm: string;
  serviceName: string;
  logLevel?: LogLevel;
  resource?: (detectedResource: Resource) => Resource;
  // Signal-specific configuration options:
  metrics: boolean | StartMetricsOptions;
  profiling: boolean | StartProfilingOptions;
  tracing: boolean | StartTracingOptions;
  logging: boolean | StartLoggingOptions;
  opamp: boolean | StartOpAMPOptions;
}

interface RunningState {
  metrics: ReturnType<typeof startMetrics> | null;
  profiling: ReturnType<typeof startProfiling> | null;
  tracing: ReturnType<typeof startTracing> | null;
  logging: ReturnType<typeof startLogging> | null;
  opamp: OpAMPHandle | null;
}

const running: RunningState = {
  metrics: null,
  profiling: null,
  tracing: null,
  logging: null,
  opamp: null,
};

function isFeatureEnabled<T>(
  option: T | undefined | null,
  envVar: EnvVarKey,
  def: boolean
) {
  return option ?? parseEnvBooleanString(getNonEmptyConfigVar(envVar)) ?? def;
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

  const configFilePath = getNonEmptyEnvVar('OTEL_EXPERIMENTAL_CONFIG_FILE');
  if (configFilePath) {
    const content = readFileSync(configFilePath, { encoding: 'utf-8' });
    const configuration = loadConfiguration(content);
    setGlobalConfiguration(configuration);

    if (configuration.disabled === true) {
      return;
    }
  }

  const logLevel = options.logLevel
    ? toDiagLogLevel(options.logLevel)
    : parseLogLevel(getNonEmptyConfigVar('OTEL_LOG_LEVEL'));

  if (logLevel !== DiagLogLevel.NONE) {
    diag.setLogger(new DiagConsoleLogger(), logLevel);
  }

  const envResource = getDetectedResource();

  const serviceName =
    options.serviceName ||
    getNonEmptyConfigVar('OTEL_SERVICE_NAME') ||
    findAttribute(envResource, ATTR_SERVICE_NAME);

  if (!serviceName) {
    diag.warn(
      'service.name attribute is not set, your service is unnamed and will be difficult to identify. ' +
        'Set your service name using the OTEL_RESOURCE_ATTRIBUTES environment variable. ' +
        'E.g. OTEL_RESOURCE_ATTRIBUTES="service.name=<YOUR_SERVICE_NAME_HERE>"'
    );
  }

  const {
    tracingOptions,
    loggingOptions,
    profilingOptions,
    metricsOptions,
    opampOptions,
  } = parseOptionsAndConfigureInstrumentations(options);

  if (isFeatureEnabled(options.opamp, 'SPLUNK_OPAMP_ENABLED', false)) {
    running.opamp = startOpAMP(opampOptions);
  }

  let metricsEnabledByDefault = false;
  if (isFeatureEnabled(options.profiling, 'SPLUNK_PROFILER_ENABLED', false)) {
    running.profiling = startProfiling(profilingOptions);
    if (profilingOptions.memoryProfilingEnabled) {
      metricsEnabledByDefault = true;
    }
  }

  if (isSnapshotProfilingEnabled()) {
    startSnapshotProfiling({
      endpoint: profilingOptions.endpoint,
      serviceName: profilingOptions.serviceName,
      resource: profilingOptions.resource,
    });
  }

  if (isFeatureEnabled(options.tracing, 'SPLUNK_TRACING_ENABLED', true)) {
    running.tracing = startTracing(tracingOptions);
  }

  if (
    isFeatureEnabled(options.logging, 'SPLUNK_AUTOMATIC_LOG_COLLECTION', false)
  ) {
    running.logging = startLogging(loggingOptions);
  }

  if (
    isFeatureEnabled(
      options.metrics,
      'SPLUNK_METRICS_ENABLED',
      metricsEnabledByDefault
    )
  ) {
    running.metrics = startMetrics(metricsOptions);
  }

  const meterProvider = getConfigBoolean(
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

  if (running.opamp) {
    promises.push(running.opamp.stop());
    running.opamp = null;
  }

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
    promises.push(promises.push(running.profiling!.stop()));
    running.profiling = null;
  }

  return Promise.all(promises);
};
