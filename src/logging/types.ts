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
import type { LogRecordProcessor } from '@opentelemetry/sdk-logs';
import type { Resource } from '@opentelemetry/resources';
import type { ResourceFactory } from '../types';

export type LogRecordProcessorFactory = (
  options: LoggingOptions
) => LogRecordProcessor | LogRecordProcessor[];

export interface LoggingOptions {
  accessToken?: string;
  realm?: string;
  serviceName: string;
  endpoint?: string;
  resource: Resource;
  logRecordProcessorFactory: LogRecordProcessorFactory;
}

export type StartLoggingOptions = Partial<Omit<LoggingOptions, 'resource'>> & {
  resourceFactory?: ResourceFactory;
};
