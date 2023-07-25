// a console.log from a previous run
module.exports = [
  {
    traceId: '0Iqbr5g8SjiaX3WlJBQyTA==',
    id: 'U9O4F1SzkzY=',
    startTime: '2022-06-03T13:06:01.752053248Z',
    name: 'GET',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    references: undefined,
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-http',
      'otel.library.version': '0.28.0',
      'http.url': 'http://app/',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.target': '/',
      'http.user_agent': 'got (https://github.com/sindresorhus/got)',
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
  },
  {
    traceId: '0Iqbr5g8SjiaX3WlJBQyTA==',
    id: 'CnIjaAfhsFM=',
    startTime: '2022-06-03T13:06:01.755319040Z',
    name: 'work',
    kind: 'internal',
    parentSpanId: 'U9O4F1SzkzY=',
    parent: { id: 'U9O4F1SzkzY=', traceId: '0Iqbr5g8SjiaX3WlJBQyTA==' },
    references: [],
    status: { code: undefined },
    attributes: {
      'otel.library.name': 'splunk-otel-example-mixed',
      'work.expected_duration': undefined,
      'work.my_parameter': undefined,
      'work.result': undefined,
      'span.kind': 'internal'
    }
  }
];
