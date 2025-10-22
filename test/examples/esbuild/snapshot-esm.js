module.exports = [
  {
    traceId: 'uGzmFl5I0OQTAefqpIuh0w==',
    id: 'zGRO942s6co=',
    startTime: '2025-10-22T12:45:55.409Z',
    hrStartTime: 1761137155409000000n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: 'Jw0akJQ85eU=',
    parent: { id: 'Jw0akJQ85eU=', traceId: 'uGzmFl5I0OQTAefqpIuh0w==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.54.3',
      'express.name': 'query',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'uGzmFl5I0OQTAefqpIuh0w==',
    id: 'qhOF18xYhdc=',
    startTime: '2025-10-22T12:45:55.410Z',
    hrStartTime: 1761137155410000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: 'Jw0akJQ85eU=',
    parent: { id: 'Jw0akJQ85eU=', traceId: 'uGzmFl5I0OQTAefqpIuh0w==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.54.3',
      'express.name': 'expressInit',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'uGzmFl5I0OQTAefqpIuh0w==',
    id: 'Z4feA4myakQ=',
    startTime: '2025-10-22T12:45:55.410Z',
    hrStartTime: 1761137155410000000n,
    name: 'request handler - /main',
    kind: 'internal',
    parentSpanId: 'Jw0akJQ85eU=',
    parent: { id: 'Jw0akJQ85eU=', traceId: 'uGzmFl5I0OQTAefqpIuh0w==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': '@opentelemetry/instrumentation-express',
      'otel.scope.version': '0.54.3',
      'http.route': '/main',
      'express.name': '/main',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'uGzmFl5I0OQTAefqpIuh0w==',
    id: 'tZtYt0uySu8=',
    startTime: '2025-10-22T12:45:55.410Z',
    hrStartTime: 1761137155410000000n,
    name: 'main',
    kind: 'internal',
    parentSpanId: 'Z4feA4myakQ=',
    parent: { id: 'Z4feA4myakQ=', traceId: 'uGzmFl5I0OQTAefqpIuh0w==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'splunk-otel-example-esbuild-esm',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'uGzmFl5I0OQTAefqpIuh0w==',
    id: 'Jw0akJQ85eU=',
    startTime: '2025-10-22T12:45:55.408Z',
    hrStartTime: 1761137155408000000n,
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
