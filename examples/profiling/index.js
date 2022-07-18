const { diag, DiagConsoleLogger, DiagLogLevel, trace, SpanStatusCode, context } = require('@opentelemetry/api');

// If OTEL_LOG_LEVEL env var is set, configure logger
if (process.env.OTEL_LOG_LEVEL) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[process.env.OTEL_LOG_LEVEL]);
}

const doWork = () => {
	console.log('before work');
	while (Date.now() - start < 2500) {}
	console.log('after work');
};

const start = Date.now();
const tracer = trace.getTracer('splunk-otel-example-profiling');
const span = tracer.startSpan('main');
const spanContext = trace.setSpan(context.active(), span);

// Span and Trace IDs are attached to the profiling samples
context.with(spanContext, doWork);

console.log('done!');
span.end();

setTimeout(() => {
	// wait for the spans to be flushed
	console.log('Profiling data exported');
}, 5000);
