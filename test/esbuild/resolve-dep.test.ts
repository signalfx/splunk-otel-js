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
import { describe, it } from 'node:test';
import { strict as assert } from 'assert';
import * as path from 'node:path';

import { resolveInstrumentationDepsPlugin } from '../../src/esbuild-plugin/plugin';
import { SDK_ROOT } from '../../src/esbuild-plugin/constants';
import type { PluginBuild } from 'esbuild';
describe('resolveInstrumentationDepsPlugin', () => {
  it('rewrites module paths so they start inside SDK_ROOT', () => {
    // The plugin will call build.onResolve and pass in this callback
    let resolver: (a: { path: string }) => { path: string };

    // default resolver behavior
    resolver = ({ path: id }) => {
      try {
        // We add a non-existent directory to the paths to ensure that
        // the resolver will not find the proper modules
        return {
          path: require.resolve(id, {
            paths: [path.join('/ definitely / not / exist / anywhere')],
          }),
        };
      } catch {
        return { path: '' };
      }
    };

    const fakeBuild = {
      onResolve(_: { filter: RegExp }, cb: typeof resolver) {
        resolver = cb;
      },
    } as PluginBuild;

    resolveInstrumentationDepsPlugin().setup(fakeBuild);

    const semver = resolver({ path: 'semver' });
    const otelHttp = resolver({
      path: '@opentelemetry/instrumentation-http',
    });

    assert.ok(otelHttp.path.startsWith(SDK_ROOT), 'otel-http outside SDK_ROOT');
    assert.ok(semver.path.startsWith(SDK_ROOT), 'semver outside SDK_ROOT');
  });
});
