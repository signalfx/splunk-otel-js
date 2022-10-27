<p align="center">
  <img alt="Stable" src="https://img.shields.io/badge/status-stable-informational?style=for-the-badge">
  <a href="https://github.com/signalfx/splunk-otel-js/releases">
    <img alt="GitHub release (latest by date)" src="https://img.shields.io/github/v/release/signalfx/splunk-otel-js?include_prereleases&style=for-the-badge">
  </a>
  <a href="https://github.com/signalfx/gdi-specification/releases/tag/v1.2.0">
    <img alt="Splunk GDI specification" src="https://img.shields.io/badge/GDI-1.2.0-blueviolet?style=for-the-badge">
  </a>
  <img alt="npm" src="https://img.shields.io/npm/v/@splunk/otel?style=for-the-badge">
  <img alt="node-current" src="https://img.shields.io/node/v/@splunk/otel?style=for-the-badge">
  <img alt="Codecov" src="https://img.shields.io/codecov/c/github/signalfx/splunk-otel-js?style=for-the-badge&token=XKXjEQKGaK">
  <img alt="GitHub branch checks state" src="https://img.shields.io/github/workflow/status/signalfx/splunk-otel-js/Continuous%20Integration/main?style=for-the-badge">
</p>

# Splunk Distribution of OpenTelemetry for Node.js

> ## **Documentation for the current stable version (1.x) can be viewed [here](https://quickdraw.splunk.com/redirect/?product=Observability&location=nodejs.application&version=current).**
> ## **To access version 1.x examples and developer documentation, see [/tree/1.x](https://github.com/signalfx/splunk-otel-js/tree/1.x).**

The Splunk Distribution of [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) automatically instruments your Node application to capture and report distributed traces to Splunk APM.

This Splunk distribution comes with the following defaults:

- [W3C tracecontext and baggage propagation](https://www.w3.org/TR/trace-context).
- [OTLP exporter](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)
  configured to send spans to a locally running [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) over gRPC
  (default endpoint: `localhost:4317`).
- Unlimited default limits for [configuration options](#trace-configuration) to
  support full-fidelity traces.

If you're currently using the SignalFx Tracing Library for Node and want to migrate to the Splunk Distribution of OpenTelemetry Node, see [Migrate from the SignalFx Tracing Library for JS](./MIGRATING.md).

## Get started

The following instructions assume that you're sending data to Splunk Observability Cloud using the [OpenTelemetry Collector](https://docs.splunk.com/Observability/gdi/opentelemetry/opentelemetry.html) running on localhost. If you're running a different setup, refer to the [configuration options](./docs/advanced-config.md) to customize your settings.

1. Install the `@splunk/otel` package:

```
npm install @splunk/otel --save
```

You can find a list of instrumentation packages supported out of the box [here](#default-instrumentation-packages).
To install additional instrumentations or provide your own, see [instrumentations](./docs/instrumentations.md).

1. Run node app with the `-r @splunk/otel/instrument` CLI argument

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

1. Set `SPLUNK_REALM` to your Splunk APM realm (for example, `us0`).
1. Set the `SPLUNK_ACCESS_TOKEN` to your Splunk Observability Cloud [access token](https://docs.splunk.com/Observability/admin/authentication-tokens/api-access-tokens.html).

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
const { start } = require('@splunk/otel');

start();

// rest of your application entry point script
```
`start()` accept an optional `Options` argument. It can be used to customize many aspects of the observability pipeline. For example:

```js
start({
  serviceName: 'my-node-service',
});
```

> `start` is destructive to Open Telemetry API globals. Any globals set before running `start` are overwritten.

## Default Instrumentation Packages<a name="default-instrumentation-packages"></a>

By default the following instrumentations will automatically be enabled if installed. In order to use
any of these instrumentations, you'll need to install them with npm and then run your app with `-r @splunk/otel/instrument` flag as described above.

* `@opentelemetry/instrumentation-amqplib`
* `@opentelemetry/instrumentation-aws-lambda`
* `@opentelemetry/instrumentation-aws-sdk`
* `@opentelemetry/instrumentation-bunyan`
* `@opentelemetry/instrumentation-cassandra-driver`
* `@opentelemetry/instrumentation-connect`
* `@opentelemetry/instrumentation-dns`
* `@opentelemetry/instrumentation-express`
* `@opentelemetry/instrumentation-fastify`
* `@opentelemetry/instrumentation-fs`
* `@opentelemetry/instrumentation-generic-pool`
* `@opentelemetry/instrumentation-graphql`
* `@opentelemetry/instrumentation-grpc`
* `@opentelemetry/instrumentation-hapi`
* `@opentelemetry/instrumentation-http`
* `@opentelemetry/instrumentation-ioredis`
* `@opentelemetry/instrumentation-knex`
* `@opentelemetry/instrumentation-koa`
* `@opentelemetry/instrumentation-memcached`
* `@opentelemetry/instrumentation-mongodb`
* `@opentelemetry/instrumentation-mysql`
* `@opentelemetry/instrumentation-mysql2`
* `@opentelemetry/instrumentation-nestjs-core`
* `@opentelemetry/instrumentation-net`
* `@opentelemetry/instrumentation-pg`
* `@opentelemetry/instrumentation-pino`
* `@opentelemetry/instrumentation-redis`
* `@opentelemetry/instrumentation-restify`
* `@opentelemetry/instrumentation-tedious`
* `@opentelemetry/instrumentation-winston`
* `opentelemetry-instrumentation-elasticsearch`
* `opentelemetry-instrumentation-kafkajs`
* `opentelemetry-instrumentation-mongoose`
* `opentelemetry-instrumentation-sequelize`
* `opentelemetry-instrumentation-typeorm`

You can find more instrumentation packages over at the [OpenTelemetry Registry](https://opentelemetry.io/registry/?language=js) and enable them manually as described above.

**Note that many of the instrumentation libraries offered by OpenTelemetry are still experimental.**

## Troubleshooting

For troubleshooting issues with the Splunk Distribution of OpenTelemetry JS, see [Troubleshooting](./docs/troubleshooting.md).

# License

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js).
It is licensed under the terms of the Apache Software License version 2.0. See [the
license file](./LICENSE) for more details.

>ℹ️&nbsp;&nbsp;SignalFx was acquired by Splunk in October 2019. See [Splunk SignalFx](https://www.splunk.com/en_us/investor-relations/acquisitions/signalfx.html) for more information.
