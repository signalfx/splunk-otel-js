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
  <img alt="GitHub branch checks state" src="https://img.shields.io/github/actions/workflow/status/signalfx/splunk-otel-js/.github/workflows/ci.yml?branch=main&style=for-the-badge">
</p>

# Splunk Distribution of OpenTelemetry for Node.js

The Splunk Distribution of [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js) integrates with Splunk APM and automatically instruments your Node application to capture traces, collect runtime metrics, and CPU and memory profiles.

This distribution comes with the following defaults:

- [W3C tracecontext and baggage propagation](https://www.w3.org/TR/trace-context)
- [OTLP exporter](https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-grpc)
  configured to send spans to a locally running OpenTelemetry Collector over gRPC
- Many bundled [instrumentations](#default-instrumentation-packages)

If you're using the SignalFx Tracing Library for Node and want to migrate to the Splunk Distribution of OpenTelemetry Node, see [Migrate from the SignalFx Tracing Library for NodeJS](https://quickdraw.splunk.com/redirect/?product=Observability&version=current&location=nodejs.application.migrate) in the official documentation.

## Get started

For complete instructions on how to get started with the Splunk Distribution of OpenTelemetry JS, see [Instrument a Node application for Splunk Observability Cloud](https://quickdraw.splunk.com/redirect/?product=Observability&version=current&location=nodejs.application.gdi) in the official documentation.

## Correlate traces and logs

The Splunk Distribution of OpenTelemetry JS automatically injects trace metadata into logs so that Node.js logging libraries can access it. You can use trace metadata to correlate traces with log events and explore logs in Observability Cloud.

For more information, see [Connect Node.js trace data with logs for Splunk Observability Cloud](https://quickdraw.splunk.com/redirect/?product=Observability&version=current&location=nodejs.application.tracelogs) in the official documentation.

## Default instrumentation packages<a name="default-instrumentation-packages"></a>

By default, the following instrumentations are active:

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
* [`@opentelemetry/instrumentation-mongoose`](https://www.npmjs.com/package/@opentelemetry/instrumentation-mongoose)
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
* [`opentelemetry-instrumentation-sequelize`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-sequelize)
* [`opentelemetry-instrumentation-typeorm`](https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-typeorm)

You can find more instrumentation packages in the [OpenTelemetry Registry](https://opentelemetry.io/registry/?language=js).

## Troubleshooting

For troubleshooting issues with the Splunk Distribution of OpenTelemetry JS, see [TroTroubleshoot Node.js instrumentation for Splunk Observability Cloud](https://quickdraw.splunk.com/redirect/?product=Observability&version=current&location=nodejs.application.tshoot) in the official documentation.

> Examples and developer documentation for version 1.x is available at [/tree/1.x](https://github.com/signalfx/splunk-otel-js/tree/1.x).

# License

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of [OpenTelemetry JS](https://github.com/open-telemetry/opentelemetry-js).
It is licensed under the terms of the Apache Software License version 2.0. See [the
license file](./LICENSE) for more details.

>ℹ️&nbsp;&nbsp;SignalFx was acquired by Splunk in October 2019. See [Splunk SignalFx](https://www.splunk.com/en_us/investor-relations/acquisitions/signalfx.html) for more information.
