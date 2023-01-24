// a console.log from a previous run
module.exports = [
  {
    traceId: '/9GShGd4h/tJ1Yei1rzV8A==',
    id: '2PYWumUB8/Q=',
    startTime: '2022-10-27T15:28:23.685136896Z',
    name: 'GET /hello',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    references: undefined,
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-http',
      'otel.library.version': '0.33.0',
      'http.url': 'http://app/hello',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/hello',
      'http.user_agent': 'got (https://github.com/sindresorhus/got)',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:0.0.0.0',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:0.0.0.0',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'CREATED',
      'http.route': '/hello',
      'span.kind': 'server'
    }
  },
  {
    traceId: '/9GShGd4h/tJ1Yei1rzV8A==',
    id: 'aBuv7mmBta4=',
    startTime: '2022-10-27T15:28:23.696763904Z',
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: '2PYWumUB8/Q=',
    parent: { id: '2PYWumUB8/Q=', traceId: '/9GShGd4h/tJ1Yei1rzV8A==' },
    references: [],
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-express',
      'otel.library.version': '0.31.2',
      'http.route': '/',
      'express.name': 'query',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '/9GShGd4h/tJ1Yei1rzV8A==',
    id: 'ijCrFyvrC5A=',
    startTime: '2022-10-27T15:28:23.699226624Z',
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: '2PYWumUB8/Q=',
    parent: { id: '2PYWumUB8/Q=', traceId: '/9GShGd4h/tJ1Yei1rzV8A==' },
    references: [],
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-express',
      'otel.library.version': '0.31.2',
      'http.route': '/',
      'express.name': 'expressInit',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '/9GShGd4h/tJ1Yei1rzV8A==',
    id: 'nUmcea9N0DM=',
    startTime: '2022-10-27T15:28:23.700294656Z',
    name: 'hello',
    kind: 'internal',
    parentSpanId: '2PYWumUB8/Q=',
    parent: { id: '2PYWumUB8/Q=', traceId: '/9GShGd4h/tJ1Yei1rzV8A==' },
    references: [],
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-express',
      'otel.library.version': '0.31.2',
      'http.route': '/hello',
      'express.name': '/hello',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: '/9GShGd4h/tJ1Yei1rzV8A==',
    id: 'ugJHEI0w8TA=',
    startTime: '2022-10-27T15:28:23.700867328Z',
    name: 'hello',
    kind: 'internal',
    parentSpanId: '2PYWumUB8/Q=',
    parent: { id: '2PYWumUB8/Q=', traceId: '/9GShGd4h/tJ1Yei1rzV8A==' },
    references: [],
    status: { code: undefined },
    attributes: {
      'otel.library.name': 'splunk-otel-example-basic',
      'span.kind': 'internal'
    }
  }
];
