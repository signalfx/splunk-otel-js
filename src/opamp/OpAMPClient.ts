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
import Long from 'long';
import { parse as parseYaml } from 'yaml';
import { diag } from '@opentelemetry/api';
import { opamp } from './proto/opamp';
import type {
  EffectiveConfig,
  OpAMPOptions,
  RemoteProfilingConfig,
} from './types';
import type { Transport } from './HttpTransport';
import { HttpTransport } from './HttpTransport';
import { ExponentialBackoff } from './backoff';
import { Resource } from '@opentelemetry/resources';
import { uuid7 } from './uuid';

const { AgentToServer, ServerToAgent } = opamp.proto;
const ServerToAgentFlags = opamp.proto.ServerToAgentFlags;
const { RemoteConfigStatuses } = opamp.proto;

// The AgentConfigMap key carrying Splunk remote configuration, per the GDI
// datamodel specification.
const REMOTE_CONFIG_KEY = 'splunk.remote.config';

function nowNano(): Long {
  return Long.fromNumber(Date.now()).multiply(1_000_000);
}

const { AgentCapabilities } = opamp.proto;

const DEFAULT_CAPABILITIES =
  AgentCapabilities.AgentCapabilities_ReportsStatus |
  AgentCapabilities.AgentCapabilities_ReportsHealth |
  AgentCapabilities.AgentCapabilities_ReportsEffectiveConfig |
  AgentCapabilities.AgentCapabilities_ReportsHeartbeat;

// Advertised only when remote config is opted in (an applyRemoteConfig callback
// is supplied). Accepting + reporting remote config per the OpAMP spec.
const REMOTE_CONFIG_CAPABILITIES =
  AgentCapabilities.AgentCapabilities_AcceptsRemoteConfig |
  AgentCapabilities.AgentCapabilities_ReportsRemoteConfig;

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

function contentType(type: 'yaml' | 'env'): string {
  // Content types are mandated by the GDI specification's effective
  // configuration section (specification/opamp_datamodel.md).
  if (type === 'yaml') {
    return 'application/yaml; vendor=splunk; v=1.0.0';
  }

  return 'text/plain; format=properties; vendor=splunk; v=1.0.0';
}

async function getResourceAttributes(
  resource: Resource
): Promise<opamp.proto.IKeyValue[]> {
  await resource.waitForAsyncAttributes?.();

  const attributes: opamp.proto.IKeyValue[] = [];

  for (const key in resource.attributes) {
    const kv = { key, value: toAnyValue(resource.attributes[key]) };
    attributes.push(kv);
  }

  return attributes;
}

export class OpAMPClient {
  private _instanceUid: Uint8Array;
  private _sequenceNum: number = 0;
  private readonly _options: OpAMPOptions;
  private readonly _transport: Transport;
  private readonly _backoff: ExponentialBackoff;
  private readonly _capabilities: number;

  private _pollingTimer: NodeJS.Timeout | null = null;
  private _stopping: boolean = false;
  // True while _poll() is executing. A _triggerPoll() that lands during a poll
  // (e.g. the synchronous APPLYING status set from _handleRemoteConfig) sets
  // _pollAgainImmediately instead of scheduling its own timer, so it cannot race
  // _poll's trailing _scheduleNextPoll and orphan a 0ms timer.
  private _polling: boolean = false;
  private _pollAgainImmediately: boolean = false;

  private _lastSentEffectiveConfig: EffectiveConfig | null = null;
  private _pendingEffectiveConfig: EffectiveConfig | null = null;
  private _currentHealth: opamp.proto.IComponentHealth;
  private _agentDescription: opamp.proto.IAgentDescription | null = null;

