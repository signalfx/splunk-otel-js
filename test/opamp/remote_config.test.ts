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

import { strict as assert } from 'assert';
import { describe, it } from 'node:test';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { OpAMPClient } from '../../src/opamp/OpAMPClient';
import { opamp } from '../../src/opamp/proto/opamp';
import type {
  EffectiveConfig,
  OpAMPOptions,
  RemoteProfilingConfig,
} from '../../src/opamp/types';
import type {
  Transport,
  TransportResponse,
} from '../../src/opamp/HttpTransport';

const {
  AgentToServer,
  ServerToAgent,
  AgentCapabilities,
  RemoteConfigStatuses,
} = opamp.proto;

const EMPTY_EFFECTIVE_CONFIG: EffectiveConfig = {
  type: 'yaml',
  name: 'yaml',
  content: '',
};

function createOptions(overrides: Partial<OpAMPOptions> = {}): OpAMPOptions {
  return {
    endpoint: 'http://localhost:4320/v1/opamp',
    serviceName: 'test-service',
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: 'test-service',
      'host.name': 'test-host',
    }),
    pollingIntervalMs: 30_000,
    getEffectiveConfig: () => EMPTY_EFFECTIVE_CONFIG,
    ...overrides,
  };
}

// Builds a ServerToAgent carrying a remote config document under the
// `splunk.remote.config` key. Pass `body: undefined` to omit the file entirely.
function remoteConfigResponse(opts: {
  body?: string;
  contentType?: string;
  configHash?: Uint8Array;
  omitFile?: boolean;
  omitHash?: boolean;
}): opamp.proto.IServerToAgent {
  const configMap: { [k: string]: opamp.proto.IAgentConfigFile } = {};
  if (!opts.omitFile) {
    configMap['splunk.remote.config'] = {
      body: new TextEncoder().encode(opts.body ?? ''),
      contentType: opts.contentType ?? 'application/yaml',
    };
  }
  return {
    remoteConfig: {
      config: { configMap },
      configHash: opts.omitHash
        ? undefined
        : (opts.configHash ?? new Uint8Array([1, 2, 3])),
    },
  };
}

// A transport that records sent messages and replies with a fixed (or
// per-call) ServerToAgent response.
function createMockTransport(
  responseFn?: () => opamp.proto.IServerToAgent
): Transport & { sentMessages: opamp.proto.AgentToServer[] } {
  const sentMessages: opamp.proto.AgentToServer[] = [];
  return {
    sentMessages,
    async send(data: Uint8Array): Promise<TransportResponse> {
      sentMessages.push(AgentToServer.decode(data));
      const payload = responseFn?.() ?? {};
      const body = ServerToAgent.encode(ServerToAgent.create(payload)).finish();
      return { statusCode: 200, body: new Uint8Array(body) };
    },
  };
}

const CAP_ACCEPTS = AgentCapabilities.AgentCapabilities_AcceptsRemoteConfig;
const CAP_REPORTS = AgentCapabilities.AgentCapabilities_ReportsRemoteConfig;

