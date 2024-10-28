module.exports = [
  {
    traceId: 'R+gxE9M1J6UTkIsOh7PMjg==',
    id: 'V4DPhy8Psf4=',
    startTime: '2024-10-23T13:06:59.060Z',
    hrStartTime: 1729688819060000000n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: 'iApIRUZb7+s=',
    parent: { id: 'iApIRUZb7+s=', traceId: 'R+gxE9M1J6UTkIsOh7PMjg==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.42.0',
      'http.route': '/',
      'express.name': 'query',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'R+gxE9M1J6UTkIsOh7PMjg==',
    id: 'sDChkVN+hZg=',
    startTime: '2024-10-23T13:06:59.063Z',
    hrStartTime: 1729688819063000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: 'iApIRUZb7+s=',
    parent: { id: 'iApIRUZb7+s=', traceId: 'R+gxE9M1J6UTkIsOh7PMjg==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.42.0',
      'http.route': '/',
      'express.name': 'expressInit',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'R+gxE9M1J6UTkIsOh7PMjg==',
    id: '1uGSa9Su+KI=',
    startTime: '2024-10-23T13:06:59.064Z',
    hrStartTime: 1729688819064000000n,
    name: 'request handler - /',
    kind: 'internal',
    parentSpanId: 'iApIRUZb7+s=',
    parent: { id: 'iApIRUZb7+s=', traceId: 'R+gxE9M1J6UTkIsOh7PMjg==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.42.0',
      'http.route': '/',
      'express.name': '/',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'R+gxE9M1J6UTkIsOh7PMjg==',
    id: 'LJVoXT8xVY4=',
    startTime: '2024-10-23T13:06:59.066Z',
    hrStartTime: 1729688819066000000n,
    name: 'calculate-random',
    kind: 'internal',
    parentSpanId: 'iApIRUZb7+s=',
    parent: { id: 'iApIRUZb7+s=', traceId: 'R+gxE9M1J6UTkIsOh7PMjg==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'rng-app',
      'random-result': undefined,
      'random-method': 'diceroll',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'R+gxE9M1J6UTkIsOh7PMjg==',
    id: 'iApIRUZb7+s=',
    startTime: '2024-10-23T13:06:59.048Z',
    hrStartTime: 1729688819048000000n,
    name: 'GET /',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-http',
      'otel.scope.version': '0.53.0',
      'http.url': 'http://app/',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/',
      'http.user_agent': 'node',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.18.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.18.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'OK',
      'http.route': '/',
      'span.kind': 'server'
    }
  }
];
