/*
 * Copyright 2021 Splunk Inc.
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
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/tracing';
import { env } from 'process';

const defaultEndpoint = 'http://localhost:9080/v1/trace';
const defaultServiceName = 'unnamed-node-service';
const defaultMaxAttrLength = 1200;

export interface Options {
  endpoint: string;
  serviceName: string;
  accessToken?: string;
  maxAttrLength: number;
  spanProcessor: typeof SimpleSpanProcessor | typeof BatchSpanProcessor;
}

export function _setDefaultOptions(options: Partial<Options> = {}): Options {
  if (!options.maxAttrLength) {
    const maxAttrLength = parseInt(process.env.SPLK_MAX_ATTR_LENGTH || '');
    if (!isNaN(maxAttrLength)) {
      options.maxAttrLength = maxAttrLength;
    } else {
      options.maxAttrLength = defaultMaxAttrLength;
    }
  }

  options.serviceName =
    options.serviceName || env.SPLK_SERVICE_NAME || defaultServiceName;
  options.endpoint =
    options.endpoint || env.SPLK_TRACE_EXPORTER_URL || defaultEndpoint;

  options.spanProcessor = options.spanProcessor || BatchSpanProcessor;
  return {
    endpoint: options.endpoint,
    serviceName: options.serviceName,
    accessToken: options.accessToken,
    maxAttrLength: options.maxAttrLength,
    spanProcessor: options.spanProcessor,
  };
}
