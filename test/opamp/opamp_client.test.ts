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
import type { EffectiveConfig, OpAMPOptions } from '../../src/opamp/types';
import type {
  Transport,
  TransportResponse,
} from '../../src/opamp/HttpTransport';

const { AgentToServer, ServerToAgent, AgentCapabilities, ServerToAgentFlags } =
  opamp.proto;

function createMockTransport(
  responseFn?: () => opamp.proto.IServerToAgent
): Transport & { sentMessages: opamp.proto.AgentToServer[] } {
  const sentMessages: opamp.proto.AgentToServer[] = [];

  return {
    sentMessages,
    async send(data: Uint8Array): Promise<TransportResponse> {
      const decoded = AgentToServer.decode(data);
      sentMessages.push(decoded);

      const responsePayload = responseFn?.() ?? {};
      const responseBytes = ServerToAgent.encode(
        ServerToAgent.create(responsePayload)
      ).finish();

      return {
        statusCode: 200,
        body: new Uint8Array(responseBytes),
      };
    },
  };
}

const DEFAULT_CAPABILITIES =
  AgentCapabilities.AgentCapabilities_ReportsStatus |
  AgentCapabilities.AgentCapabilities_ReportsHealth |
  AgentCapabilities.AgentCapabilities_ReportsEffectiveConfig |
  AgentCapabilities.AgentCapabilities_ReportsHeartbeat;

