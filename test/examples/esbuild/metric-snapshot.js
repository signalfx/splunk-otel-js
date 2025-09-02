const serviceName = process.env.OTEL_SERVICE_NAME;

if (!serviceName){
  throw new Error('OTEL_SERVICE_NAME is not set');
}

module.exports = {
  'process.runtime.nodejs.memory.heap.total': {
    unit : 'By',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: {
      'service.name'           : serviceName,
      'deployment.environment' : 'dev',
    },
  },
  'process.runtime.nodejs.memory.heap.used': {
    unit : 'By',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
  'process.runtime.nodejs.memory.rss': {
    unit : 'By',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
  'process.runtime.nodejs.event_loop.lag.max': {
    unit : 'ns',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
  'process.runtime.nodejs.event_loop.lag.min': {
    unit : 'ns',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
  'process.runtime.nodejs.memory.gc.size': {
    unit : 'By',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
  'process.runtime.nodejs.memory.gc.pause': {
    unit : 'By',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
  'process.runtime.nodejs.memory.gc.count': {
    unit : '1',
    scope: 'splunk-otel-js-runtime-metrics',
    resource: { 'service.name': serviceName },
  },
};