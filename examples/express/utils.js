
const isConfigVarEntry = ([key, value]) => {
  const lowercased = key.toLowerCase();
  return lowercased.includes('splunk') || lowercased.includes('signal') || lowercased.includes('otel');
};
const redactSecretEntry = ([key, value]) => {
  if (key.toLowerCase().includes('access_token')) {
    return [key, '<redacted>'];
  }
  return [key, value];
};
// has a sideeffect of populating the basic opentelemetry config environment variables
const populateEnv = () => {
  if (!process.env.SPLUNK_ACCESS_TOKEN) {
    process.env.SPLUNK_ACCESS_TOKEN = process.env.SIGNALFX_ACCESS_TOKEN;
  }
  if (!process.env.OTEL_SERVICE_NAME) {
    process.env.OTEL_SERVICE_NAME = process.env.SIGNALFX_SERVICE_NAME;
  }
  if (!process.env.OTEL_EXPORTER_JAEGER_ENDPOINT) {
    process.env.OTEL_EXPORTER_JAEGER_ENDPOINT = process.env.SIGNALFX_ENDPOINT_URL;
  }
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = (
      process.env.SIGNALFX_ENDPOINT_URL || process.env.OTEL_EXPORTER_JAEGER_ENDPOINT
    );
  }
  if (!process.env.OTEL_RESOURCE_ATTRIBUTES && process.env.SIGNALFX_SPAN_TAGS) {
    process.env.OTEL_RESOURCE_ATTRIBUTES = process.env.SIGNALFX_SPAN_TAGS.split(',')
      .map((pair) => {
        const [key, value] = pair.split(':');
        return `${key}=${value}`;
      })
      .join(',');
  }
  if (!process.env.OTEL_LOG_LEVEL && process.env.SIGNALFX_TRACING_DEBUG) {
    process.env.OTEL_LOG_LEVEL = !!process.env.SIGNALFX_TRACING_DEBUG ? 'DEBUG' : 'INFO';
  }
};
const logConfig = () => {
  console.log(
    Object.fromEntries(
      Object.entries(process.env)
        .filter(isConfigVarEntry)
        .map(redactSecretEntry)
    )
  );
};

const log = (...args) => {
  return console.log(new Date(), ...args);
};

module.exports = {
  log,
  logConfig,
  populateEnv,
};
