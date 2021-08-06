console.log('Enabling tracing via OpenTracing');
const {
	logConfig,
} = require('./utils.js');

logConfig();

const tracer = require('signalfx-tracing').init()
