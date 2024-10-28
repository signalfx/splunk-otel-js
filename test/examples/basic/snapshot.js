// a console.log from a previous run
module.exports = [
  {
    traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==',
    id: '7D4S0IHq48A=',
    startTime: '2024-10-23T11:49:39.286Z',
    hrStartTime: 1729684179286000000n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: 'KUT43ADmiVo=',
    parent: { id: 'KUT43ADmiVo=', traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==' },
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
    traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==',
    id: 'lcfZ8FvVJJ8=',
    startTime: '2024-10-23T11:49:39.291Z',
    hrStartTime: 1729684179291000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: 'KUT43ADmiVo=',
    parent: { id: 'KUT43ADmiVo=', traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==' },
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
    traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==',
    id: '6TdoTvXE+I4=',
    startTime: '2024-10-23T11:49:39.293Z',
    hrStartTime: 1729684179293000000n,
    name: 'request handler - /hello',
    kind: 'internal',
    parentSpanId: 'KUT43ADmiVo=',
    parent: { id: 'KUT43ADmiVo=', traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.42.0',
      'http.route': '/hello',
      'express.name': '/hello',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==',
    id: '1Al/kbAgRyM=',
    startTime: '2024-10-23T11:49:39.294Z',
    hrStartTime: 1729684179294000000n,
    name: 'hello',
    kind: 'internal',
    parentSpanId: 'KUT43ADmiVo=',
    parent: { id: 'KUT43ADmiVo=', traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'splunk-otel-example-basic',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'LAWqC9bxJ/QJ4eXmjf6wpQ==',
    id: 'KUT43ADmiVo=',
    startTime: '2024-10-23T11:49:39.271Z',
    hrStartTime: 1729684179271000000n,
    name: 'GET /hello',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-http',
      'otel.scope.version': '0.53.0',
      'http.url': 'http://app/hello',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/hello',
      'http.user_agent': 'node',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.18.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.18.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'CREATED',
      'http.route': '/hello',
      'span.kind': 'server'
    }
  }
];
