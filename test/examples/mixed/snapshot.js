// a console.log from a previous run
module.exports = [
  {
    traceId: 'VlRfCOMPRqQs5pkzwwgEGQ==',
    id: 'RO/3VuV9hMU=',
    startTime: '2025-04-25T07:23:12.271Z',
    hrStartTime: 1745565792271000000n,
    name: 'work',
    kind: 'internal',
    parentSpanId: 'NV6Lo+dFbkQ=',
    parent: { id: 'NV6Lo+dFbkQ=', traceId: 'VlRfCOMPRqQs5pkzwwgEGQ==' },
    status: { code: undefined },
    attributes: {
      'otel.scope.name': 'splunk-otel-example-mixed',
      'work.expected_duration': undefined,
      'work.my_parameter': undefined,
      'work.result': undefined,
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'VlRfCOMPRqQs5pkzwwgEGQ==',
    id: 'NV6Lo+dFbkQ=',
    startTime: '2025-04-25T07:23:12.270Z',
    hrStartTime: 1745565792270000000n,
    name: 'GET',
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
      'span.kind': 'server'
    }
  }
];
