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

async function downloadArtifact(octokit, owner, repo, runId, artifactName) {
  const { data: artifacts } = await octokit.rest.actions.listWorkflowRunArtifacts({
    owner,
    repo,
    run_id: runId,
    name: artifactName,
  });

  console.log('found artifacts for workflow', artifacts);

  const artifact = artifacts.artifacts.find(artifact => artifact.name === artifactName);
  
  if (artifact === undefined) {
    throw new Error(`unable to find artifact named ${artifactName}`);
  }

  const downloadedArtifact = await octokit.rest.actions.downloadArtifact({
    owner,
    repo,
    artifact_id: artifact.id,
    archive_format: 'zip',
  });

  console.log('downloaded', downloadedArtifact);
  
  return {
    name: artifact.name,
    data: downloadedArtifact.data
  };
}

function extractArtifact(artifact, targetFile) {
  const tempFile = 'artifact-temp.zip';

  console.log(`writing content to ${tempFile} and unzipping`);
  
  fs.writeFileSync(tempFile, Buffer.from(artifact.data));
  
  execSync(`unzip -o ${tempFile}`);

  const exists = fs.existsSync(targetFile);
  console.log(`${targetFile} was extracted: ${exists}`);
  
  if (!exists) {
    throw new Error(`${targetFile} was not found after extraction`);
  }

  return targetFile;
}

async function getBuildArtifact() {
  const packageArg = process.argv.find(arg => arg.startsWith('--package='));
  
  if (!packageArg) {
    throw new Error('Missing --package=artifact.tgz argument');
  }

  const targetFileName = packageArg.split('=')[1]; 
  console.log(`Target file: ${targetFileName}`);

  const octokit = new Octokit({ auth: process.env.PUBLIC_ARTIFACTS_TOKEN });
  const owner = process.env.GITHUB_OWNER ?? 'signalfx';
  const repo = process.env.GITHUB_REPO ?? 'splunk-otel-js';

  console.log('waiting for workflow results');

  const run = await waitForWorkflowRun({ octokit, owner, repo });

  console.log('found finished workflow run', run);

  const tgzName = `splunk-otel-${version}.tgz`
  
  if (targetFileName === tgzName) {
    // Download and extract main package artifact
    const splunkOtelArtifact = await downloadArtifact(octokit, owner, repo, run.id, tgzName);

    return extractArtifact(splunkOtelArtifact, targetFileName);
  } else {
    // Download and extract workspace packages artifact which contains all workspace packages
    const workspacePackageName = 'workspace-packages';
    const workspaceArtifact = await downloadArtifact(octokit, owner, repo, run.id, workspacePackageName);

    return extractArtifact(workspaceArtifact, targetFileName);
  }
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
