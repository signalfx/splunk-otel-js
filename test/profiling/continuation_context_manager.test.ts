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
import { AsyncLocalStorage } from 'node:async_hooks';
import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { describe, it } from 'node:test';

import { createContextKey, ROOT_CONTEXT, trace } from '@opentelemetry/api';

import { ContinuationPreservedContextManager } from '../../src/profiling/ContinuationPreservedContextManager';
import {
  canUseContinuationPreservedContext,
  createProfilingContextManager,
} from '../../src/profiling';
import type { ProfilingExtension } from '../../src/profiling/types';
import { spinMs } from '../utils';

const extension: ProfilingExtension = require('../../src/native_ext').profiling;
const nodeMajor = Number.parseInt(process.versions.node.split('.')[0], 10);
const continuationSupported =
  nodeMajor >= 24 &&
  typeof extension.continuationContextSupported === 'function' &&
  extension.continuationContextSupported();
const skipUnlessSupported = continuationSupported
  ? false
  : 'requires the Node 24+ continuation context native API';

function createManager(): ContinuationPreservedContextManager {
  return new ContinuationPreservedContextManager(extension).enable();
}

describe('ContinuationPreservedContextManager', () => {
  it(
    'is selected on a supported Node 24+ runtime',
    { skip: skipUnlessSupported },
    () => {
      assert.equal(canUseContinuationPreservedContext(extension), true);
      assert(
        createProfilingContextManager(extension) instanceof
          ContinuationPreservedContextManager
      );
    }
  );

  it(
    'nests and restores synchronous contexts',
    { skip: skipUnlessSupported },
    () => {
      const manager = createManager();
      const key = createContextKey('synchronous-test');
      const outer = ROOT_CONTEXT.setValue(key, 'outer');
      const inner = ROOT_CONTEXT.setValue(key, 'inner');

      try {
        assert.equal(manager.active().getValue(key), undefined);
        manager.with(outer, () => {
          assert.equal(manager.active().getValue(key), 'outer');
          manager.with(inner, () => {
            assert.equal(manager.active().getValue(key), 'inner');
          });
          assert.equal(manager.active().getValue(key), 'outer');
        });
        assert.equal(manager.active().getValue(key), undefined);
      } finally {
        manager.disable();
      }
    }
  );

  it(
    'propagates isolated contexts through promises and bound Node callbacks',
    { skip: skipUnlessSupported },
    async () => {
      const manager = createManager();
      const key = createContextKey('asynchronous-test');
      const first = ROOT_CONTEXT.setValue(key, 'first');
      const second = ROOT_CONTEXT.setValue(key, 'second');

      try {
        await Promise.all([
          manager.with(first, async () => {
            await Promise.resolve();
            assert.equal(manager.active().getValue(key), 'first');

            await new Promise<void>((resolve) => {
              process.nextTick(
                manager.bind(manager.active(), () => {
                  assert.equal(manager.active().getValue(key), 'first');
                  resolve();
                })
              );
            });

            await new Promise<void>((resolve) => {
              setTimeout(
                manager.bind(manager.active(), () => {
                  assert.equal(manager.active().getValue(key), 'first');
                  resolve();
                }),
                10
              );
            });
          }),
          manager.with(second, async () => {
            await new Promise<void>((resolve) => {
              setImmediate(
                manager.bind(manager.active(), () => {
                  assert.equal(manager.active().getValue(key), 'second');
                  resolve();
                })
              );
            });
          }),
        ]);

        assert.equal(manager.active().getValue(key), undefined);
      } finally {
        manager.disable();
      }
    }
  );

  it(
    'coexists with application AsyncLocalStorage frames',
    { skip: skipUnlessSupported },
    async () => {
      const manager = createManager();
      const storage = new AsyncLocalStorage<string>();
      const key = createContextKey('als-interoperability-test');
      const profilingContext = ROOT_CONTEXT.setValue(key, 'profiling');

      try {
        await storage.run('outer-als', () =>
          manager.with(profilingContext, async () => {
            await Promise.resolve();
            assert.equal(storage.getStore(), 'outer-als');
            assert.equal(manager.active().getValue(key), 'profiling');
          })
        );

        await manager.with(profilingContext, () =>
          storage.run('inner-als', async () => {
            await Promise.resolve();
            assert.equal(storage.getStore(), 'inner-als');
            assert.equal(manager.active().getValue(key), 'profiling');
          })
        );

        manager.with(profilingContext, () => {
          storage.enterWith('disabled-als');
          storage.disable();
          assert.equal(storage.getStore(), undefined);
          assert.equal(manager.active().getValue(key), 'profiling');
        });
      } finally {
        storage.disable();
        manager.disable();
      }
    }
  );

  it(
    'binds functions and EventEmitter listeners',
    { skip: skipUnlessSupported },
    () => {
      const manager = createManager();
      const key = createContextKey('bind-test');
      const boundContext = ROOT_CONTEXT.setValue(key, 'bound');

      try {
        const boundFunction = manager.bind(boundContext, (value: number) => {
          assert.equal(manager.active().getValue(key), 'bound');
          return value * 2;
        });
        assert.equal(boundFunction(3), 6);

        const emitter = manager.bind(boundContext, new EventEmitter());
        let calls = 0;
        const listener = () => {
          calls++;
          assert.equal(manager.active().getValue(key), 'bound');
        };
        emitter.on('event', listener);
        emitter.emit('event');
        emitter.removeListener('event', listener);
        emitter.emit('event');
        assert.equal(calls, 1);
      } finally {
        manager.disable();
      }
    }
  );

  it(
    'correlates samples taken after an asynchronous boundary',
    { skip: skipUnlessSupported },
    async () => {
      const manager = createManager();
      const traceId = '0123456789abcdef0123456789abcdef';
      const spanId = '0123456789abcdef';
      const span = trace.wrapSpanContext({ traceId, spanId, traceFlags: 1 });
      const profilingContext = trace.setSpan(ROOT_CONTEXT, span);
      const handle = extension.start({
        name: 'continuation-context-correlation-test',
        samplingIntervalMicroseconds: 1_000,
        maxSampleCutoffDelayMicroseconds: 500,
        recordDebugInfo: false,
      });

      try {
        await manager.with(profilingContext, async () => {
          await new Promise<void>((resolve) => setTimeout(resolve, 10));
          spinMs(150);
        });

        const profile = extension.stop(handle);
        assert(profile);
        assert(
          profile.stacktraces.some(
            (sample) =>
              sample.traceId?.toString('hex') === traceId &&
              sample.spanId?.toString('hex') === spanId
          ),
          'expected at least one asynchronously collected sample with span correlation'
        );
      } finally {
        extension.stop(handle);
        manager.disable();
      }
    }
  );

  it(
    'falls back when async context frames are disabled',
    { skip: nodeMajor < 24 ? 'requires the Node 24 flag' : false },
    () => {
      const script = `
        const {
          createProfilingContextManager,
          noopExtension,
        } = require('./src/profiling');
        const extension = noopExtension();
        extension.continuationContextSupported = () => true;
        const manager = createProfilingContextManager(extension);
        if (manager.constructor.name !== 'ProfilingContextManager') {
          throw new Error('expected legacy ProfilingContextManager fallback');
        }
      `;
      const result = spawnSync(
        process.execPath,
        [
          '--no-async-context-frame',
          '--require',
          'ts-node/register/transpile-only',
          '--eval',
          script,
        ],
        { cwd: process.cwd(), encoding: 'utf8' }
      );

      assert.equal(result.status, 0, result.stderr || result.stdout);
    }
  );
});
