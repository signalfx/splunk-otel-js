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
import { Resource, resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { defaultServiceName } from '../utils';
import { getNonEmptyConfigVar, getConfigNumber } from '../configuration';
import { getDetectedResource } from '../resource';
import { OpAMPClient } from './OpAMPClient';
import { opampGetEffectiveConfig } from './EffectiveConfig';
import type { OpAMPOptions, StartOpAMPOptions, OpAMPHandle } from './types';

export type { OpAMPOptions, StartOpAMPOptions, OpAMPHandle };

export function _setDefaultOptions(
  options: StartOpAMPOptions = {}
): OpAMPOptions {
  const envResource = getDetectedResource();

  const serviceName = String(
    options.serviceName ||
      getNonEmptyConfigVar('OTEL_SERVICE_NAME') ||
      envResource.attributes?.[ATTR_SERVICE_NAME] ||
      defaultServiceName()
  );

  const resourceFactory =
    options.resourceFactory || ((resource: Resource) => resource);

  const resource = resourceFactory(
    resourceFromAttributes(envResource.attributes || {})
  ).merge(
    resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    })
  );

  const endpoint =
    options.endpoint ||
    getNonEmptyConfigVar('SPLUNK_OPAMP_ENDPOINT') ||
    'http://localhost:4320/v1/opamp';

  const pollingIntervalMs =
    options.pollingIntervalMs ||
    getConfigNumber('SPLUNK_OPAMP_POLLING_INTERVAL', 30_000);

  return {
    endpoint,
    serviceName,
    resource,
    pollingIntervalMs,
    getEffectiveConfig: opampGetEffectiveConfig,
    accessToken:
      options.accessToken || getNonEmptyConfigVar('SPLUNK_ACCESS_TOKEN'),
  };
}

export function startOpAMP(options: OpAMPOptions): OpAMPHandle {
  const client = new OpAMPClient(options);

  client.start().catch((err) => {
    diag.error('opamp: Failed to start OpAMP client', err);
  });

  return {
    stop: () => client.stop(),
  };
}
