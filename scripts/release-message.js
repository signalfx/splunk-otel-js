const { version } = require('../package.json');
const { dependencies } = require('../package-lock.json');

exports.getReleaseMessage = () => {
  const otelApiVersion = dependencies['@opentelemetry/api'].version;
  const otelCoreVersion = dependencies['@opentelemetry/core'].version;
  const otelInstrumentationVersion = dependencies['@opentelemetry/instrumentation-http'].version;

  return [
    '| Open Telemetry API | Core | Instrumentations |',
    '| --- | --- | --- |',
    `| ${otelApiVersion} | ${otelCoreVersion} | ${otelInstrumentationVersion} |`,
    '',
    '## Changes',
    '',
  ].join('\n');
};