const EMPTY_EFFECTIVE_CONFIG: EffectiveConfig = {
  type: 'yaml',
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

describe('OpAMPClient', () => {
  describe('message construction', () => {
    it('sends full state on first message', async () => {
      const transport = createMockTransport();
      const client = new OpAMPClient(createOptions(), transport);

      await client.start();
      await client.stop();

      const msg = transport.sentMessages[0];

      assert(msg.instanceUid, 'should have instanceUid');
      assert.strictEqual(msg.instanceUid.length, 16);
      assert.strictEqual(Number(msg.sequenceNum), 0);
      assert.strictEqual(Number(msg.capabilities), DEFAULT_CAPABILITIES);
      assert(
        msg.agentDescription,
        'first message should include agentDescription'
      );
      assert(msg.health, 'first message should include health');
    });

    it('includes all resource attributes as identifying attributes in agentDescription', async () => {
      const transport = createMockTransport();
      const client = new OpAMPClient(createOptions(), transport);

      await client.start();
      await client.stop();

      const msg = transport.sentMessages[0];
      const desc = msg.agentDescription!;
      const identifyingKeys = desc.identifyingAttributes!.map((kv) => kv.key);

      assert(
        identifyingKeys.includes(ATTR_SERVICE_NAME),
        'should have service.name as identifying'
      );
      assert(
        identifyingKeys.includes('host.name'),
        'should have host.name as identifying'
      );
      assert.strictEqual(
        desc.nonIdentifyingAttributes?.length ?? 0,
        0,
        'should have no non-identifying attributes'
      );
    });

    it('increments sequenceNum on each message', () => {
      const transport = createMockTransport();
      const client = new OpAMPClient(createOptions(), transport);

      const msg1 = client.buildAgentToServerMessage();
      const msg2 = client.buildAgentToServerMessage();
      const msg3 = client.buildAgentToServerMessage();

      assert.strictEqual(msg1.sequenceNum, 0);
      assert.strictEqual(msg2.sequenceNum, 1);
      assert.strictEqual(msg3.sequenceNum, 2);
    });

    it('includes effectiveConfig when callback is provided', () => {
      const transport = createMockTransport();
      const effectiveConfig: EffectiveConfig = {
        type: 'yaml',
        content: 'key: value',
      };
      const client = new OpAMPClient(
        createOptions({ getEffectiveConfig: () => effectiveConfig }),
        transport
      );

      const msg = client.buildAgentToServerMessage();
      assert(msg.effectiveConfig, 'should include effectiveConfig');
      assert(
        msg.effectiveConfig.configMap?.configMap?.['yaml'],
        'should have config file'
      );
    });
  });

  describe('status compression', () => {
    it('omits unchanged effectiveConfig after first successful send', async () => {
      const effectiveConfig: EffectiveConfig = {
        type: 'yaml',
        content: 'key: value',
      };
      const transport = createMockTransport();
      const client = new OpAMPClient(
        createOptions({ getEffectiveConfig: () => effectiveConfig }),
        transport
      );

      await client.start();
      await client.stop();

      // First message should include effectiveConfig
      const firstMsg = transport.sentMessages[0];
      assert(firstMsg.effectiveConfig, 'first message has effectiveConfig');

      // Next message should omit unchanged effectiveConfig
      const nextMsg = client.buildAgentToServerMessage();
      assert.strictEqual(
        nextMsg.effectiveConfig,
        undefined,
        'should not include unchanged effectiveConfig'
      );
    });

    it('re-sends effectiveConfig when config changes', async () => {
      let currentContent = 'key: value';
      const transport = createMockTransport();
      const client = new OpAMPClient(
        createOptions({
          getEffectiveConfig: () => ({
            type: 'yaml' as const,
            content: currentContent,
          }),
        }),
        transport
      );

      await client.start();
      await client.stop();

      // First message should include effectiveConfig
      const firstMsg = transport.sentMessages[0];
      assert(firstMsg.effectiveConfig, 'first message has effectiveConfig');

      // Same config should be omitted
      const sameMsg = client.buildAgentToServerMessage();
      assert.strictEqual(
        sameMsg.effectiveConfig,
        undefined,
        'should not include unchanged effectiveConfig'
      );

      // Changed config should be included
      currentContent = 'key: changed';
      const changedMsg = client.buildAgentToServerMessage();
      assert(
        changedMsg.effectiveConfig,
        'should include changed effectiveConfig'
      );
    });

    it('re-sends effectiveConfig after HTTP 409 response', async () => {
      const effectiveConfig: EffectiveConfig = {
        type: 'yaml',
        content: 'key: value',
      };

      let respondWith409 = false;
      const sentMessages: opamp.proto.AgentToServer[] = [];
      const transport: Transport = {
        async send(data: Uint8Array): Promise<TransportResponse> {
          const decoded = AgentToServer.decode(data);
          sentMessages.push(decoded);

          if (respondWith409) {
            return { statusCode: 409, body: new Uint8Array() };
          }

          const responseBytes = ServerToAgent.encode(
            ServerToAgent.create({})
          ).finish();
          return { statusCode: 200, body: new Uint8Array(responseBytes) };
        },
      };

      const client = new OpAMPClient(
        createOptions({ getEffectiveConfig: () => effectiveConfig }),
        transport
      );

      // First poll sends effectiveConfig, gets 200
      await client.start();
      await client.stop();
      assert(
        sentMessages[0].effectiveConfig,
        'first message has effectiveConfig'
      );

      // Without 409, config is compressed away
      const compressed = client.buildAgentToServerMessage();
      assert.strictEqual(
        compressed.effectiveConfig,
        undefined,
        'compressed after 200'
      );

      respondWith409 = true;
      const client2 = new OpAMPClient(
        createOptions({ getEffectiveConfig: () => effectiveConfig }),
        transport
      );
      await client2.start();
      await client2.stop();

      // After 409, state resets — next message should include effectiveConfig again
      const afterReset = client2.buildAgentToServerMessage();
      assert(
        afterReset.effectiveConfig,
        'should re-send effectiveConfig after 409 reset'
      );
    });

    it('re-sends effectiveConfig when server requests ReportFullState', async () => {
      const effectiveConfig: EffectiveConfig = {
        type: 'yaml',
        content: 'key: value',
      };
      const transport = createMockTransport(() => ({
        flags: ServerToAgentFlags.ServerToAgentFlags_ReportFullState,
      }));
      const client = new OpAMPClient(
        createOptions({ getEffectiveConfig: () => effectiveConfig }),
        transport
      );

      await client.start();
      await client.stop();

      // After ReportFullState, effectiveConfig should be re-sent
      const msg = client.buildAgentToServerMessage();
      assert(msg.effectiveConfig, 'should re-send effectiveConfig');
    });
  });

  describe('server response processing', () => {
    it('updates instanceUid when server provides agentIdentification', () => {
      const transport = createMockTransport();
      const client = new OpAMPClient(createOptions(), transport);

      const newUid = new Uint8Array([
        99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84,
      ]);

      // Build initial message to consume first state
      client.buildAgentToServerMessage();

      client.processServerResponse({
        agentIdentification: { newInstanceUid: newUid },
      });

      const msg = client.buildAgentToServerMessage();
      assert.deepStrictEqual(new Uint8Array(msg.instanceUid!), newUid);
    });
  });

  describe('polling and lifecycle', () => {
    it('sends message on start()', async () => {
      const transport = createMockTransport();
      const client = new OpAMPClient(
        createOptions({ pollingIntervalMs: 100_000 }),
        transport
      );

      await client.start();
      await client.stop();

      // start() triggers one poll, stop() sends disconnect
      assert(
        transport.sentMessages.length >= 1,
        'should have sent at least one message'
      );
    });

    it('sends agentDisconnect on stop()', async () => {
      const transport = createMockTransport();
      const client = new OpAMPClient(
        createOptions({ pollingIntervalMs: 100_000 }),
        transport
      );

      await client.start();
      await client.stop();

      const lastMsg = transport.sentMessages[transport.sentMessages.length - 1];
      assert(
        lastMsg.agentDisconnect,
        'last message should have agentDisconnect'
      );
    });
  });
});
