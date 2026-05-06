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
  SecureAppInstrumentation,
  SecureAppInstrumentationConfig,
} from '@splunk/secureapp-agent';
import { getConfigBoolean, getConfigNumber } from '../configuration';
import type { SecureappOptions } from './types';

export type { SecureappOptions } from './types';

export function startSecureapp(options: SecureappOptions): void {
  const Instrumentation = options.instrumentation || SecureAppInstrumentation;
  if (!Instrumentation) {
    return;
  }

  const config: SecureAppInstrumentationConfig = {
    dependencyScanInterval:
      options.dependencyScanInterval ??
      getConfigNumber('SPLUNK_SECUREAPP_DEPENDENCY_SCAN_INTERVAL', 86400000),
    initialDelaySeconds:
      options.initialDelaySeconds ??
      getConfigNumber('SPLUNK_SECUREAPP_DEPENDENCY_INITIAL_DELAY', 60),
    runtimePackagesOnly:
      options.runtimePackagesOnly ??
      getConfigBoolean('SPLUNK_SECUREAPP_RUNTIME_PACKAGES_ONLY', true),
    noSelfReport:
      options.noSelfReport ??
      getConfigBoolean('SPLUNK_SECUREAPP_NO_SELF_REPORT', false),
  };

  new Instrumentation(config);
  // The instrumentation picks up the global LoggerProvider from logsAPI.logs automatically
}