  // Hash of the last remote config we finished applying successfully. Used to
  // dedup repeated server pushes of an unchanged config. Kept in memory only —
  // the GDI spec forbids persisting remote configuration — so it resets on
  // restart and the server re-sends.
  private _lastRemoteConfigHash: Uint8Array | null = null;
  // Content of the last hashless config we applied successfully. A conformant
  // server always sends a configHash; when one is omitted we fall back to
  // deduping by the config body itself, so an unchanged re-send is ignored
  // (no busy-polling) while a genuinely different config still applies. Kept in
  // memory only — same as _lastRemoteConfigHash — so it resets on restart.
  // null means no hashless config has been applied since the last hashed one.
  private _lastHashlessConfig: string | null = null;
  // True while an apply is in flight. Guards against the apply's trailing
  // immediate poll re-delivering the same config and applying it twice before
  // _lastRemoteConfigHash is recorded.
  private _applyInFlight: boolean = false;
  private _remoteConfigStatus: opamp.proto.IRemoteConfigStatus | null = null;

  constructor(options: OpAMPOptions, transport?: Transport) {
    this._options = options;
    this._instanceUid = uuid7();
    this._transport =
      transport ?? new HttpTransport(options.endpoint, options.accessToken);
    this._backoff = new ExponentialBackoff({ baseMs: 1000, maxMs: 60_000 });
    this._capabilities =
      DEFAULT_CAPABILITIES |
      (options.applyRemoteConfig ? REMOTE_CONFIG_CAPABILITIES : 0);

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
    this._stopping = false;
    this._sequenceNum = 0;

    this._currentHealth = {
      ...this._currentHealth,
      healthy: true,
      status: 'StatusOK',
      statusTimeUnixNano: nowNano(),
    };

    this._agentDescription = {
      identifyingAttributes: await getResourceAttributes(
        this._options.resource
      ),
    };

    await this._poll();
  }

  async stop(): Promise<void> {
    this._stopping = true;

    if (this._pollingTimer) {
      clearTimeout(this._pollingTimer);
      this._pollingTimer = null;
    }
    this._pollAgainImmediately = false;

    await this._sendDisconnect();
    logger.debug('OpAMP client stopped');
  }

