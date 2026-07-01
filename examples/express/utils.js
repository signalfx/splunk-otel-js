const isConfigVarEntry = ([key, _value]) => {
  const lowercased = key.toLowerCase();
  return lowercased.includes('splunk') || lowercased.includes('otel');
};

const redactSecretEntry = ([key, value]) => {
  if (key.toLowerCase().includes('access_token')) {
    return [key, '<redacted>'];
  }
  return [key, value];
};

const parseRealmFromEndpoint = (endpoint) => {
  if (!endpoint || typeof endpoint !== 'string') {
    return undefined;
  }
  return endpoint.match(re)?.groups?.realm;
};

// has a sideeffect of populating the basic opentelemetry config environment variables
const populateEnv = () => {
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT && !process.env.SPLUNK_REALM) {
    const realm = parseRealmFromEndpoint(
      process.env.OTEL_EXPORTER_JAEGER_ENDPOINT ?? undefined
    );
    if (realm) {
      // Don't set it to empty for whatever reason
      process.env.SPLUNK_REALM = realm;
    }
  }
};
const logConfig = () => {
  console.log(
    fromEntries(
      Object.entries(process.env)
        .filter(isConfigVarEntry)
        .map(redactSecretEntry)
    )
  );
};
const fromEntries = (iterable) => {
  return [...iterable].reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});
};
const log = (...args) => {
  return console.log(new Date(), ...args);
};

module.exports = {
  log,
  logConfig,
  populateEnv,
};
