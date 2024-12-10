# Releasing Splunk OpenTelemetry Node

This document explains the steps required to publish a new release of splunk-opentelemetry Node package to npm.

Release process:

1. [Checkout a release branch](#step-1)
2. [Generate changelog and version](#step-2)
3. [Submit changes for review](#step-3)
4. [Merge the PR](#step-4)
5. [Verify the newly released npm package](#step-5)

## 1. Checkout a release branch <a href="step-1"></a>

Checkout a new branch from main with name equal to `release/v<VERSION_NUMBER>`.
So if you intend to release `1.2.0`, create a branch named `release/v1.2.0`

## 2. Update the changelog <a href="step-2"></a>

Add the list of changes to `CHANGELOG.md`. Keep with the subtitle convention, e.g. `## 2.0.0`.

## 3. Submit changes for review <a href="step-3"></a>

Commit the changes and submit them for review.
The commit title should be `Release v<VERSION_NUMBER>` and the description should be all the changes,
additions and deletions this version will ship with. This can be copied as-is from the CHANGELOG file.

## 4. Merge the PR <a href="step-4"></a>

Once the PR is approved, you need to merge it. The rest of the process is automated. To start the release process, you need to push a signed tag `v<version>` to the internal Splunk mirror of this repository.

## 5. Verify the newly released npm package <a href="step-5"></a>

Go to the internal Splunk mirror of this repository and verify that the pipeline job for your new version was successful.

Go to [https://www.npmjs.com/package/@splunk/otel](https://www.npmjs.com/package/@splunk/otel) and verify the new package was published. It may take a few minutes for the npmjs.com web interface to reflect the new package but it should be installable instantly.
