const { start, stop } = require('@splunk/otel');
const { diag, DiagConsoleLogger, DiagLogLevel, trace, SpanStatusCode, context } = require('@opentelemetry/api');

// If OTEL_LOG_LEVEL env var is set, configure logger
if (process.env.OTEL_LOG_LEVEL) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[process.env.OTEL_LOG_LEVEL]);
}

// Profiling is still experimental and have to be enabled explicitly
start({
	profiling: {
		callstackInterval: 50,
		collectionDuration: 1_000,
	},
});

const doWork = () => {
	console.log('before work');
	const start = Date.now();
	while (Date.now() - start < 2500) {}
	console.log('after work');
};

// This has to be here because of starting profiling asyncronously.
// If we didn't we'd get start and collect commands too close together and collect would return no stacktraces
setTimeout(() => {
	const tracer = trace.getTracer('splunk-otel-example-profiling');
	const span = tracer.startSpan('main');
	const spanContext = trace.setSpan(context.active(), span);

	// Span and Trace IDs are attached to the profiling samples
	context.with(spanContext, doWork);

	console.log('done!');
	span.end();

	// Stop profiling to flush the collected samples
	stop();
}, 100);

setTimeout(() => {
	// Stop profiling to flush the collected samples
	stop();
}, 3000);
