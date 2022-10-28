# Overview

This is a more extensive example that demonstrates tracing client and server side calls to an Express app with setting up tracing in different ways.
In all the cases the application logic in  [server.js](./server.js) and [client.js](./client.js) files stay exactly the same. The difference comes from:

1. The command used to run the application: to bootstrap with different tracing mechanism, we use `-r` option to require our tracing initialization script before the application code;
2. The tracing initialization script: see `tracer.*` files for different variants;
3. The environment variables to configure the traces: see `.env*` files for examples.

## Setup

Before you start, install the dependencies and run the collector for the examples that require it:

```shell
npm install
# Exposing ports for OTLP/gRPC and OTLP/HTTP from collector
docker run --name otel-collector -d -p 4317:4317 -p 4318:4318 otel/opentelemetry-collector
```

## Running

This example app can be run in following ways:

1. Uninstrumented
2. Instrumented via OTel SDK, exporting to locally running collector
3. Instrumented via OTel SDK, exporting directly to Splunk APM

### Uninstrumented

Original app files do not contain any references to OpenTelemetry, nor does it need the SDKs to be installed. To run the app as is, without tracing run the server and the client in different terminals:

```shell
node server.js
# In a separate terminal:
node client.js
```

### Instrumented via OTel SDK

All the following steps are done for you in the example:

1. `@splunk/otel` is already specified in the `package.json` file.
2. All the configuration is included in [an environment file, `.env.collector`](./.env.collector).
3. SDK initialization happens in [tracer.js](./tracer.js).

All that's left is to run it:

```shell
npm run server:collector
# In a separate terminal:
npm run client:collector

```

See the exact commands in [package.json](./package.json).

### Instrumented via OTel SDK, exporting directly to Splunk APM

Instead of using the OTel Collector to forward telemetry data to Splunk APM, you can also send it directly from the application. [.env.otlp-splunk](./.env.otlp-splunk) has the basic configuration for that. The access token and the realm should be configured with correct values. Run the example using the following commands:

```shell
npm run server:apm
# In a separate terminal:
npm run client:apm
```

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the [Apache Software License version 2.0](../../LICENSE).
