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

import { isDeepStrictEqual } from 'node:util';
import Long = require('long');
import { v7 as uuidv7 } from 'uuid';
import { diag } from '@opentelemetry/api';
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
} from '@opentelemetry/semantic-conventions';
import { opamp } from './proto/opamp';
import type { OpAMPOptions } from './types';
import type { Transport } from './HttpTransport';
import { HttpTransport } from './HttpTransport';
import { ExponentialBackoff } from './backoff';
import { Resource } from '@opentelemetry/resources';

const { AgentToServer, ServerToAgent } = opamp.proto;
const ServerToAgentFlags = opamp.proto.ServerToAgentFlags;

function nowNano(): Long {
  return Long.fromNumber(Date.now()).multiply(1_000_000);
}

function newInstanceUid(): Uint8Array {
  return uuidv7(undefined, new Uint8Array(16));
}

const { AgentCapabilities } = opamp.proto;

const DEFAULT_CAPABILITIES =
  AgentCapabilities.AgentCapabilities_ReportsStatus |
  AgentCapabilities.AgentCapabilities_ReportsHealth |
  AgentCapabilities.AgentCapabilities_ReportsEffectiveConfig |
  AgentCapabilities.AgentCapabilities_ReportsHeartbeat;

const kIdentifyingKeys: Set<string> = new Set([
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
  ATTR_TELEMETRY_SDK_LANGUAGE,
  ATTR_TELEMETRY_SDK_NAME,
  ATTR_TELEMETRY_SDK_VERSION,
  'deployment.environment',
  'deployment.environment.name',
  'telemetry.distro.name',
  'telemetry.distro.version',
]);

const logger = diag.createComponentLogger({ namespace: 'splunk.opamp' });

function toAnyValue(value: unknown): opamp.proto.IAnyValue {
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { boolValue: value };
  }
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? { intValue: value }
      : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toAnyValue) } };
  }
  return { stringValue: String(value) };
}

async function partitionResourceAttributes(
  resource: Resource,
  identifyingKeys: Set<string>
): Promise<[opamp.proto.IKeyValue[], opamp.proto.IKeyValue[]]> {
  await resource.waitForAsyncAttributes?.();

  const identifying: opamp.proto.IKeyValue[] = [];
  const nonIdentifying: opamp.proto.IKeyValue[] = [];

  for (const key in resource.attributes) {
    const kv = { key, value: toAnyValue(resource.attributes[key]) };
    if (identifyingKeys.has(key)) {
      identifying.push(kv);
    } else {
      nonIdentifying.push(kv);
    }
  }

  return [identifying, nonIdentifying];
}

export class OpAMPClient {
  private _instanceUid: Uint8Array;
  private _sequenceNum: number = 0;
  private readonly _options: OpAMPOptions;
  private readonly _transport: Transport;
  private readonly _backoff: ExponentialBackoff;

  private _pollingTimer: NodeJS.Timeout | null = null;
  private _stopping: boolean = false;

  private _lastSentEffectiveConfig: opamp.proto.IEffectiveConfig | null = null;

  private _currentHealth: opamp.proto.IComponentHealth;
  private _agentDescription: opamp.proto.IAgentDescription | null = null;

