import { strict as assert } from 'node:assert';
import path from 'node:path';
import { describe, it } from 'node:test';

import { FastifyOtelInstrumentation } from '../../../src/instrumentations/external/fastify';

type RouteOptions = {
  config?: {
    otel?:
      | boolean
      | {
          instrumentHandler?: boolean;
          instrumentHooks?: boolean | string[];
        };
  };
  handler: () => void;
  method: string;
  onRequest?: () => void;
  onSend?: unknown;
  preHandler?: () => void;
  url: string;
};

function getOnRouteHook(
  config: ConstructorParameters<typeof FastifyOtelInstrumentation>[0]
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
  const instrumentation = new FastifyOtelInstrumentation(config);

  instrumentation.plugin()(instance, {}, () => {});

  return hooks.get('onRoute')!.bind({ pluginName: 'test' });
}

describe('Fastify ignorePaths', () => {
  it(
    'uses path.matchesGlob for string patterns',
    { skip: typeof path.matchesGlob !== 'function' },
    () => {
      const onRoute = getOnRouteHook({ ignorePaths: '/health/**' });
      const routeOptions: RouteOptions = {
        handler() {},
        method: 'GET',
        url: '/health/ready',
      };

      onRoute(routeOptions);

      assert.equal(routeOptions.onSend, undefined);
    }
  );

  it('rejects string patterns when path.matchesGlob is unavailable', () => {
    const descriptor = Object.getOwnPropertyDescriptor(path, 'matchesGlob');
    Object.defineProperty(path, 'matchesGlob', {
      configurable: true,
      value: undefined,
    });

    try {
      assert.throws(
        () => new FastifyOtelInstrumentation({ ignorePaths: '/health/**' }),
        {
          message:
            'Fastify ignorePaths glob matching requires Node.js 20.17.0 through 20.x, 22.5.0 through 22.x, or 23.0.0 and later',
        }
      );
    } finally {
      if (descriptor) {
        Object.defineProperty(path, 'matchesGlob', descriptor);
      } else {
        Reflect.deleteProperty(path, 'matchesGlob');
      }
    }
  });

  it('supports matcher functions on every supported Node.js version', () => {
    const onRoute = getOnRouteHook({
      ignorePaths: ({ url }) => url.startsWith('/health/'),
    });
    const routeOptions: RouteOptions = {
      handler() {},
      method: 'GET',
      url: '/health/ready',
    };

    onRoute(routeOptions);

    assert.equal(routeOptions.onSend, undefined);
  });
});

describe('Fastify span controls', () => {
  it('keeps request instrumentation when hook and handler spans are disabled', () => {
    const onRoute = getOnRouteHook({
      instrumentHooks: false,
      instrumentHandler: false,
    });
    const handler = () => {};
    const preHandler = () => {};
    const routeOptions: RouteOptions = {
      handler,
      method: 'GET',
      preHandler,
      url: '/items',
    };

    onRoute(routeOptions);

    assert.equal(routeOptions.handler, handler);
    assert.equal(routeOptions.preHandler, preHandler);
    assert.ok(routeOptions.onSend);
  });

  it('allows a route to enable selected spans over global defaults', () => {
    const onRoute = getOnRouteHook({
      instrumentHooks: false,
      instrumentHandler: false,
    });
    const handler = () => {};
    const onRequest = () => {};
    const preHandler = () => {};
    const routeOptions: RouteOptions = {
      config: {
        otel: { instrumentHooks: ['preHandler'], instrumentHandler: true },
      },
      handler,
      method: 'GET',
      onRequest,
      preHandler,
      url: '/items',
    };

    onRoute(routeOptions);

    assert.notEqual(routeOptions.handler, handler);
    assert.equal(routeOptions.onRequest, onRequest);
    assert.notEqual(routeOptions.preHandler, preHandler);
  });
});
