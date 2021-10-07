const fs = require('fs');
const path = require('path');
const { Octokit } = require("octokit");

const { version } = require('../package.json');
const { getReleaseMessage } = require('./release-message');

async function createRelease() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

  const {
    data: { login },
  } = await octokit.rest.users.getAuthenticated();
  console.log(`Successfully authenticated as ${login}.`);

  const tag = `v${version}`;
  console.log(`Tag: ${tag}`);

  const owner = process.env.GITHUB_OWNER ?? 'signalfx';
  const repo = process.env.GITHUB_REPO ?? 'splunk-otel-js';
  console.log(`Repo: ${owner}/${repo}`);

  const commit = process.env.CI_COMMIT_SHA;
  console.log(`Commit: ${commit}`);

  console.log(`Creating tag ${tag} at ${commit}.`);
  await octokit.rest.git.createTag({
    owner,
    repo,
    tag,
    message: `Release ${tag}`,
    object: commit,
    type: 'commit',
  });
  console.log(`Created tag ${tag}.`);

  console.log(`Creating release ${tag} at ${process.env.CI_COMMIT_SHA}.`);
  const { data: githubRelease } = await octokit.rest.repos.createRelease({
    owner,
    repo,
    tag_name: tag,
    body: getReleaseMessage(),
  });
  console.log(`Release created ${githubRelease.id}.`);

  const distDirectory = path.join(__dirname, '..', 'dist');
  console.log(`Uploading assets from ${distDirectory}.`);
  for (const fileName of fs.readdirSync(distDirectory)) {
    const filePath = path.join(distDirectory, fileName);
    if (fs.statSync(filePath).isDirectory()) {
      continue;
    }

    console.log(`Uploading ${fileName} at ${filePath}.`);
    await octokit.rest.repos.uploadReleaseAsset({
      owner,
      repo,
      release_id: githubRelease.id,
      name: fileName,
      data: fs.readFileSync(filePath),
    });
  }
  console.log('Uploaded assets.');
}

createRelease().catch(e => {
  console.error(e);
  process.exit(1);
});
