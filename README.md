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

> ## **Examples and developer documentation for version 1.x can be seen at [/tree/1.x](https://github.com/signalfx/splunk-otel-js/tree/1.x).**

The Splunk Distribution of [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) integrates with Splunk APM and automatically instruments your Node application to capture traces, collect runtime metrics, CPU and memory profiles.

This Splunk distribution comes with the following defaults:

- [W3C tracecontext and baggage propagation](https://www.w3.org/TR/trace-context).
- [OTLP exporter](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)
  configured to send spans to a locally running [OpenTelemetry Collector](https://github.com/open-telemetry/opentelemetry-collector) over gRPC
  (default endpoint: `http://localhost:4317`).
- Many bundled [instrumentations](#default-instrumentation-packages).

If you're currently using the SignalFx Tracing Library for Node and want to migrate to the Splunk Distribution of OpenTelemetry Node, see [Migrate from the SignalFx Tracing Library for JS](./MIGRATING.md).

## Get started

The following instructions assume that you're sending data to Splunk Observability Cloud using the [OpenTelemetry Collector](https://docs.splunk.com/Observability/gdi/opentelemetry/opentelemetry.html) running on localhost. If you're running a different setup, refer to the [configuration options](./docs/advanced-config.md) to customize your settings.

1. Install the `@splunk/otel` package:

```
npm install @splunk/otel --save
```

You can find a list of instrumentation packages supported out of the box [here](#default-instrumentation-packages).
To install additional instrumentations or provide your own, see [instrumentations](./docs/instrumentations.md).

2. Run node app with the `-r @splunk/otel/instrument` CLI argument

```
export OTEL_SERVICE_NAME=my-node-svc
node -r @splunk/otel/instrument app.js
```

That's it - the telemetry data is now sent to the locally running Opentelemetry Collector. You can also instrument your app programmatically as described [here](#instrument-with-code).

### Send data directly to Splunk Observability Cloud

In order to send traces directly to Splunk Observability Cloud, you need to:

1. Set `SPLUNK_REALM` to your Splunk APM realm (for example, `us0`).
1. Set the `SPLUNK_ACCESS_TOKEN` to your Splunk Observability Cloud [access token](https://docs.splunk.com/Observability/admin/authentication-tokens/api-access-tokens.html).

## Manually instrument an application<a name="instrument-with-code"></a>

You can also manually instrument your application by adding the following lines before everything else in your application.

```js
const { start } = require('@splunk/otel');

start({
  serviceName: 'my-node-service',
  endpoint: 'http://localhost:4317'
});

// rest of your application entry point script
```

`start()` accepts an optional `Options` argument. It can be used to customize many aspects of the observability pipeline. For example enabling runtime metrics and memory profiling:

```js
start({
  serviceName: 'my-node-service',
  metrics: { runtimeMetricsEnabled: true },
  profiling: { memoryProfilingEnabled: true }
});
```

For all of the possible options see [Advanced Configuration](./docs/advanced-config.md#advanced-configuration).

> `start` is destructive to Open Telemetry API globals. Any globals set before running `start` are overwritten.

## Correlate traces and logs

The Splunk Distribution of OpenTelemetry JS automatically injects trace metadata into logs so that Node.js logging libraries can access it. You can use trace metadata to correlate traces with log events and explore logs in Observability Cloud.

For more information, see [Correlating traces with logs](./docs/correlate-logs-traces.md).

## Default Instrumentation Packages<a name="default-instrumentation-packages"></a>

By default the following instrumentations will automatically be enabled:

* [`@opentelemetry/instrumentation-amqplib`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-amqplib)
* [`@opentelemetry/instrumentation-aws-sdk`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-aws-sdk)
* [`@opentelemetry/instrumentation-bunyan`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-bunyan)
* [`@opentelemetry/instrumentation-cassandra-driver`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-cassandra)
* [`@opentelemetry/instrumentation-connect`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-connect)
* [`@opentelemetry/instrumentation-dataloader`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-dataloader)
* [`@opentelemetry/instrumentation-dns`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-dns)
* [`@opentelemetry/instrumentation-express`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-express)
* [`@opentelemetry/instrumentation-fastify`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-fastify)
* [`@opentelemetry/instrumentation-generic-pool`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-generic-pool)
* [`@opentelemetry/instrumentation-graphql`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-graphql)
* [`@opentelemetry/instrumentation-grpc`](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-grpc)
* [`@opentelemetry/instrumentation-hapi`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-hapi)
* [`@opentelemetry/instrumentation-http`](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation-http)
* [`@opentelemetry/instrumentation-ioredis`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-ioredis)
* [`@opentelemetry/instrumentation-knex`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-knex)
* [`@opentelemetry/instrumentation-koa`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-koa)
* [`@opentelemetry/instrumentation-memcached`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-memcached)
* [`@opentelemetry/instrumentation-mongodb`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-mongodb)
* [`@opentelemetry/instrumentation-mysql`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-mysql)
* [`@opentelemetry/instrumentation-mysql2`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-mysql2)
* [`@opentelemetry/instrumentation-nestjs-core`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-nestjs-core)
* [`@opentelemetry/instrumentation-net`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-net)
* [`@opentelemetry/instrumentation-pg`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-pg)
* [`@opentelemetry/instrumentation-pino`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-pino)
* [`@opentelemetry/instrumentation-redis`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-redis)
* [`@opentelemetry/instrumentation-redis-4`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-redis-4)
* [`@opentelemetry/instrumentation-restify`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-restify)
* [`@opentelemetry/instrumentation-router`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-router)
* [`@opentelemetry/instrumentation-tedious`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/instrumentation-tedious)
* [`@opentelemetry/instrumentation-winston`](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-winston)
* [`opentelemetry-instrumentation-elasticsearch`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-elasticsearch)
* [`opentelemetry-instrumentation-kafkajs`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-kafkajs)
* [`opentelemetry-instrumentation-mongoose`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-mongoose)
* [`opentelemetry-instrumentation-sequelize`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-sequelize)
* [`opentelemetry-instrumentation-typeorm`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-typeorm)

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
