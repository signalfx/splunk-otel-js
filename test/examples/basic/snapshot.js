// a console.log from a previous run
module.exports = [{
  traceId: '1unWMDRTxRjt1RAej3swrQ==',
  id: 'oHaqp2656b8=',
  startTime: '2022-06-03T12:53:51.105606912Z',
  name: 'HTTP GET',
  kind: 'server',
  parentSpanId: undefined,
  parent: undefined,
  references: undefined,
  status: { code: undefined },
  attributes: {
    'otel.library.name': '@opentelemetry/instrumentation-http',
    'otel.library.version': '0.28.0',
    'http.url': 'http://app/hello',
    'http.host': 'app',
    'net.host.name': 'app',
    'http.method': 'GET',
    'http.target': '/hello',
    'http.user_agent': 'got (https://github.com/sindresorhus/got)',
    'http.flavor': '1.1',
    'net.transport': 'ip_tcp',
    'net.host.ip': '::ffff:172.18.0.3',
    'net.host.port': undefined,
    'net.peer.ip': '::ffff:172.18.0.4',
    'net.peer.port': undefined,
    'http.status_code': undefined,
    'http.status_text': 'CREATED',
    'span.kind': 'server'
  }
}, {
  traceId: '1unWMDRTxRjt1RAej3swrQ==',
  id: '7y49G1AMtmA=',
  startTime: '2022-06-03T12:53:51.108744192Z',
  name: 'hello',
  kind: 'internal',
  parentSpanId: 'oHaqp2656b8=',
  parent: { id: 'oHaqp2656b8=', traceId: '1unWMDRTxRjt1RAej3swrQ==' },
  references: [],
  status: { code: undefined },
  attributes: {
    'otel.library.name': 'splunk-otel-example-basic',
    'span.kind': 'internal'
  }
}];
