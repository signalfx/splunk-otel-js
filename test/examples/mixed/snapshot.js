// a console.log from a previous run
module.exports = [
  {
    traceId: '/pCytNplYFQSLCxtMUCv8g==',
    id: '7Moln4ajdLY=',
    startTime: '2024-10-23T12:26:15.117Z',
    hrStartTime: 1729686375117000000n,
    name: 'work',
    kind: 'internal',
    parentSpanId: 'qhrhxw7WAiE=',
    parent: { id: 'qhrhxw7WAiE=', traceId: '/pCytNplYFQSLCxtMUCv8g==' },
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
    traceId: '/pCytNplYFQSLCxtMUCv8g==',
    id: 'qhrhxw7WAiE=',
    startTime: '2024-10-23T12:26:15.101Z',
    hrStartTime: 1729686375101000000n,
    name: 'GET',
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
      'span.kind': 'server'
    }
  }
];