  buildAgentToServerMessage(): opamp.proto.IAgentToServer {
    const msg: opamp.proto.IAgentToServer = {
      instanceUid: this._instanceUid,
      sequenceNum: this._sequenceNum++,
      capabilities: this._capabilities,
      health: this._currentHealth,
      agentDescription: this._agentDescription,
    };

    // Always attach the current remote-config status when set: it is small and
    // idempotent, and re-sending it survives 409 / ReportFullState resets.
    if (this._remoteConfigStatus) {
      msg.remoteConfigStatus = this._remoteConfigStatus;
    }

    const effectiveConfig = this._options.getEffectiveConfig();
    if (!isDeepStrictEqual(effectiveConfig, this._lastSentEffectiveConfig)) {
      this._pendingEffectiveConfig = effectiveConfig;
      msg.effectiveConfig = {
        configMap: {
          configMap: {
            [effectiveConfig.name]: {
              contentType: contentType(effectiveConfig.type),
              body: new TextEncoder().encode(effectiveConfig.content),
            },
          },
        },
      };
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

    // Only act on remote config when opted in (capability advertised). Without
    // an applyRemoteConfig callback the field is ignored entirely.
    if (this._options.applyRemoteConfig && response.remoteConfig) {
      void this._handleRemoteConfig(response.remoteConfig);
    }
  }

  private async _handleRemoteConfig(
    remoteConfig: opamp.proto.IAgentRemoteConfig
  ): Promise<void> {
    const applyRemoteConfig = this._options.applyRemoteConfig;
    if (!applyRemoteConfig) {
      return;
    }

    // Bail if shutdown has begun. A poll can resolve concurrently with stop():
    // applyRemoteConfig() chains a profiler start onto the controller's queue,
    // but stop() has already enqueued stopAll() and nulled the controller, so
    // nothing would tear that profiler down again — it would leak past stop().
    if (this._stopping) {
      return;
    }

    // Convert the hash inside the guarded section: it is attacker/serer-supplied
    // bytes, and `new Uint8Array(...)` on a malformed value can throw. Since the
    // caller invokes this via `void`, an escaping throw would become an
    // unhandled rejection with no status reported — so treat it as a parse-level
    // failure (FAILED) instead.
    let configHash: Uint8Array | null;
    try {
      configHash = remoteConfig.configHash
        ? new Uint8Array(remoteConfig.configHash)
        : null;
    } catch (err) {
      this._reportRemoteConfigFailure(
        null,
        'Failed to read remote config hash',
        err
      );
      this._triggerPoll();
      return;
    }

    // Dedup: ignore a config we have already applied. A failed apply advances
    // neither dedup key, so the server's re-send still retries.
    const hashlessBody = configHash
      ? null
      : this._remoteConfigBody(remoteConfig);
    if (configHash) {
      if (isDeepStrictEqual(configHash, this._lastRemoteConfigHash)) {
        return;
      }
    } else if (hashlessBody === this._lastHashlessConfig) {
      // A conformant server always sends a configHash; without one we dedup by
      // the config body so an unchanged re-send is ignored (no busy-polling)
      // while a genuinely different config still applies.
      return;
    }

    // Guard against the trailing immediate poll (see _triggerPoll) re-delivering
    // the same config and starting a second apply before the hash is recorded.
    if (this._applyInFlight) {
      return;
    }
    this._applyInFlight = true;

    try {
      // Report APPLYING and push it out promptly so the server sees progress
      // before the apply completes.
      this._setRemoteConfigStatus(
        RemoteConfigStatuses.RemoteConfigStatuses_APPLYING,
        configHash
      );
      this._triggerPoll();

      let parsed: RemoteProfilingConfig;
      try {
        parsed = this._parseRemoteConfig(remoteConfig);
      } catch (err) {
        this._reportRemoteConfigFailure(
          configHash,
          'Failed to parse remote config',
          err
        );
        this._triggerPoll();
        return;
      }

      try {
        await applyRemoteConfig(parsed);
        this._lastRemoteConfigHash = configHash;
        // Track the hashless body only when there is no hash; a hashed config
        // clears it so a later hashless re-send is not wrongly deduped.
        this._lastHashlessConfig = configHash ? null : hashlessBody;
        this._setRemoteConfigStatus(
          RemoteConfigStatuses.RemoteConfigStatuses_APPLIED,
          configHash
        );
      } catch (err) {
        // Leave _lastRemoteConfigHash unchanged so a re-send retries the apply.
        this._reportRemoteConfigFailure(
          configHash,
          'Failed to apply remote config',
          err
        );
      }

      this._triggerPoll();
    } finally {
      this._applyInFlight = false;
    }
  }

  // Decodes the `splunk.remote.config` body to a string for content-based
  // dedup of hashless configs. An absent file decodes to '' so a repeated
  // "no config" push is still deduped against the same empty body.
  private _remoteConfigBody(
    remoteConfig: opamp.proto.IAgentRemoteConfig
  ): string {
    const file = remoteConfig.config?.configMap?.[REMOTE_CONFIG_KEY];
    if (!file?.body) {
      return '';
    }
    return new TextDecoder().decode(file.body);
  }

  // Parses the `splunk.remote.config` document into a normalized
  // RemoteProfilingConfig. Throws on an unexpected content type or unparseable
  // body. A missing config file (or missing profiling block) is valid and means
  // "everything off". Unknown keys are ignored per the spec.
  private _parseRemoteConfig(
    remoteConfig: opamp.proto.IAgentRemoteConfig
  ): RemoteProfilingConfig {
    const allOff: RemoteProfilingConfig = {
      cpuProfiler: { enabled: false },
      memoryProfiler: { enabled: false },
      callgraphs: { enabled: false },
    };

    const file = remoteConfig.config?.configMap?.[REMOTE_CONFIG_KEY];
    if (!file) {
      return allOff;
    }

    const contentType = file.contentType ?? '';
    // Relaxed about parameters (e.g. `; vendor=splunk`): only the base type
    // matters.
    if (
      contentType &&
      !contentType.split(';')[0].trim().startsWith('application/yaml')
    ) {
      throw new Error(`Unsupported remote config content type: ${contentType}`);
    }

    const body = file.body ? new TextDecoder().decode(file.body) : '';
    if (body.trim() === '') {
      return allOff;
    }

    // parseYaml throws on malformed YAML — propagated as a parse failure.
    const parsed = parseYaml(body);
    const profiling = parsed?.distribution?.splunk?.profiling;
    if (!profiling || typeof profiling !== 'object') {
      return allOff;
    }

    // Presence of a key — even a bare `cpu_profiler:` that YAML parses to null —
    // means the feature is on; an absent (undefined) key means off.
    const alwaysOn = profiling.always_on;
    const cpuProfiler = alwaysOn?.cpu_profiler;

    return {
      cpuProfiler: {
        // cpuProfiler !== undefined already implies always_on is a non-null
        // object, so no separate alwaysOn guard is needed.
        enabled: cpuProfiler !== undefined,
        samplingInterval:
          typeof cpuProfiler?.sampling_interval === 'number'
            ? cpuProfiler.sampling_interval
            : undefined,
      },
      memoryProfiler: {
        enabled: alwaysOn?.memory_profiler !== undefined,
      },
      callgraphs: {
        enabled: profiling.callgraphs !== undefined,
      },
    };
  }

  // Logs and records a FAILED remote-config status, normalizing the error to a
  // message string. Callers still drive the trailing _triggerPoll themselves.
  private _reportRemoteConfigFailure(
    configHash: Uint8Array | null,
    logMessage: string,
    err: unknown
  ): void {
    logger.warn(logMessage, err);
    this._setRemoteConfigStatus(
      RemoteConfigStatuses.RemoteConfigStatuses_FAILED,
      configHash,
      err instanceof Error ? err.message : String(err)
    );
  }

  private _setRemoteConfigStatus(
    status: opamp.proto.RemoteConfigStatuses,
    lastRemoteConfigHash: Uint8Array | null,
    errorMessage?: string
  ): void {
    this._remoteConfigStatus = {
      lastRemoteConfigHash: lastRemoteConfigHash ?? new Uint8Array(),
      status,
      errorMessage: errorMessage ?? '',
    };
  }

  private async _poll(): Promise<void> {
    if (this._stopping) return;

    this._polling = true;
    this._pollAgainImmediately = false;

    this._currentHealth = {
      ...this._currentHealth,
      statusTimeUnixNano: nowNano(),
    };

    try {
      const msg = this.buildAgentToServerMessage();
      const encoded = AgentToServer.encode(AgentToServer.create(msg)).finish();
      const transportResponse = await this._transport.send(encoded);

      if (transportResponse.statusCode === 200) {
        if (this._pendingEffectiveConfig) {
          this._lastSentEffectiveConfig = this._pendingEffectiveConfig;
          this._pendingEffectiveConfig = null;
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
    } finally {
      this._polling = false;
    }

    // If a _triggerPoll arrived mid-poll, honor it now instead of having let it
    // schedule a competing timer that this trailing schedule would orphan.
    this._scheduleNextPoll(this._pollAgainImmediately ? 0 : undefined);
  }

  private _scheduleNextPoll(delayMs?: number): void {
    if (this._stopping) return;
    if (this._pollingTimer) {
      clearTimeout(this._pollingTimer);
      this._pollingTimer = null;
    }
    const delay =
      delayMs ?? this._backoff.nextDelay(this._options.pollingIntervalMs);
    this._pollingTimer = setTimeout(() => this._poll(), delay);
    this._pollingTimer.unref();
  }

  // Cancels the pending scheduled poll and reschedules one to fire ~immediately,
  // so a remote-config status change (APPLYING / APPLIED / FAILED) and the
  // updated effective config reach the server without waiting a full polling
  // interval. If a poll is currently running, defer to it: it will reschedule
  // immediately once it finishes (avoids racing its trailing _scheduleNextPoll).
  private _triggerPoll(): void {
    if (this._stopping) return;
    if (this._polling) {
      this._pollAgainImmediately = true;
      return;
    }
    this._scheduleNextPoll(0);
  }

  private async _sendDisconnect(): Promise<void> {
    try {
      const msg: opamp.proto.IAgentToServer = {
        instanceUid: this._instanceUid,
        sequenceNum: this._sequenceNum++,
        capabilities: this._capabilities,
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
    this._pendingEffectiveConfig = null;
  }
}
