import { before, beforeEach, describe, it } from 'node:test';
import * as assert from 'assert';

const memoryExporter = new InMemorySpanExporter();

describe('HttpInstrumentation', () => {
    describe('with good instrumentation options', () => {
      beforeEach(() => {
        memoryExporter.reset();
      });

      before(async () => {
        instrumentation.setConfig({
          ignoreIncomingRequestHook: request => {
            return (
              request.headers['user-agent']?.match('ignored-string') != null
            );
          },
          ignoreOutgoingRequestHook: request => {
            if (request.headers?.['user-agent'] != null) {
              return (
                `${request.headers['user-agent']}`.match('ignored-string') !=
                null
              );
            }
            return false;
          },
          applyCustomAttributesOnSpan: customAttributeFunction,
          requestHook: requestHookFunction,
          responseHook: responseHookFunction,
          startIncomingSpanHook: startIncomingSpanHookFunction,
          startOutgoingSpanHook: startOutgoingSpanHookFunction,
          serverName,
        });
        instrumentation.enable();
        server = http.createServer((request, response) => {
          if (request.url?.includes('/premature-close')) {
            response.destroy();
            return;
          }
          if (request.url?.includes('/hang')) {
            // write response headers.
            response.write('');
            // hang the request.
            return;
          }
          if (request.url?.includes('/destroy-request')) {
            // force flush http response header to trigger client response callback
            response.write('');
            setTimeout(() => {
              request.socket.destroy();
            }, 100);
            return;
          }
          if (request.url?.includes('/ignored')) {
            provider.getTracer('test').startSpan('some-span').end();
          }
          if (request.url?.includes('/setroute')) {
            const rpcData = getRPCMetadata(context.active());
            assert.ok(rpcData != null);
            assert.strictEqual(rpcData.type, RPCType.HTTP);
            assert.strictEqual(rpcData.route, undefined);
            rpcData.route = 'TheRoute';
          }
          response.end('Test Server Response');
        });

        await new Promise<void>(resolve => server.listen(serverPort, resolve));
      });

      after(() => {
        server.close();
        instrumentation.disable();
      });

      it(`${protocol} module should be patched`, () => {
        assert.strictEqual(isWrapped(http.Server.prototype.emit), true);
      });

      it('should generate valid spans (client side and server side)', async () => {
        const result = await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`,
          {
            headers: {
              'x-forwarded-for': '<client>, <proxy1>, <proxy2>',
              'user-agent': 'chrome',
            },
          }
        );
        const spans = memoryExporter.getFinishedSpans();
        const [incomingSpan, outgoingSpan] = spans;
        const validations = {
          hostname,
          httpStatusCode: result.statusCode!,
          httpMethod: result.method!,
          pathname,
          resHeaders: result.resHeaders,
          reqHeaders: result.reqHeaders,
          component: 'http',
          serverName,
        };
      });
    });
});
