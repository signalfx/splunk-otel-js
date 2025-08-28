const { version: splunkOtelVersion } = require('../package.json');
const { dependencies } = require('../package-lock.json');
const { readFileSync } = require('fs');
const path = require('path');

exports.getReleaseMessage = (targetFileName, dirPackage) => {
  const changelogPath = path.resolve(__dirname, dirPackage, 'CHANGELOG.md')
  const { version } = require(path.resolve(__dirname, dirPackage, 'package.json'));

  const changelog = readFileSync(changelogPath, { encoding: 'utf-8' });
  const changeHeaderBegin = changelog.indexOf(`## ${version}`);

  if (changeHeaderBegin === -1) {
    throw new Error(`Unable to find version ${version} in release notes.`);
  }

  const changesBegin = changelog.indexOf('\n', changeHeaderBegin) + 1;

  const prevVersionMatch = /^##\s*\d+\.\d+\.\d+.*$/gm.exec(changelog.substring(changesBegin));
  const nextVersionBegin = prevVersionMatch ? prevVersionMatch.index : changelog.length

  const versionChanges = changelog.substring(changesBegin, changesBegin + nextVersionBegin - 1);

  const splunkOtelArtifactName = `splunk-otel-${splunkOtelVersion}.tgz`;

  if (targetFileName === splunkOtelArtifactName){
    const otelApiVersion = dependencies['@opentelemetry/api'].version;
    const otelCoreVersion = dependencies['@opentelemetry/core'].version;
    const otelInstrumentationVersion = dependencies['@opentelemetry/instrumentation-http'].version;

    return [
      '| Open Telemetry API | Core | Instrumentations |',
      '| --- | --- | --- |',
      `| ${otelApiVersion} | ${otelCoreVersion} | ${otelInstrumentationVersion} |`,
      '',
      '## Changes',
      versionChanges,
    ].join('\n');
  } else {
    return [
      '## Changes',
      versionChanges,
    ].join('\n');
  }
};
