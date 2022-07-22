const { start, stop } = require('@splunk/otel');
const { diag, DiagConsoleLogger, DiagLogLevel, trace, SpanStatusCode, context } = require('@opentelemetry/api');

// If OTEL_LOG_LEVEL env var is set, configure logger
if (process.env.OTEL_LOG_LEVEL) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel[process.env.OTEL_LOG_LEVEL]);
}

// Profiling is still experimental and has to be enabled explicitly
start({
  // Tracing is enabled by default and is required for profiling
  profiling: {
    callstackInterval: 100,
    collectionDuration: 1_000,
  },
});

const doWork = () => {
  const start = Date.now();
  while (Date.now() - start < 2000) {}
};

// setTimeout has to be here because profiling is currently started asyncronously to avoid blocking the runtime.
// If we didn't we'd run stop before the profiling has started in the background.
setTimeout(() => {
  const tracer = trace.getTracer('splunk-otel-example-profiling');
  const span = tracer.startSpan('main');
  const spanContext = trace.setSpan(context.active(), span);

  console.log('starting spinning');
  // Span and Trace IDs are attached to the profiling samples
  context.with(spanContext, doWork);

  console.log('done!');
  span.end();

  // Stop profiling to flush the collected samples
  stop();
}, 10);
