const { getInstrumentations } = require('@splunk/otel/lib/instrumentations');
const { PinoInstrumentation } = require('@opentelemetry/instrumentation-pino');
const { ResourceAttributes: RA } = require('@opentelemetry/semantic-conventions');

// an example logHook to add common resource attributes to every log message
const logHook = (span, logRecord) => {
	// thrown errors in logHooks are ignored to avoid crashing due to instrumentation
	// logic. Deciding on using a try-catch comes down to the usecase and performance requirements.
	try {
		logRecord['my.attribute'] = 'my.value';
	  logRecord['service.name'] = span.resource.attributes[RA.SERVICE_NAME];

	  const version = span.resource.attributes[RA.SERVICE_VERSION];
	  if (version !== undefined) {
	    logRecord['service.version'] = version;
	  }

	  const environment = span.resource.attributes[RA.DEPLOYMENT_ENVIRONMENT];
	  if (environment !== undefined) {
	    logRecord['service.environment'] = environment;
	  }
	} catch (e) {
		console.error(e);
		throw e;
	}
};

require('@splunk/otel').startTracing({
	serviceName: 'example',
	instrumentations: [
		...getInstrumentations(),
		new PinoInstrumentation({
			logHook: logHook,
		}),
	],
});
