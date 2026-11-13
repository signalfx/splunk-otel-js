/*
 * Copyright Splunk Inc., The OpenTelemetry Authors
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

import * as assert from 'assert';
import { execFileSync } from 'child_process';
import * as path from 'path';
import { afterEach, describe, it, mock } from 'node:test';
import { context, TextMapPropagator } from '@opentelemetry/api';
import { MongoDBInstrumentation } from '../../../../src/instrumentations/external/mongodb';

describe('MongoDB comment propagation configuration', () => {
  afterEach(() => mock.restoreAll());

  for (const enabled of [false, true]) {
    it(`preserves the initial propagation settings (${enabled}) while updating other options`, () => {
      const supportsDocumentComments = () => true;
      const commentPropagator = { inject() {} } as unknown as TextMapPropagator;
      const config = {
        enabled: false,
        addCommentToCommands: enabled,
        supportsDocumentComments,
        commentPropagator,
      };
      const instrumentation = new MongoDBInstrumentation(config);
      config.addCommentToCommands = !enabled;
      instrumentation.setConfig({
        addCommentToCommands: !enabled,
        supportsDocumentComments: () => false,
        commentPropagator: {} as TextMapPropagator,
        requireParentSpan: false,
      });
      assert.strictEqual(
        instrumentation.getConfig().addCommentToCommands,
        enabled
      );
      assert.strictEqual(
        instrumentation.getConfig().supportsDocumentComments,
        supportsDocumentComments
      );
      assert.strictEqual(
        instrumentation.getConfig().commentPropagator,
        commentPropagator
      );
      assert.strictEqual(instrumentation.getConfig().requireParentSpan, false);
      instrumentation.setConfig();
      assert.strictEqual(
        instrumentation.getConfig().addCommentToCommands,
        enabled
      );
      assert.strictEqual(
        instrumentation.getConfig().supportsDocumentComments,
        supportsDocumentComments
      );
      assert.strictEqual(
        instrumentation.getConfig().commentPropagator,
        commentPropagator
      );
    });
  }

  it('cannot enable propagation through setConfig when initially omitted', () => {
    const instrumentation = new MongoDBInstrumentation({ enabled: false });
    const initialSupportCheck =
      instrumentation.getConfig().supportsDocumentComments;
    instrumentation.setConfig({
      addCommentToCommands: true,
      supportsDocumentComments: () => true,
    });
    assert.strictEqual(instrumentation.getConfig().addCommentToCommands, false);
    assert.strictEqual(
      instrumentation.getConfig().supportsDocumentComments,
      initialSupportCheck
    );
  });

  for (const style of ['callback', 'promise'] as const) {
    it(`adds no propagation scope or hook calls to a disabled ${style} command`, async () => {
      const supportsDocumentComments = mock.fn(() => true);
      const inject = mock.fn();
      const instrumentation = new MongoDBInstrumentation({
        enabled: false,
        requireParentSpan: false,
        supportsDocumentComments,
        commentPropagator: { inject } as unknown as TextMapPropagator,
      });
      const connection = { address: 'localhost:27017', id: 1 };
      const ns = { db: 'test', collection: 'items' };
      const cmd = { find: 'items', comment: null };
      const options = {};
      const responseType = function Response() {};
      const result = { ok: 1 };
      const parentContext = context.active();
      const callback = mock.fn((_error: unknown, _result: unknown) => {
        assert.strictEqual(context.active(), parentContext);
      });
      const withContext = mock.method(context, 'with');
      const original = mock.fn(function (
        this: unknown,
        actualNs: unknown,
        actualCmd: unknown,
        actualOptions: unknown,
        last: unknown
      ) {
        assert.strictEqual(this, connection);
        assert.strictEqual(actualNs, ns);
        assert.strictEqual(actualCmd, cmd);
        assert.strictEqual(actualOptions, options);
        assert.strictEqual(context.active(), parentContext);
        // Completion still restores the parent context as it did before this feature.
        assert.strictEqual(withContext.mock.callCount(), 0);
        if (style === 'callback') {
          (last as Function)(null, result);
          return result;
        }
        assert.strictEqual(last, responseType);
        return Promise.resolve(result);
      });
      const factory =
        style === 'callback'
          ? (instrumentation as any)._getV4PatchCommandCallback()
          : (instrumentation as any)._getV4PatchCommandPromise();
      const patched = factory(original);
      const actual = patched.call(
        connection,
        ns,
        cmd,
        options,
        style === 'callback' ? callback : responseType
      );
      assert.strictEqual(await actual, result);
      assert.strictEqual(original.mock.callCount(), 1);
      assert.strictEqual(supportsDocumentComments.mock.callCount(), 0);
      assert.strictEqual(inject.mock.callCount(), 0);
      assert.strictEqual(cmd.comment, null);
      if (style === 'callback') {
        assert.strictEqual(callback.mock.callCount(), 1);
        assert.deepStrictEqual(callback.mock.calls[0].arguments, [
          null,
          result,
        ]);
      }
    });
  }

  for (const enabled of [false, true]) {
    it(
      `patches only OP_MSG constructors when configured and restores them across lifecycle changes (${enabled})`,
      { timeout: 15000 },
      () => {
        const instrumentationPath = path.resolve(
          __dirname,
          '../../../../src/instrumentations/external/mongodb'
        );
        const script = `
        const assert = require('assert');
        const { MongoDBInstrumentation } = require(${JSON.stringify(instrumentationPath)});
        const commands = require('mongodb/lib/cmap/commands');
        const names = ['Msg', 'OpMsgRequest', 'Query', 'OpQueryRequest'].filter(name => commands[name]);
        const originals = names.map(name => commands[name]);
        const serializers = originals.map(Constructor => Constructor.prototype.toBin);
        const instrumentation = new MongoDBInstrumentation({
          enabled: false,
          addCommentToCommands: ${enabled},
          supportsDocumentComments: () => true,
        });
        for (let cycle = 0; cycle < 2; cycle++) {
          instrumentation.enable();
          require('mongodb/lib/cmap/commands');
          for (const [index, name] of names.entries()) {
            const shouldPatch = ${enabled} && (name === 'Msg' || name === 'OpMsgRequest');
            assert.strictEqual(commands[name] === originals[index], !shouldPatch);
            assert.strictEqual(commands[name].prototype.toBin, serializers[index]);
          }
          instrumentation.setConfig({ addCommentToCommands: ${!enabled} });
          assert.strictEqual(instrumentation.getConfig().addCommentToCommands, ${enabled});
          instrumentation.disable();
          for (const [index, name] of names.entries()) {
            assert.strictEqual(commands[name], originals[index]);
          }
        }
      `;
        execFileSync(
          process.execPath,
          [
            '-r',
            require.resolve('ts-node/register/transpile-only'),
            '-e',
            script,
          ],
          { timeout: 12000, stdio: 'pipe' }
        );
      }
    );
  }
});
