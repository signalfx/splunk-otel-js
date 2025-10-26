// a console.log from a previous run
module.exports = [
  {
    traceId: '/CPSIftQ+4KaXvc6MwPgpA==',
    id: 'aKhxgzZwZts=',
    startTime: '2025-04-23T16:23:17.999Z',
    hrStartTime: 1745425397999000000n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: 'KuHbi8YjbYQ=',
    parent: { id: 'KuHbi8YjbYQ=', traceId: '/CPSIftQ+4KaXvc6MwPgpA==' },
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
    traceId: '/CPSIftQ+4KaXvc6MwPgpA==',
    id: 'UguSGVeTfmc=',
    startTime: '2025-04-23T16:23:17.999Z',
    hrStartTime: 1745425397999000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: 'KuHbi8YjbYQ=',
    parent: { id: 'KuHbi8YjbYQ=', traceId: '/CPSIftQ+4KaXvc6MwPgpA==' },
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
    traceId: '/CPSIftQ+4KaXvc6MwPgpA==',
    id: 'Gs96PqcyHdQ=',
    startTime: '2025-04-23T16:23:17.999Z',
    hrStartTime: 1745425397999000000n,
    name: 'request handler - /hello',
    kind: 'internal',
    parentSpanId: 'KuHbi8YjbYQ=',
    parent: { id: 'KuHbi8YjbYQ=', traceId: '/CPSIftQ+4KaXvc6MwPgpA==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.48.1',
      'http.route': '/hello',
      'express.name': '/hello',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '/CPSIftQ+4KaXvc6MwPgpA==',
    id: 'hG2ec8CTM8c=',
    startTime: '2025-04-23T16:23:17.999Z',
    hrStartTime: 1745425397999000000n,
    name: 'hello',
    kind: 'internal',
    parentSpanId: 'Gs96PqcyHdQ=',
    parent: { id: 'Gs96PqcyHdQ=', traceId: '/CPSIftQ+4KaXvc6MwPgpA==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'splunk-otel-example-basic',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '/CPSIftQ+4KaXvc6MwPgpA==',
    id: 'KuHbi8YjbYQ=',
    startTime: '2025-04-23T16:23:17.998Z',
    hrStartTime: 1745425397998000000n,
    name: 'GET /hello',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-http',
      'otel.scope.version': '0.200.0',
      'http.url': 'http://app/hello',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/hello',
      'http.user_agent': 'node',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.20.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.20.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'CREATED',
      'http.route': '/hello',
      'span.kind': 'server'
    }
  }
];
