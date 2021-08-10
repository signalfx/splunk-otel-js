const changelog = require('../CHANGELOG.json');
const { version } = require('../package.json');
const { dependencies } = require('../package-lock.json');

exports.getReleaseMessage = () => {
  const release = changelog.entries.find(entry => entry.version == version);
  if (!release) {
    throw new Error('Current version not found in CHANGELOG.json');
  }

  const commentTypes = Object.keys(release.comments);
  const changes = commentTypes.flatMap(type => {
    return release.comments[type].map(change => `* (${type}) ${change.comment} by ${change.author}`);
  });

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
    changes.join('\n'),
  ].join('\n');
};
