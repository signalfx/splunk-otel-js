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
  openTelemetryPlugin,
  OpenTelemetryPluginParams,
} from 'opentelemetry-esbuild-plugin-node';
import {
  nativeExtSupportPlugin,
  esmRequireShimPlugin,
  resolveInstrumentationDepsPlugin,
  loadEsmHelpersPlugin,
} from './plugin.js';
import type { Plugin } from 'esbuild';

export function splunkOtelEsbuild(opts: OpenTelemetryPluginParams): Plugin {
  return {
    name: 'splunk-otel-esbuild',
    async setup(build) {
      const helpers = loadEsmHelpersPlugin();

      const otel = openTelemetryPlugin(opts);
      const native = nativeExtSupportPlugin();
      const requireShim = esmRequireShimPlugin();
      const instrDeps = resolveInstrumentationDepsPlugin();

      await helpers.setup(build);
      void instrDeps.setup(build);
      void otel.setup(build);
      void native.setup(build);
      void requireShim.setup(build);
    },
  };
}

export {
  nativeExtSupportPlugin,
  esmRequireShimPlugin,
  resolveInstrumentationDepsPlugin,
};
