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
import { StartProfilingOptions } from './profiling';
import { ProfilingController } from './profiling/ProfilingController';
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
import {
  recordEffectiveState,
  resetEffectiveState,
} from './opamp/effective-state';
import { startSecureapp } from './secureapp';
import type { StartSecureappOptions } from './secureapp/types';
import { Resource } from '@opentelemetry/resources';
import { getDetectedResource } from './resource';
import {
  isSnapshotProfilingEnabled,
  startSnapshotProfiling,
  stopSnapshotProfiling,
} from './tracing/snapshots/Snapshots';
import { getEnvValueByPrecedence } from './utils';
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
  secureapp: boolean | StartSecureappOptions;
}

interface RunningState {
  metrics: ReturnType<typeof startMetrics> | null;
  profilingController: ProfilingController | null;
  tracing: ReturnType<typeof startTracing> | null;
  logging: ReturnType<typeof startLogging> | null;
  opamp: OpAMPHandle | null;
  secureapp: ReturnType<typeof startSecureapp> | null;
}

const running: RunningState = {
  metrics: null,
  profilingController: null,
  tracing: null,
  logging: null,
  opamp: null,
  secureapp: null,
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
    running.profilingController ||
    running.tracing
  ) {
    throw new Error('Splunk APM already started');
  }

  const configFilePath = getEnvValueByPrecedence([
    'OTEL_CONFIG_FILE',
    'OTEL_EXPERIMENTAL_CONFIG_FILE',
  ]);
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
    secureappOptions,
  } = parseOptionsAndConfigureInstrumentations(options);

  // Remote configuration requires OpAMP (the transport) and its own opt-in
  // flag. When enabled, server-pushed config can start/stop profiling at
  // runtime via the ProfilingController's apply() callback.
  const opampEnabled = Boolean(
    isFeatureEnabled(options.opamp, 'SPLUNK_OPAMP_ENABLED', false)
  );
  const remoteConfigEnabled =
    opampEnabled && getConfigBoolean('SPLUNK_OPAMP_REMOTE_CONFIG', false);

  const profilerEnabled = Boolean(
    isFeatureEnabled(options.profiling, 'SPLUNK_PROFILER_ENABLED', false)
  );

  // The ProfilingController always owns the always-on profiler lifecycle.
  // startInitial() starts it per the local config (or records the disabled
  // effective state when off), and when remote config is enabled a later
  // server push can stop/restart it through apply(). Without remote config the
  // controller simply never receives an apply() — same start path, one teardown.
  const controller = new ProfilingController(profilingOptions);
  controller.startInitial(profilerEnabled);
  running.profilingController = controller;

  // The memory profiler reports through the metrics pipeline, whose
  // MeterProvider is built once here at startup. When remote config is enabled
  // it can turn the memory profiler on at any time, so default the pipeline on
  // now — otherwise a later remote enable would have nowhere to report. When
  // remote config is off, only default it on when the memory profiler actually
  // started. An explicit SPLUNK_METRICS_ENABLED still wins over this default.
  const metricsEnabledByDefault =
    remoteConfigEnabled ||
    (profilerEnabled && profilingOptions.memoryProfilingEnabled);

  if (isSnapshotProfilingEnabled()) {
    startSnapshotProfiling({
      endpoint: profilingOptions.endpoint,
      serviceName: profilingOptions.serviceName,
      resource: profilingOptions.resource,
    });
  } else if (remoteConfigEnabled) {
    // Pre-register an inactive snapshot profiler so callgraphs can be toggled
    // on at runtime — tracer-provider span processors are immutable once built,
    // so the processor must be registered before tracing starts.
    //
    // This also installs the profiling context manager (the SnapshotProfiler
    // constructor calls ensureProfilingContextManager) before startTracing runs
    // below. That is what lets a *later* remote-config CPU enable produce
    // trace-correlated profiles: by the time tracing claims the global context
    // manager it sees the profiling one already set and defers, so the runtime
    // startProfiling never hits the "tracing owns the context manager" path.
    startSnapshotProfiling({
      endpoint: profilingOptions.endpoint,
      serviceName: profilingOptions.serviceName,
      resource: profilingOptions.resource,
      active: false,
    });
  } else {
    recordEffectiveState({ snapshotProfilerEnabled: false });
  }

  // isFeatureEnabled returns the option object itself when a signal is
  // configured via an options object, so coerce to a plain boolean.
  const tracingEnabled = Boolean(
    isFeatureEnabled(options.tracing, 'SPLUNK_TRACING_ENABLED', true)
  );
  recordEffectiveState({ tracingEnabled });
  if (tracingEnabled) {
    running.tracing = startTracing(tracingOptions);
  }

  const secureappEnabled = isFeatureEnabled(
    options.secureapp,
    'SPLUNK_SECUREAPP_AGENT_ENABLED',
    false
  );

  const loggingEnabled = Boolean(
    isFeatureEnabled(
      options.logging,
      'SPLUNK_AUTOMATIC_LOG_COLLECTION',
      false
    ) || secureappEnabled
  );
  recordEffectiveState({ loggingEnabled });
  if (loggingEnabled) {
    running.logging = startLogging(loggingOptions);
  }

  if (secureappEnabled) {
    running.secureapp = startSecureapp(secureappOptions) ?? null;
  }

  const metricsEnabled = Boolean(
    isFeatureEnabled(
      options.metrics,
      'SPLUNK_METRICS_ENABLED',
      metricsEnabledByDefault
    )
  );
  recordEffectiveState({ metricsEnabled });
  if (metricsEnabled) {
    running.metrics = startMetrics(metricsOptions);
  } else if (remoteConfigEnabled) {
    // The memory profiler reports through the metrics pipeline. With metrics
    // explicitly off, a later remote enable of memory_profiler would report
    // APPLIED yet emit nothing, since there is no MeterProvider to report
    // through. Warn so the silent no-op is diagnosable.
    diag.warn(
      'Remote configuration is enabled but metrics are disabled; ' +
        'a remotely-enabled memory profiler will not emit any data. ' +
        'Enable metrics (SPLUNK_METRICS_ENABLED=true) to allow it to report.'
    );
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

  // Start OpAMP last so that, by the time it builds its first effective-config
  // report, every component has recorded the configuration it actually started
  // with (endpoints, profiler state, etc.) into the effective-state holder.
  if (opampEnabled) {
    if (remoteConfigEnabled) {
      opampOptions.applyRemoteConfig = (cfg) =>
        controller.applyRemoteConfiguration(cfg);
    }
    running.opamp = startOpAMP(opampOptions);
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

  // The snapshot profiler is owned by a module-level singleton, not `running`.
  // It may have been registered for snapshot profiling or pre-registered
  // (inactive) for remote config; stopping is a no-op when neither applies.
  // Detaches its exit listener and clears its collection loop so start()/stop()
  // cycles do not leak.
  promises.push(stopSnapshotProfiling());

  if (running.profilingController) {
    promises.push(running.profilingController.stopAll());
    running.profilingController = null;
  }

  if (running.secureapp) {
    running.secureapp.stop();
    running.secureapp = null;
  }

  // Clear recorded effective state so a subsequent start() does not report
  // stale endpoints/feature state from this run.
  resetEffectiveState();

  return Promise.all(promises);
};
