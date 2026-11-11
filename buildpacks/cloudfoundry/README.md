# Cloud Foundry buildpack

Automatic Node.js instrumentation for classic Cloud Foundry (PCF / TAS), with
bundled agent dependencies.

## Use

Replace `X.Y.Z` with a [released version](https://github.com/signalfx/splunk-otel-js/releases)
and set a Collector endpoint reachable from the app in `manifest.yml`:

```yaml
applications:
  - name: my-node-app
    stack: cflinuxfs5
    buildpacks:
      - https://github.com/signalfx/splunk-otel-js/releases/download/vX.Y.Z/splunk-otel-js-cloudfoundry-X.Y.Z.zip
      - nodejs_buildpack
    env:
      OTEL_SERVICE_NAME: my-node-app
      OTEL_EXPORTER_OTLP_ENDPOINT: https://otel-collector.example.com
      OTEL_EXPORTER_OTLP_PROTOCOL: http/protobuf
```

Run `cf push`. Keep `nodejs_buildpack` last and ensure it supports `cflinuxfs5`.
Use a Node.js version supported by the [agent](../../package.json) and foundation.
Custom buildpack URLs must be allowed; otherwise use an operator-installed buildpack name.

`OPTIMIZE_MEMORY=true` currently overwrites the agent preload in the Node.js
buildpack's default start command. Use `NODE_OPTIONS` for heap limits instead,
leaving room for other memory. Restage after changing `OPTIMIZE_MEMORY`.

Restage after buildpack upgrades. Restart after environment changes. Set
`SPLUNK_OTEL_NODEJS_ENABLED=false` to disable the preload. See
[agent configuration](https://quickdraw.splunk.com/redirect/?product=Observability&version=current&location=nodejs.application.gdi).

## Build and test

Use the compiled CI npm tarball, including Linux native prebuilds:

```sh
npm run package:cloudfoundry -- splunk-otel-X.Y.Z.tgz
CF_BUILDPACK_ZIP=dist/splunk-otel-js-cloudfoundry-X.Y.Z.zip npm run test:cloudfoundry
```
