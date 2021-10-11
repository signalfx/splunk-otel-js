const { diag, DiagConsoleLogger } = require('@opentelemetry/api');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { getEnv } = require('@opentelemetry/core');

// TODO: this is quite inconvenient
diag.setLogger(new DiagConsoleLogger(), getEnv().OTEL_LOG_LEVEL);

const provider = new NodeTracerProvider();
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation(),
  ],
});