  constructor(options: OpAMPOptions, transport?: Transport) {
    this._options = options;
    this._instanceUid = newInstanceUid();
    this._transport =
      transport ?? new HttpTransport(options.endpoint, options.accessToken);
    this._backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });

    const now = nowNano();
    this._currentHealth = {
      healthy: true,
      startTimeUnixNano: now,
      status: 'StatusStarting',
      statusTimeUnixNano: now,
    };
  }

  async start(): Promise<void> {
    logger.debug('starting OpAMP client');
    const [identifyingAttributes, nonIdentifyingAttributes] =
      await partitionResourceAttributes(
        this._options.resource,
        kIdentifyingKeys
      );
    this._stopping = false;
    this._sequenceNum = 0;

    this._currentHealth = {
      ...this._currentHealth,
      healthy: true,
      status: 'StatusOK',
      statusTimeUnixNano: nowNano(),
    };

    this._agentDescription = {
      identifyingAttributes,
      nonIdentifyingAttributes,
    };

    await this._poll();
  }

  async stop(): Promise<void> {
    this._stopping = true;

    if (this._pollingTimer) {
      clearTimeout(this._pollingTimer);
      this._pollingTimer = null;
    }

    await this._sendDisconnect();
    logger.debug('OpAMP client stopped');
  }

  buildAgentToServerMessage(): opamp.proto.IAgentToServer {
    const msg: opamp.proto.IAgentToServer = {
      instanceUid: this._instanceUid,
      sequenceNum: this._sequenceNum++,
      capabilities: DEFAULT_CAPABILITIES,
      health: this._currentHealth,
      agentDescription: this._agentDescription,
    };

    if (this._options.getEffectiveConfig) {
      const effectiveConfig = this._options.getEffectiveConfig();
      if (!isDeepStrictEqual(effectiveConfig, this._lastSentEffectiveConfig)) {
        msg.effectiveConfig = effectiveConfig;
      }
    }

    return msg;
  }

  processServerResponse(response: opamp.proto.IServerToAgent): void {
    if (response.errorResponse) {
      const err = response.errorResponse;
      logger.warn(
        `Server error: type=${err.type}, message=${err.errorMessage}`
      );

      if (err.retryInfo?.retryAfterNanoseconds) {
        const retryMs = Number(err.retryInfo.retryAfterNanoseconds) / 1_000_000;
        this._backoff.setMinDelay(retryMs);
      }
      return;
    }

    this._backoff.reset();

    if (response.flags) {
      const flags = Number(response.flags);
      if (flags & ServerToAgentFlags.ServerToAgentFlags_ReportFullState) {
        this._lastSentEffectiveConfig = null;
      }
    }

    if (response.agentIdentification?.newInstanceUid?.length) {
      this._instanceUid = new Uint8Array(
        response.agentIdentification.newInstanceUid
      );
      logger.debug('Server assigned new instanceUid');
    }
  }

  private async _poll(): Promise<void> {
    if (this._stopping) return;

    this._currentHealth = {
      ...this._currentHealth,
      statusTimeUnixNano: nowNano(),
    };

    try {
      const msg = this.buildAgentToServerMessage();
      const encoded = AgentToServer.encode(AgentToServer.create(msg)).finish();
      const transportResponse = await this._transport.send(encoded);

      if (transportResponse.statusCode === 200) {
        if (msg.effectiveConfig) {
          this._lastSentEffectiveConfig = msg.effectiveConfig;
        }

        const serverMsg = ServerToAgent.decode(transportResponse.body);
        this.processServerResponse(serverMsg);
        this._backoff.reset();
      } else if (transportResponse.statusCode === 409) {
        this._resetStates();
      } else {
        logger.warn(`Unexpected HTTP status: ${transportResponse.statusCode}`);
      }
    } catch (error) {
      logger.warn('Communication error', error);
    }

    this._scheduleNextPoll();
  }

  private _scheduleNextPoll(delayMs?: number): void {
    if (this._stopping) return;
    const delay =
      delayMs ?? this._backoff.nextDelay(this._options.pollingIntervalMs);
    this._pollingTimer = setTimeout(() => this._poll(), delay);
    this._pollingTimer.unref();
  }

  private async _sendDisconnect(): Promise<void> {
    try {
      const msg: opamp.proto.IAgentToServer = {
        instanceUid: this._instanceUid,
        sequenceNum: this._sequenceNum++,
        capabilities: DEFAULT_CAPABILITIES,
        agentDisconnect: {},
      };

      const encoded = AgentToServer.encode(AgentToServer.create(msg)).finish();
      await this._transport.send(encoded);
    } catch (error) {
      logger.debug('Failed to send disconnect message', error);
    }
  }

  private _resetStates(): void {
    this._lastSentEffectiveConfig = null;
  }
}
