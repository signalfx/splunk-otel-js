const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const { version } = require('../package.json');
const { Console } = require('console');

async function getBuildArtifact() {
  //const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  const octokit = new Octokit();

  const owner = process.env.GITHUB_OWNER ?? 'signalfx';
  const repo = process.env.GITHUB_REPO ?? 'splunk-otel-js';


  const workflows = octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    branch: process.env.CI_COMMIT_BRANCH ?? 'main',
  });

  console.log('workflows');
  console.log(workflows);
}

getBuildArtifact().catch(e => {
  console.error(e);
  process.exit(1);
});
