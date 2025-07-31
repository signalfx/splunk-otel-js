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

import { deprecate } from 'util';

import {
  startTracing as _startTracing,
  stopTracing as _stopTracing,
} from './tracing';
import { startMetrics as _startMetrics } from './metrics';
export {
  ConsoleMetricExporter,
  ConsoleMetricExporterOptions,
} from './metrics/ConsoleMetricExporter';
import { startProfiling as _startProfiling } from './profiling';
export { start, stop } from './start';
export { listEnvVars } from './utils';
export { splunkOtelEsbuild } from './esbuild-plugin';
/**
 * @deprecated Use generic start() function instead
 */
export const startMetrics = deprecate(
  _startMetrics,
  'startMetrics is deprecated. Use generic start() and stop() functions instead'
);

/**
 * @deprecated Use generic start() function instead
 */
export const startProfiling = deprecate(
  _startProfiling,
  'startProfiling is deprecated. Use generic start() and stop() functions instead'
);

/**
 * @deprecated Use generic start() function instead
 */
export const startTracing = deprecate(
  _startTracing,
  'startTracing is deprecated. Use generic start() and stop() functions instead'
);
/**
 * @deprecated Use generic stop() function instead
 */
export const stopTracing = deprecate(
  _stopTracing,
  'stopTracing is deprecated. Use generic start() and stop() functions instead'
);
