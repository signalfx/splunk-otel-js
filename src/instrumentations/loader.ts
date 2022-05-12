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

import { diag } from '@opentelemetry/api';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { createRequire } from 'module';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InstrumentationConstructor = { new (config?: any): Instrumentation };

const linkSafeRequire = createRequire(require?.main?.filename || __filename);

export function load(
  module: string,
  instrumentation: string
): InstrumentationConstructor | null {
  try {
    const loadedModule = linkSafeRequire(module);

    if (loadedModule[instrumentation]) {
      return loadedModule[instrumentation]
    }
  } catch {
    // Ignoring errors and attempting the common case
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(module)[instrumentation];
  } catch (e: any) {
    if (e.code === 'MODULE_NOT_FOUND') {
      diag.debug('cannot find instrumentation package:', module);
    } else {
      diag.debug('Errored loading instrumentation:', e.message, e.code);
    }
  }
  return null;
}
