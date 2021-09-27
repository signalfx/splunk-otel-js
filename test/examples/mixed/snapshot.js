// a console.log from a previous run
module.exports = [
  {
    traceId: 'jCTyhwnMjMDFpLaAn05Qpg==',
    id: 'KhZoHOXKy/c=',
    startTime: '2021-09-21T09:14:06.403828992Z',
    name: 'HTTP GET',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    references: undefined,
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-http',
      'otel.library.version': '0.23.0',
      'http.url': 'http://app/',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.route': '/',
      'http.target': '/',
      'http.user_agent': 'got (https://github.com/sindresorhus/got)',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.20.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.20.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'OK',
      'span.kind': 'server',
      'status.code': undefined
    }
  }, {
    traceId: 'jCTyhwnMjMDFpLaAn05Qpg==',
    id: 'D5DaqpNonAc=',
    startTime: '2021-09-21T09:14:06.412206080Z',
    name: 'work',
    kind: 'internal',
    parentSpanId: 'KhZoHOXKy/c=',
    parent: { id: 'KhZoHOXKy/c=', traceId: 'jCTyhwnMjMDFpLaAn05Qpg==' },
    references: [],
    status: { code: undefined },
    attributes: {
      'otel.library.name': 'splunk-otel-example-mixed',
      'work.expected_duration': undefined,
      'work.my_parameter': undefined,
      'work.result': undefined,
      'span.kind': 'internal',
      'status.code': undefined
    }
  }
];
