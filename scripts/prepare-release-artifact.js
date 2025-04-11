const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const { Octokit } = require('octokit');

const { version } = require('../package.json');

const WORKFLOW_TIMEOUT_MS = 15 * 60 * 1000;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWorkflowRun(context) {
  const { data: workflows } = await context.octokit.rest.actions.listWorkflowRunsForRepo({
    owner: context.owner,
    repo: context.repo,
  });

  const runs = workflows.workflow_runs;

  const commitSha = process.env.CI_COMMIT_SHA;
  const run = runs.find(wf => wf.head_sha === commitSha && wf.name.toLowerCase() === 'continuous integration');

  if (run === undefined) {
    throw new Error(`Workflow not found for commit ${commitSha}`);
  }

  return run;
}

async function waitForWorkflowRun(context) {
  const waitUntil = Date.now() + WORKFLOW_TIMEOUT_MS;

  for (;;) {
    let run = await fetchWorkflowRun(context);

    if (run.status !== 'completed') {
      if (Date.now() > waitUntil) {
        throw new Error('Timed out waiting for workflow to finish');
      }

      console.log('run not yet completed, waiting...');
      await sleep(10_000);

      continue;
    }

    if (run.status === 'completed' && run.conclusion !== 'success') {
      throw new Error(`Workflow not successful conclusion=${run.conclusion}`);
    }

    return run;
  }
}

async function getBuildArtifact() {
  const octokit = new Octokit({ auth: process.env.PUBLIC_ARTIFACTS_TOKEN });
  const owner = process.env.GITHUB_OWNER ?? 'signalfx';
  const repo = process.env.GITHUB_REPO ?? 'splunk-otel-js';

  console.log('waiting for workflow results');

  const run = await waitForWorkflowRun({ octokit, owner, repo });

  console.log('found finished workflow run', run);

  const { data: artifacts } = await octokit.rest.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: run.id,
    per_page: 100,
  });

  console.log('found artifacts for workflow', artifacts);

  const tgzName = `splunk-otel-${version}.tgz`
  const packageArtifact = artifacts.artifacts.find(artifact => artifact.name === tgzName);

  if (packageArtifact === undefined) {
    throw new Error(`unable to find artifact named ${tgzName}`);
  }

  const dlArtifact = await octokit.rest.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: packageArtifact.id,
    archive_format: 'zip',
  });

  console.log('downloaded', dlArtifact);

  const tempFile = 'artifact-temp.zip';

  console.log(`writing content to ${tempFile} and unzipping`);

  fs.writeFileSync(tempFile, Buffer.from(dlArtifact.data));

  execSync(`unzip -o ${tempFile}`);

  const exists = fs.existsSync(packageArtifact.name);
  console.log(`${packageArtifact.name} was extracted: ${exists}`);

  if (!exists) {
    throw new Error(`${packageArtifact.name} was not found after extraction`);
  }

  return packageArtifact.name;
}

async function prepareReleaseArtifact() {
  const artifactName = await getBuildArtifact();

  fs.mkdirSync('dist', { recursive: true });
  fs.renameSync(artifactName, path.join('dist', artifactName));

  console.log('successfully prepared artifacts');
}

prepareReleaseArtifact().catch(e => {
  console.error(e);
  process.exit(1);
});
