module.exports = [
  {
    traceId: '53KrOcBQVVYj2VgJ26ACcA==',
    id: 'Dz6x7tP6Eg4=',
    startTime: '2025-10-22T11:04:23.308Z',
    hrStartTime: 1761131063308000000n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: '96vR6IwdTzQ=',
    parent: { id: '96vR6IwdTzQ=', traceId: '53KrOcBQVVYj2VgJ26ACcA==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.47.1',
      'http.route': '/',
      'express.name': 'query',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '53KrOcBQVVYj2VgJ26ACcA==',
    id: '3Gi+ARkkOC0=',
    startTime: '2025-10-22T11:04:23.308Z',
    hrStartTime: 1761131063308000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: '96vR6IwdTzQ=',
    parent: { id: '96vR6IwdTzQ=', traceId: '53KrOcBQVVYj2VgJ26ACcA==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.47.1',
      'http.route': '/',
      'express.name': 'expressInit',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '53KrOcBQVVYj2VgJ26ACcA==',
    id: 'tdag4T9pqyc=',
    startTime: '2025-10-22T11:04:23.309Z',
    hrStartTime: 1761131063309000000n,
    name: 'request handler - /main',
    kind: 'internal',
    parentSpanId: '96vR6IwdTzQ=',
    parent: { id: '96vR6IwdTzQ=', traceId: '53KrOcBQVVYj2VgJ26ACcA==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.47.1',
      'http.route': '/main',
      'express.name': '/main',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '53KrOcBQVVYj2VgJ26ACcA==',
    id: 'VTw/v/yOmy0=',
    startTime: '2025-10-22T11:04:23.309Z',
    hrStartTime: 1761131063309000000n,
    name: 'main',
    kind: 'internal',
    parentSpanId: '96vR6IwdTzQ=',
    parent: { id: '96vR6IwdTzQ=', traceId: '53KrOcBQVVYj2VgJ26ACcA==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'splunk-otel-example-esbuild-cjs',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '53KrOcBQVVYj2VgJ26ACcA==',
    id: '96vR6IwdTzQ=',
    startTime: '2025-10-22T11:04:23.307Z',
    hrStartTime: 1761131063307000000n,
    name: 'GET /main',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-http',
      'otel.scope.version': '0.203.0',
      'http.url': 'http://app/main',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/main',
      'http.user_agent': 'node',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.20.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.20.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'CREATED',
      'http.route': '/main',
      'span.kind': 'server'
    }
  }
];
