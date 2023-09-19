module.exports = [
  {
    traceId: 'neZpe/CP+vAd5/rhg0Tw3A==',
    id: 'fe+RxrZ76pE=',
    startTime: '2023-09-18T20:16:38.412999936Z',
    hrStartTime: 1695068198412999936n,
    name: 'middleware - query',
    kind: 'internal',
    parentSpanId: 'NVeO5hUT2bw=',
    parent: { id: 'NVeO5hUT2bw=', traceId: 'neZpe/CP+vAd5/rhg0Tw3A==' },
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-express',
      'otel.library.version': '0.33.0',
      'http.route': '/',
      'express.name': 'query',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'neZpe/CP+vAd5/rhg0Tw3A==',
    id: 'CnuvgyiHryk=',
    startTime: '2023-09-18T20:16:38.416Z',
    hrStartTime: 1695068198416000000n,
    name: 'middleware - expressInit',
    kind: 'internal',
    parentSpanId: 'NVeO5hUT2bw=',
    parent: { id: 'NVeO5hUT2bw=', traceId: 'neZpe/CP+vAd5/rhg0Tw3A==' },
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-express',
      'otel.library.version': '0.33.0',
      'http.route': '/',
      'express.name': 'expressInit',
      'express.type': 'middleware',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'neZpe/CP+vAd5/rhg0Tw3A==',
    id: 'ZXuWjxuKTqw=',
    startTime: '2023-09-18T20:16:38.416999936Z',
    hrStartTime: 1695068198416999936n,
    name: 'request handler - /',
    kind: 'internal',
    parentSpanId: 'NVeO5hUT2bw=',
    parent: { id: 'NVeO5hUT2bw=', traceId: 'neZpe/CP+vAd5/rhg0Tw3A==' },
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-express',
      'otel.library.version': '0.33.0',
      'http.route': '/',
      'express.name': '/',
      'express.type': 'request_handler',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'neZpe/CP+vAd5/rhg0Tw3A==',
    id: '2rGvSI5L/p4=',
    startTime: '2023-09-18T20:16:38.417999872Z',
    hrStartTime: 1695068198417999872n,
    name: 'calculate-random',
    kind: 'internal',
    parentSpanId: 'NVeO5hUT2bw=',
    parent: { id: 'NVeO5hUT2bw=', traceId: 'neZpe/CP+vAd5/rhg0Tw3A==' },
    status: { code: undefined },
    attributes: {
      'otel.library.name': 'rng-app',
      'random-result': undefined,
      'random-method': 'diceroll',
      'span.kind': 'internal'
    }
  },
  {
    traceId: 'neZpe/CP+vAd5/rhg0Tw3A==',
    id: 'NVeO5hUT2bw=',
    startTime: '2023-09-18T20:16:38.400999936Z',
    hrStartTime: 1695068198400999936n,
    name: 'GET /',
    kind: 'server',
    parentSpanId: undefined,
    parent: undefined,
    status: { code: undefined },
    attributes: {
      'otel.library.name': '@opentelemetry/instrumentation-http',
      'otel.library.version': '0.41.2',
      'http.url': 'http://app/',
      'http.host': 'app',
      'net.host.name': 'app',
      'http.method': 'GET',
      'http.scheme': 'http',
      'http.target': '/',
      'http.user_agent': 'undici',
      'http.flavor': '1.1',
      'net.transport': 'ip_tcp',
      'net.host.ip': '::ffff:172.31.0.3',
      'net.host.port': undefined,
      'net.peer.ip': '::ffff:172.31.0.4',
      'net.peer.port': undefined,
      'http.status_code': undefined,
      'http.status_text': 'OK',
      'http.route': '/',
      'span.kind': 'server'
    }
  }
];
