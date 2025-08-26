module.exports = [
  {
    traceId: 'H5yEgwBZEIhWo6aSFVNMhw==',
    id: 'LXA03SJRHDQ=',
    startTime: '2025-04-25T07:30:31.059Z',
    hrStartTime: 1745566231059000000n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: 'BYp4p1vcsvY=',
    parent: { id: 'BYp4p1vcsvY=', traceId: 'H5yEgwBZEIhWo6aSFVNMhw==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.48.1',
      'express.name': 'query',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'H5yEgwBZEIhWo6aSFVNMhw==',
    id: '6LnXzzwPue0=',
    startTime: '2025-04-25T07:30:31.059Z',
    hrStartTime: 1745566231059000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: 'BYp4p1vcsvY=',
    parent: { id: 'BYp4p1vcsvY=', traceId: 'H5yEgwBZEIhWo6aSFVNMhw==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.48.1',
      'express.name': 'expressInit',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'H5yEgwBZEIhWo6aSFVNMhw==',
    id: 'XY4BEnnqUDA=',
    startTime: '2025-04-25T07:30:31.059Z',
    hrStartTime: 1745566231059000000n,
    name: 'request handler - /',
    kind: 'internal',
    parentSpanId: 'BYp4p1vcsvY=',
    parent: { id: 'BYp4p1vcsvY=', traceId: 'H5yEgwBZEIhWo6aSFVNMhw==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.48.1',
      'http.route': '/',
      'express.name': '/',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'H5yEgwBZEIhWo6aSFVNMhw==',
    id: 'waJXy75/5gw=',
    startTime: '2025-04-25T07:30:31.060Z',
    hrStartTime: 1745566231060000000n,
    name: 'calculate-random',
    kind: 'internal',
    parentSpanId: 'XY4BEnnqUDA=',
    parent: { id: 'XY4BEnnqUDA=', traceId: 'H5yEgwBZEIhWo6aSFVNMhw==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'rng-app',
      'random-result': undefined,
      'random-method': 'diceroll',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'H5yEgwBZEIhWo6aSFVNMhw==',
    id: 'BYp4p1vcsvY=',
    startTime: '2025-04-25T07:30:31.057Z',
    hrStartTime: 1745566231057000000n,
    name: 'GET /',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-http',
      'otel.scope.version': '0.200.0',
      'http.url': 'http://app/',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/',
      'http.user_agent': 'node',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.20.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.20.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'OK',
      'http.route': '/',
      'span.kind': 'server'
    }
  }
];
