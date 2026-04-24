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

import type {
  InstrumentationConfig,
  Instrumentation,
} from '@opentelemetry/instrumentation';

export interface SecureAppInstrumentationConfig extends InstrumentationConfig {
  dependencyScanInterval?: number;
  initialDelaySeconds?: number;
}

type InstrumentationClass = new (
  config?: SecureAppInstrumentationConfig
) => Instrumentation;

export interface SecureappOptions extends SecureAppInstrumentationConfig {
  instrumentation?: InstrumentationClass;
}

export type StartSecureappOptions = SecureappOptions;
