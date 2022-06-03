// a console.log from a previous run
module.exports = [{
  traceId: 'eH5wrxGD/9lH3X5c/nj5UA==',
  id: 'qqOPnIVYJuE=',
  startTime: '2021-09-16T12:31:55.016052992Z',
  name: 'HTTP GET',
  kind: 'server',
  parentSpanId: undefined,
  parent: undefined,
  references: undefined,
  status: { code: undefined },
  attributes: {
    'otel.library.name': '@opentelemetry/instrumentation-http',
    'otel.library.version': '0.24.0',
    'http.url': 'http://app/hello',
    'http.host': 'app',
    'net.host.name': 'app',
    'http.method': 'GET',
    'http.target': '/hello',
    'http.user_agent': 'got (https://github.com/sindresorhus/got)',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:172.20.0.3',
    'net.host.port': undefined,
    'net.peer.ip': '::ffff:172.20.0.4',
    'net.peer.port': undefined,
    'http.status_code': undefined,
    'http.status_text': 'CREATED',
    'span.kind': 'server',
    'status.code': undefined
  }
}, {
  traceId: 'eH5wrxGD/9lH3X5c/nj5UA==',
  id: '7m4qr+paz/Q=',
  startTime: '2021-09-16T12:31:55.019908608Z',
  name: 'hello',
  kind: 'internal',
  parentSpanId: 'qqOPnIVYJuE=',
  parent: { id: 'qqOPnIVYJuE=', traceId: 'eH5wrxGD/9lH3X5c/nj5UA==' },
  references: [],
  status: { code: undefined },
  attributes: {
    'otel.library.name': 'splunk-otel-example-basic',
    'span.kind': 'internal',
    'status.code': undefined
  }
}];
