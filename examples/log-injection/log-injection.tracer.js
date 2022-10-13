const { getInstrumentations } = require('@splunk/otel/lib/instrumentations');
const { defaultLogHook } = require('@splunk/otel/lib/instrumentations/logging');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');

// an example logHook to add common resource attributes to every log message
const logHook = (span, logRecord) => {
	// thrown errors in logHooks are ignored to avoid crashing due to instrumentation
	// logic. Deciding on using a try-catch comes down to the usecase and performance requirements.
	try {
		// defaultLogHook does the default behavior of adding service.[name, version] and deployment.environment
		// defaultLogHook(span, logRecord); // supported from 0.13
		logRecord['my.attribute'] = 'my.value';
	} catch (e) {
		console.error(e);
		throw e;
	}
};

require('@splunk/otel').start({
	serviceName: 'example',
	tracing: {
		instrumentations: [
			...getInstrumentations(),
			new PinoInstrumentation({
				logHook: logHook,
			}),
		],
	},
});
