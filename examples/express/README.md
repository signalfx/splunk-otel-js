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
# Exposing ports for OTLP/gRPC and Jaeger from collector
docker run --name otel-collector -d -p 4317:4317 -p 14268:14268 otel/opentelemetry-collector
```

## Running

This example app can be run in following ways:

1. Uninstrumented
2. Instrumented via OTel SDK, exporting to locally running collector
3. Instrumented via OTel SDK, exporting to locally running collector using Jaeger Exporter
4. Instrumented via OTel SDK, exporting to Splunk APM using Jaeger Exporter
5. Instrumented via legacy OpenTracing SDK

### Uninstrumented

Original app files do not cointain any reference to neither OTel or OpenTracing, nor does it need the SDKs to be installed. To run the app as is, without tracing run the server and the client in different terminals:

```shell
node server.js
# In a separate terminal:
node client.js
```

### Instrumented via OTel SDK

To start collecting and exporting tracing data from the app it requires

1. Three additional packages to be installed, which are specified in `package.json` and were installed automatically during the setup:
    - `@opentelemetry/instrumentation-express`,
    - `@opentelemetry/instrumentation-http` and
    - `@splunk/otel`.
2. Configuration for the SDK.
3. SDK initialization before running the application.

All the following steps are done for you in the example:

1. Additional packages are already specified in the `package.json` file.
2. All the configuration is included in [an environment file, `.env.collector`](./.env.collector).
3. SDK initialization happens in [tracer.js](./tracer.js).

All that's left is to run it:

```shell
npm run server:collector
# In a separate terminal:
npm run client:collector

```

See the exact commands in [package.json](./package.json).

### Instrumented via OTel SDK, Jaeger Exporter

The [env file `.env.jaeger`](./.env.jaeger) showcases how to replace the default OTLP/gRPC Exporter with a Jaeger exporter. The configuration is similar to the default OTel SDK setup, but the exporter (`OTEL_TRACES_EXPORTER`) has to be replaced by the default Jaeger Exporter which is bundled with the SDK: `jaeger-thrift-http`.

That's it! To run the example with the Jaeger Exporter:

```shell
npm run server:jaeger
# In a separate terminal:
npm run client:jaeger
```

### Instrumented via OTel SDK, exporting to Splunk APM using Jaeger Exporter

Instead of using the OTel Collector to forward telemetry data to Splunk APM, you can also send it directly from the application. Once the `.env` file is created (see [.env.jaeger-splunk](./.env.jaeger-splunk) for an example) and the access token is replaced in the file, run the collector using the following commands:

```shell
npm run server
# In a separate terminal:
npm run client
```

If are not sure about the values to use for `.env`, but you're familiar with configuring the OpenTracing SDK, you can also use [.env.opentracing](./.env.opentracing) as the baseline configuration: The OTel configuration is automatically derived from the OpenTracing settings in the example (see [utils.js](./utils.js) for the conversions).

### Instrumented via legacy OpenTracing SDK

For comparison this example also includes the legacy OpenTracing SDK setup which can be run using predefined commands:

```shell
npm run server:opentracing
# In a separate terminal:
npm run client:opentracing
```

These commands require a configuration in the `.env` file compatible with the [SignalFX Tracing Library](https://github.com/signalfx/signalfx-nodejs-tracing). See the [example](./.env.opentracing).

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the [Apache Software License version 2.0](../../LICENSE).