describe('OpAMP remote config', () => {
  describe('capabilities', () => {
    it('advertises remote-config capabilities only when applyRemoteConfig is provided', () => {
      const withApply = new OpAMPClient(
        createOptions({ applyRemoteConfig: async () => {} }),
        createMockTransport()
      );
      const withoutApply = new OpAMPClient(
        createOptions(),
        createMockTransport()
      );

      const cap = Number(withApply.buildAgentToServerMessage().capabilities);
      assert(cap & CAP_ACCEPTS, 'should accept remote config');
      assert(cap & CAP_REPORTS, 'should report remote config');

      const capOff = Number(
        withoutApply.buildAgentToServerMessage().capabilities
      );
      assert.strictEqual(capOff & CAP_ACCEPTS, 0, 'should not accept');
      assert.strictEqual(capOff & CAP_REPORTS, 0, 'should not report');
    });
  });

  describe('parsing', () => {
    it('parses an enabled cpu_profiler with sampling interval', async () => {
      let applied: RemoteProfilingConfig | undefined;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async (cfg) => {
            applied = cfg;
          },
        }),
        createMockTransport()
      );

      const body = [
        'distribution:',
        '  splunk:',
        '    profiling:',
        '      always_on:',
        '        cpu_profiler:',
        '          sampling_interval: 250',
      ].join('\n');

      client.processServerResponse(remoteConfigResponse({ body }));
      await waitForApply();

      assert(applied, 'callback should have been called');
      assert.deepStrictEqual(applied, {
        cpuProfiler: { enabled: true, samplingInterval: 250 },
        memoryProfiler: { enabled: false },
        callgraphs: { enabled: false },
      });
    });

    it('treats a bare cpu_profiler key as enabled with no interval', async () => {
      let applied: RemoteProfilingConfig | undefined;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async (cfg) => {
            applied = cfg;
          },
        }),
        createMockTransport()
      );

      const body = [
        'distribution:',
        '  splunk:',
        '    profiling:',
        '      always_on:',
        '        cpu_profiler:',
        '      callgraphs:',
      ].join('\n');

      client.processServerResponse(remoteConfigResponse({ body }));
      await waitForApply();

      assert(applied);
      assert.strictEqual(applied.cpuProfiler.enabled, true);
      assert.strictEqual(applied.cpuProfiler.samplingInterval, undefined);
      assert.strictEqual(applied.callgraphs.enabled, true);
    });

    it('enables memory_profiler when present', async () => {
      let applied: RemoteProfilingConfig | undefined;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async (cfg) => {
            applied = cfg;
          },
        }),
        createMockTransport()
      );

      const body = [
        'distribution:',
        '  splunk:',
        '    profiling:',
        '      always_on:',
        '        cpu_profiler:',
        '        memory_profiler:',
      ].join('\n');

      client.processServerResponse(remoteConfigResponse({ body }));
      await waitForApply();

      assert(applied);
      assert.strictEqual(applied.memoryProfiler.enabled, true);
    });

    it('reports all features off when the profiling block is absent', async () => {
      let applied: RemoteProfilingConfig | undefined;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async (cfg) => {
            applied = cfg;
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(
        remoteConfigResponse({ body: 'distribution:\n  splunk: {}' })
      );
      await waitForApply();

      assert.deepStrictEqual(applied, {
        cpuProfiler: { enabled: false },
        memoryProfiler: { enabled: false },
        callgraphs: { enabled: false },
      });
    });

    it('reports all features off when the config file is omitted', async () => {
      let applied: RemoteProfilingConfig | undefined;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async (cfg) => {
            applied = cfg;
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(remoteConfigResponse({ omitFile: true }));
      await waitForApply();

      assert(applied);
      assert.strictEqual(applied.cpuProfiler.enabled, false);
      assert.strictEqual(applied.memoryProfiler.enabled, false);
      assert.strictEqual(applied.callgraphs.enabled, false);
    });

    it('ignores remoteConfig entirely when not opted in', async () => {
      const client = new OpAMPClient(createOptions(), createMockTransport());
      // No applyRemoteConfig: the field is simply ignored and no status is set.
      client.processServerResponse(
        remoteConfigResponse({
          body: 'distribution:\n  splunk:\n    profiling:\n      always_on:\n        cpu_profiler:',
        })
      );
      await waitForApply();

      const msg = client.buildAgentToServerMessage();
      assert(
        !msg.remoteConfigStatus,
        'should not report remote config status when not opted in'
      );
      assert.strictEqual(Number(msg.capabilities) & CAP_ACCEPTS, 0);
    });
  });

  describe('status reporting', () => {
    it('reports APPLIED with the config hash after a successful apply', async () => {
      const client = new OpAMPClient(
        createOptions({ applyRemoteConfig: async () => {} }),
        createMockTransport()
      );
      const hash = new Uint8Array([9, 8, 7]);

      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: hash })
      );
      await waitForApply();

      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert(status, 'should attach remoteConfigStatus');
      assert.strictEqual(
        status.status,
        RemoteConfigStatuses.RemoteConfigStatuses_APPLIED
      );
      assert.deepStrictEqual(
        new Uint8Array(status.lastRemoteConfigHash!),
        hash
      );
    });

    it('reports FAILED when the apply callback rejects, and reports the failing hash', async () => {
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
            throw new Error('boom');
          },
        }),
        createMockTransport()
      );
      const hash = new Uint8Array([4, 5, 6]);

      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: hash })
      );
      await waitForApply();

      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert.strictEqual(
        status!.status,
        RemoteConfigStatuses.RemoteConfigStatuses_FAILED
      );
      assert.match(status!.errorMessage!, /boom/);
      assert.deepStrictEqual(
        new Uint8Array(status!.lastRemoteConfigHash!),
        hash,
        'FAILED status should carry the attempted hash'
      );
      assert.strictEqual(calls, 1);
    });

    it('does not re-attempt a re-sent config that already failed (no loop)', async () => {
      // A server that re-sends the same (failing) config on every poll must not
      // drive a re-apply / re-poll loop: a config is attempted once and its
      // FAILED status reported, and identical re-sends are deduped just like a
      // successful apply. The operator changes the config (new hash) to retry.
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
            throw new Error('boom');
          },
        }),
        createMockTransport()
      );
      const hash = new Uint8Array([4, 5, 6]);

      for (let i = 0; i < 3; i++) {
        client.processServerResponse(
          remoteConfigResponse({ body: '', configHash: hash })
        );
        await waitForApply();
      }

      assert.strictEqual(calls, 1, 'a failing config is attempted only once');
      // The FAILED status is still reported on every poll, so the server keeps
      // seeing the failure for the hash it offered.
      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert.strictEqual(
        status!.status,
        RemoteConfigStatuses.RemoteConfigStatuses_FAILED
      );
      assert.deepStrictEqual(
        new Uint8Array(status!.lastRemoteConfigHash!),
        hash
      );
    });

    it('attempts a changed config after a previous one failed', async () => {
      // Deduping failures must not wedge the agent: a genuinely different config
      // (new hash) is still attempted even right after a failure.
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
            throw new Error('boom');
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: new Uint8Array([1]) })
      );
      await waitForApply();
      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: new Uint8Array([2]) })
      );
      await waitForApply();

      assert.strictEqual(
        calls,
        2,
        'a changed config is attempted after a failure'
      );
    });

    it('reports FAILED on unparseable YAML', async () => {
      let called = false;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            called = true;
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(
        remoteConfigResponse({ body: 'key: : : not valid' })
      );
      await waitForApply();

      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert.strictEqual(
        status!.status,
        RemoteConfigStatuses.RemoteConfigStatuses_FAILED
      );
      assert.strictEqual(
        called,
        false,
        'apply should not run on parse failure'
      );
    });

    it('reports FAILED on an unsupported content type', async () => {
      let called = false;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            called = true;
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(
        remoteConfigResponse({ body: 'x: 1', contentType: 'application/json' })
      );
      await waitForApply();

      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert.strictEqual(
        status!.status,
        RemoteConfigStatuses.RemoteConfigStatuses_FAILED
      );
      assert.strictEqual(called, false);
    });

    it('reports FAILED on a malformed config hash instead of throwing', async () => {
      let called = false;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            called = true;
          },
        }),
        createMockTransport()
      );

      // A conformant server sends a byte array, but a malformed value can make
      // `new Uint8Array(...)` throw. Since _handleRemoteConfig runs via `void`,
      // an escaping throw would be an unhandled rejection with no status; it
      // must be caught and reported as FAILED instead.
      client.processServerResponse({
        remoteConfig: {
          config: { configMap: {} },
          // Reading length while constructing the Uint8Array throws, standing in
          // for any value that makes the conversion fail.
          configHash: {
            get length(): number {
              throw new Error('bad hash');
            },
          } as unknown as Uint8Array,
        },
      });
      await waitForApply();

      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert.strictEqual(
        status!.status,
        RemoteConfigStatuses.RemoteConfigStatuses_FAILED
      );
      assert.strictEqual(called, false, 'apply should not run on a bad hash');
    });

    it('accepts a content type with parameters', async () => {
      let called = false;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            called = true;
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(
        remoteConfigResponse({
          body: 'x: 1',
          contentType: 'application/yaml; vendor=splunk; v=1.0.0',
        })
      );
      await waitForApply();

      assert.strictEqual(called, true);
      const status = client.buildAgentToServerMessage().remoteConfigStatus;
      assert.strictEqual(
        status!.status,
        RemoteConfigStatuses.RemoteConfigStatuses_APPLIED
      );
    });
  });

  describe('dedup', () => {
    it('ignores a repeated config with the same hash', async () => {
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
          },
        }),
        createMockTransport()
      );
      const hash = new Uint8Array([1, 1, 1]);

      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: hash })
      );
      await waitForApply();
      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: hash })
      );
      await waitForApply();

      assert.strictEqual(calls, 1, 'same hash should apply once');
    });

    it('re-applies when the hash changes', async () => {
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
          },
        }),
        createMockTransport()
      );

      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: new Uint8Array([1]) })
      );
      await waitForApply();
      client.processServerResponse(
        remoteConfigResponse({ body: '', configHash: new Uint8Array([2]) })
      );
      await waitForApply();

      assert.strictEqual(calls, 2, 'changed hash should re-apply');
    });

    it('applies a hashless config once and then ignores re-sends', async () => {
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
          },
        }),
        createMockTransport()
      );

      // A non-conformant server may omit configHash. We dedup by body content,
      // so an unchanged re-send is ignored to avoid re-applying every poll.
      client.processServerResponse(
        remoteConfigResponse({ body: '', omitHash: true })
      );
      await waitForApply();
      client.processServerResponse(
        remoteConfigResponse({ body: '', omitHash: true })
      );
      await waitForApply();

      assert.strictEqual(
        calls,
        1,
        'unchanged hashless config should apply once'
      );
    });

    it('re-applies a hashless config when its body changes', async () => {
      let calls = 0;
      const client = new OpAMPClient(
        createOptions({
          applyRemoteConfig: async () => {
            calls += 1;
          },
        }),
        createMockTransport()
      );

      const cpuBody = [
        'distribution:',
        '  splunk:',
        '    profiling:',
        '      always_on:',
        '        cpu_profiler:',
      ].join('\n');

      // First hashless config enables cpu_profiler.
      client.processServerResponse(
        remoteConfigResponse({ body: cpuBody, omitHash: true })
      );
      await waitForApply();
      // A different hashless body (all features off) must still apply: deduping
      // by content, not a one-shot "saw a hashless config" flag.
      client.processServerResponse(
        remoteConfigResponse({ body: '', omitHash: true })
      );
      await waitForApply();

      assert.strictEqual(calls, 2, 'changed hashless body should re-apply');
    });
  });
});

// _handleRemoteConfig runs asynchronously (void promise). Yield enough turns of
// the microtask queue for the apply + status transitions to settle.
async function waitForApply(): Promise<void> {
  for (let i = 0; i < 10; i++) {
    await Promise.resolve();
  }
}
