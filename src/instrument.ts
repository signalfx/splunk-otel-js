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

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import {
  defaultServiceName,
  getEnvArray,
  getEnvBoolean,
  getNonEmptyEnvVar,
  parseLogLevel,
} from './utils';

import { startMetrics } from './metrics';
import { startProfiling } from './profiling';
import { startTracing } from './tracing';
import { startLogging } from './logging';
import { parseOptionsAndConfigureInstrumentations } from './instrumentations';

function boot() {
  const logLevel = parseLogLevel(getNonEmptyEnvVar('OTEL_LOG_LEVEL'));

  if (logLevel !== DiagLogLevel.NONE) {
    diag.setLogger(new DiagConsoleLogger(), logLevel);
  }

  if (getNonEmptyEnvVar('SPLUNK_AUTOINSTRUMENT_PACKAGE_NAMES') !== undefined) {
    const limitToPackages = getEnvArray(
      'SPLUNK_AUTOINSTRUMENT_PACKAGE_NAMES',
      []
    );

    if (!limitToPackages.includes(defaultServiceName())) {
      return;
    }
  }

  const { tracingOptions, loggingOptions, profilingOptions, metricsOptions } =
    parseOptionsAndConfigureInstrumentations();

  if (getEnvBoolean('SPLUNK_PROFILER_ENABLED', false)) {
    startProfiling(profilingOptions);
  }

  startTracing(tracingOptions);

  if (getEnvBoolean('SPLUNK_AUTOMATIC_LOG_COLLECTION', false)) {
    startLogging(loggingOptions);
  }

  if (
    getEnvBoolean('SPLUNK_METRICS_ENABLED', false) ||
    getEnvBoolean('SPLUNK_PROFILER_MEMORY_ENABLED', false)
  ) {
    startMetrics(metricsOptions);
  }
}

boot();
