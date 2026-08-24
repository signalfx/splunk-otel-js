import { strict as assert } from 'node:assert';
import path from 'node:path';
import { describe, it } from 'node:test';

import { FastifyOtelInstrumentation } from '../../../src/instrumentations/external/fastify';

type RouteOptions = {
  handler: () => void;
  method: string;
  onSend?: unknown;
  url: string;
};

function getOnRouteHook(
  ignorePaths: string | ((routeOptions: RouteOptions) => boolean)
) {
  const hooks = new Map<string, (routeOptions: RouteOptions) => void>();
  const instance = {
    addHook(name: string, hook: (routeOptions: RouteOptions) => void) {
      hooks.set(name, hook);
    },
    decorate(key: PropertyKey, value: unknown) {
      Object.defineProperty(this, key, {
        configurable: true,
        value,
        writable: true,
      });
    },
    decorateRequest() {},
    setNotFoundHandler() {},
  };
  const instrumentation = new FastifyOtelInstrumentation({ ignorePaths });

  instrumentation.plugin()(instance, {}, () => {});

  return hooks.get('onRoute')!.bind({ pluginName: 'test' });
}

describe('Fastify ignorePaths', () => {
  it(
    'uses path.matchesGlob for string patterns',
    { skip: typeof path.matchesGlob !== 'function' },
    () => {
      const onRoute = getOnRouteHook('/health/**');
      const routeOptions: RouteOptions = {
        handler() {},
        method: 'GET',
        url: '/health/ready',
      };

      onRoute(routeOptions);

      assert.equal(routeOptions.onSend, undefined);
    }
  );

  it(
    'rejects string patterns when path.matchesGlob is unavailable',
    { skip: typeof path.matchesGlob === 'function' },
    () => {
      assert.throws(
        () => new FastifyOtelInstrumentation({ ignorePaths: '/health/**' }),
        /requires Node\.js 20\.17\.0 through 20\.x, 22\.5\.0 through 22\.x, or 23\.0\.0 and later/
      );
    }
  );

  it('supports matcher functions on every supported Node.js version', () => {
    const onRoute = getOnRouteHook(({ url }) => url.startsWith('/health/'));
    const routeOptions: RouteOptions = {
      handler() {},
      method: 'GET',
      url: '/health/ready',
    };

    onRoute(routeOptions);

    assert.equal(routeOptions.onSend, undefined);
  });
});
