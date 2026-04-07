import { readFileSync } from 'fs';
import path from 'path';

const { dependencies } = JSON.parse(
  readFileSync(new URL('../package-lock.json', import.meta.url), 'utf-8')
);

export const getReleaseMessage = (packageDir) => {
  const changelogPath = path.resolve(
    import.meta.dirname,
    packageDir,
    'CHANGELOG.md'
  );
  const { version } = JSON.parse(
    readFileSync(
      path.resolve(import.meta.dirname, packageDir, 'package.json'),
      'utf-8'
    )
  );

  const changelog = readFileSync(changelogPath, { encoding: 'utf-8' });
  const changeHeaderBegin = changelog.indexOf(`## ${version}`);

  if (changeHeaderBegin === -1) {
    throw new Error(`Unable to find version ${version} in release notes.`);
  }

  const changesBegin = changelog.indexOf('\n', changeHeaderBegin) + 1;

  const prevVersionMatch = /^##\s*\d+\.\d+\.\d+.*$/gm.exec(
    changelog.substring(changesBegin)
  );
  const nextVersionBegin = prevVersionMatch
    ? prevVersionMatch.index
    : changelog.length;

  const versionChanges = changelog.substring(
    changesBegin,
    changesBegin + nextVersionBegin - 1
  );

  const rootDir = '../';

  if (packageDir === rootDir) {
    const otelApiVersion = dependencies['@opentelemetry/api'].version;
    const otelCoreVersion = dependencies['@opentelemetry/core'].version;
    const otelInstrumentationVersion =
      dependencies['@opentelemetry/instrumentation-http'].version;

    return [
      '| Open Telemetry API | Core | Instrumentations |',
      '| --- | --- | --- |',
      `| ${otelApiVersion} | ${otelCoreVersion} | ${otelInstrumentationVersion} |`,
      '',
      '## Changes',
      versionChanges,
    ].join('\n');
  } else {
    return ['## Changes', versionChanges].join('\n');
  }
};
