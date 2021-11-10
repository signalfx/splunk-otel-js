const fs = require('fs');
const path = require('path');
const { Octokit } = require('octokit');

const { version } = require('../package.json');
const { Console } = require('console');

async function getBuildArtifact() {
  const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
  //const octokit = new Octokit();

  const owner = process.env.GITHUB_OWNER ?? 'signalfx';
  const repo = process.env.GITHUB_REPO ?? 'splunk-otel-js';


  const {data: workflows} = await octokit.rest.actions.listWorkflowRunsForRepo({
    owner,
    repo,
    branch: process.env.CI_COMMIT_BRANCH ?? 'main',
  });

  const runs = workflows.workflow_runs;

  console.log('workflows');
  console.log(runs);

  const run = runs.find(wf => wf.head_sha === process.env.CI_COMMIT_SHA);

  const {data: artifacts} = await octokit.rest.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: run.id,
  });

  const tgzName = `splunk-otel-${version}.tgz`
  const packageArtifact = artifacts.artifacts.find(artifact => artifact.name === tgzName);

  console.log(packageArtifact);

  const dlArtifact = await octokit.rest.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: packageArtifact.id
  });

  console.log(dlArtifact);
}

getBuildArtifact().catch(e => {
  console.error(e);
  process.exit(1);
});
