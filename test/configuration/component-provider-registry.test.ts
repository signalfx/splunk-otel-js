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

import { describe, it, beforeEach, mock } from 'node:test';
import { strict as assert } from 'assert';

import { ComponentProviderRegistry } from '../../src/configuration/ComponentProviderRegistry';
import { ComponentProvider } from '../../src/configuration/types';

import { join } from 'path';

class TestSDKProvider implements ComponentProvider {
  readonly type: string = 'sdk';
  readonly name: string = 'sdk';

  mock = mock.fn();

  create(config, providerRegistry): unknown {
    this.mock(config, providerRegistry);
    return true;
  }
}

describe('ComponentProviderRegistry', () => {
  it('registers component provider by default name', () => {
    const provider = new TestSDKProvider();
    const registry = new ComponentProviderRegistry();

    registry.register(provider);

    const component = registry.component('sdk', 'sdk', {});

    assert.equal(component, true);
    assert.equal(provider.mock.mock.calls.length, 1);
  });

  it("can't register a component with same type/name twice", () => {
    const provider1 = new TestSDKProvider();
    const provider2 = new TestSDKProvider();
    const registry = new ComponentProviderRegistry();

    registry.register(provider1);
    try {
      registry.register(provider2);
      assert(false, "registry.register didn't throw an error");
    } catch (e) {
      assert.equal(
        e.message,
        'Component provider for sdk sdk already registerred'
      );
    }
  });

  it("throws when there isn't an implementation", () => {
    const registry = new ComponentProviderRegistry();

    try {
      const _component = registry.component('sdk', 'sdk', {});
      assert(false, "registry.component didn't throw an error");
    } catch (e) {
      assert.equal(
        e.message,
        'No component provider for sdk sdk has been registerred'
      );
    }
  });

  it('registers component provider with name override', () => {
    const provider = new TestSDKProvider();
    const registry = new ComponentProviderRegistry();

    registry.register(provider, 'custom', 'test');

    const component = registry.component('custom', 'test', {});
    assert.equal(component, true);
    assert.equal(provider.mock.mock.calls.length, 1);

    try {
      const _component = registry.component('sdk', 'sdk', {});
      assert(false, "registry.component didn't throw an error");
    } catch (e) {
      assert.equal(
        e.message,
        'No component provider for sdk sdk has been registerred'
      );
      assert.equal(provider.mock.mock.calls.length, 1);
    }
  });

  it('componentMap', () => {
    function createProvider(name: string) {
      return new (class extends TestSDKProvider {
        readonly type = 'test';
        readonly name = name;

        create(config, providerRegistry) {
          this.mock(config, providerRegistry);
          return name;
        }
      })();
    }

    const providerAlpha = createProvider('alpha');
    const providerBeta = createProvider('beta');
    const providerGamma = createProvider('gamma');

    const registry = new ComponentProviderRegistry([
      providerAlpha,
      providerBeta,
      providerGamma,
    ]);

    /**
     * example:
     *   alpha:
     *     test: 1
     *   gamma:
     *     test: 3
     */
    const components = registry.componentMap('test', {
      alpha: { test: 1 },
      gamma: { test: 3 },
    });
    assert.deepEqual(components, ['alpha', 'gamma']);
    assert.equal(providerAlpha.mock.mock.calls.length, 1);
    assert.deepEqual(providerAlpha.mock.mock.calls[0].arguments[0], {
      test: 1,
    });
    assert.equal(providerBeta.mock.mock.calls.length, 0);
    assert.equal(providerGamma.mock.mock.calls.length, 1);
    assert.deepEqual(providerGamma.mock.mock.calls[0].arguments[0], {
      test: 3,
    });
  });

  it('componentArrayMap', () => {
    function createProvider(name: string) {
      return new (class extends TestSDKProvider {
        readonly type = 'test';
        readonly name = name;

        create(config, providerRegistry) {
          this.mock(config, providerRegistry);
          return name;
        }
      })();
    }

    const providerAlpha = createProvider('alpha');
    const providerBeta = createProvider('beta');
    const providerGamma = createProvider('gamma');

    const registry = new ComponentProviderRegistry([
      providerAlpha,
      providerBeta,
      providerGamma,
    ]);

    /**
     * example:
     *   - alpha:
     *       test: 1
     *   - gamma:
     *       test: 3
     */
    const components = registry.componentArrayMap('test', [
      { alpha: { test: 1 } },
      { gamma: { test: 3 } },
    ]);
    assert.deepEqual(components, ['alpha', 'gamma']);
    assert.equal(providerAlpha.mock.mock.calls.length, 1);
    assert.deepEqual(providerAlpha.mock.mock.calls[0].arguments[0], {
      test: 1,
    });
    assert.equal(providerBeta.mock.mock.calls.length, 0);
    assert.equal(providerGamma.mock.mock.calls.length, 1);
    assert.deepEqual(providerGamma.mock.mock.calls[0].arguments[0], {
      test: 3,
    });
  });
});
