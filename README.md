<p align="center">
  <img alt="Beta" src="https://img.shields.io/badge/status-beta-informational?style=for-the-badge">
 <a href="https://github.com/signalfx/splunk-otel-js/releases">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/signalfx/splunk-otel-js?include_prereleases&style=for-the-badge">
  </a>
  <img alt="npm" src="https://img.shields.io/npm/v/@splunk/otel?style=for-the-badge">
  <img alt="node-current" src="https://img.shields.io/node/v/@splunk/otel?style=for-the-badge">
  <img alt="Codecov" src="https://img.shields.io/codecov/c/github/signalfx/splunk-otel-js?style=for-the-badge&token=XKXjEQKGaK">
  <img alt="GitHub branch checks state" src="https://img.shields.io/github/checks-status/signalfx/splunk-otel-js/main?style=for-the-badge">
</p>

# Splunk Distribution of OpenTelemetry for Node.js

The Splunk Distribution of [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) automatically instruments your Node application to capture and report distributed traces to Splunk APM.

This Splunk distribution comes with the following defaults:

- [W3C tracecontext and baggage propagation](https://www.w3.org/TR/trace-context).
- [OTLP exporter](https://www.npmjs.com/package/@opentelemetry/exporter-collector-grpc)
  configured to send spans to a locally running [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) over gRPC
  (default endpoint: `localhost:4317`).
- Unlimited default limits for [configuration options](#trace-configuration) to
  support full-fidelity traces.

If you're currently using the SignalFx Tracing Library for Node and want to
migrate to the Splunk Distribution of OpenTelemetry Node, see [Migrate from
the SignalFx Tracing Library for JS](./MIGRATING.md).

## Get started

The following instructions assume that you're sending data to Splunk Observability Cloud using the [OpenTelemetry Collector](https://docs.splunk.com/Observability/gdi/opentelemetry/opentelemetry.html) running on localhost. If you're running a
different setup, refer to the [configuration options](./docs/advanced-config.md) to customize your settings.

1. Install the `@splunk/otel` package:

```
npm install @splunk/otel --save
```

2. Install the instrumentation packages for your library or framework:

```
npm install @opentelemetry/instrumentation-http --save
```

You can find a list of instrumentation packages supported out of the box [here](#default-instrumentation-packages).

To install packages in addition to the default ones, see [Plugins](./docs/plugins.md).

3. Run node app with the `-r @splunk/otel/instrument` CLI argument

```
export OTEL_SERVICE_NAME=my-node-svc
node -r @splunk/otel/instrument app.js
```

That's it - the telemetry data is now sent to the locally running Opentelemetry Collector. You can also instrument your app programmatically as described [here](#instrument-with-code).

> Note: If you are using npm 6 or older, it'll warn you about missing peer
> dependencies. All of these dependencies are instrumentation packages and are
> completely optional. You can install the ones you need and ignore the rest.
> npm 7+ supports optional peer dependencies feature and will not complain
> about this.

### Send data directly to Splunk Observability Cloud

In order to send traces directly to Splunk Observability Cloud, you need to:

1. Set `OTEL_TRACES_EXPORTER` to `"jaeger-thrift-splunk"` to use the Jaeger exporter.
2. Set `OTEL_EXPORTER_JAEGER_ENDPOINT` to
   `https://ingest.<realm>.signalfx.com/v2/trace` where `realm` is your
   Splunk APM realm (for example, `https://ingest.us0.signalfx.com/v2/trace`).
3. Set the `SPLUNK_ACCESS_TOKEN` to your Splunk Observability Cloud [access token](https://docs.splunk.com/Observability/admin/authentication-tokens/api-access-tokens.html).
## Automatically instrument an application

You can use the `-r` CLI flag to preload the instrumentation module and automatically instrument your Node.js application.
For example, if you normally started your application as follows:

```bash
node index.js
```

Then you can automatically instrument your application by running

```bash
node -r @splunk/otel/instrument index.js
```

## Correlate traces and logs

The Splunk Distribution of OpenTelemetry JS automatically injects trace metadata into logs so that Node.js logging libraries can access it. You can use trace metadata to correlate traces with log events and explore logs in Observability Cloud.

For more information, see [Correlating traces with logs](./docs/correlate-logs-traces.md).

## Manually instrument an application<a name="instrument-with-code"></a>

You can also manually instrument your application by adding the following lines before everything else in your application.

```js
const { startTracing } = require('@splunk/otel');

startTracing();

// rest of your application entry point script
```
`startTracing()` accept an optional `Options` argument. It can be used to customize many aspects of the tracing pipeline. For example:

```js
startTracing({
  serviceName: 'my-node-service',
});
```

> `startTracing` is destructive to Open Telemetry API globals. We provide the `stopTracing` method, but it won't revert to OTel API globals set before `startTracing` was run, it will only disable globals, which `startTracing` set.

## Default Instrumentation Packages<a name="default-instrumentation-packages"></a>

By default the following instrumentations will automatically be enabled if installed. In order to use
any of these instrumentations, you'll need to install them with npm and then run your app with `-r @splunk/otel/instrument` flag as described above.

```
@opentelemetry/instrumentation-dns
@opentelemetry/instrumentation-express
@opentelemetry/instrumentation-graphql
@opentelemetry/instrumentation-grpc
@opentelemetry/instrumentation-hapi
@opentelemetry/instrumentation-http
@opentelemetry/instrumentation-ioredis
@opentelemetry/instrumentation-koa
@opentelemetry/instrumentation-mongodb
@opentelemetry/instrumentation-mysql
@opentelemetry/instrumentation-net
@opentelemetry/instrumentation-pg
opentelemetry-instrumentation-amqplib
opentelemetry-instrumentation-aws-sdk
opentelemetry-instrumentation-elasticsearch
opentelemetry-instrumentation-kafkajs
opentelemetry-instrumentation-mongoose
opentelemetry-instrumentation-sequelize
opentelemetry-instrumentation-typeorm
```

The following logging library instrumentations are supported:

```
@opentelemetry/instrumentation-bunyan
@opentelemetry/instrumentation-pino
@opentelemetry/instrumentation-winston
```

You can find more instrumentation packages over at the [OpenTelemetry Registry](https://opentelemetry.io/registry/?language=js) and enable them manually as described above.

## Troubleshooting

For troubleshooting issues with the Splunk Distribution of OpenTelemetry JS, see [Troubleshooting](./docs/troubleshooting.md).

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the Apache Software License version 2.0. See [the
license file](./LICENSE) for more details.
