const { trace, SpanStatusCode, context } = require('@opentelemetry/api');

const log = require('pino')();
const doWork = () => {
	log.info('before work');
	while (Date.now() - start < 500) {}
	log.info('after work work');
};

// There is no active span right now so no trace id to report.
// Following log event will not have trace data injected.
log.info('starting...');

const start = Date.now();
const tracer = trace.getTracer('splunk-otel-example-log-injection');
const span = tracer.startSpan('main');
const spanContext = trace.setSpan(context.active(), span);

// This will run a function inside a context which has an active span.
context.with(spanContext, doWork);

// Even though the span has not ended yet it's not active in current context
// anymore and thus will not be logged.
log.info('done!');
span.end();
