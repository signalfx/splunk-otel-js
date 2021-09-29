# Overview

This is a more extensive example that demonstrates tracing client and server side calls to an Express app with setting up tracing in different ways.
In all the cases the application logic in  [server.js](./server.js) and [client.js](./client.js) files stay exactly the same. The difference comes from:

1. The command used to run the application: to bootstrap with different tracing mechanism, we use `-r` option to require our tracing initialization script before the application code;
2. The tracing initialization script: see `tracer.*` files for different variants;
3. The environment variables to configure the traces: see `.env*` files for examples.

## Setup

Before starting install dependencies and run the collector for the examples which require it:

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

All those steps are done for you in this example:

1. Additional packages are already specified in the `package.json`.
2. All the configuration is included in [an environment file `.env.collector`](./.env.collector).
3. SDK intitialization in [tracer.js](./tracer.js).

All that's left is to run it:

```shell
npm run server:collector
# In a separate terminal:
npm run client:collector

```

See the exact commands in [package.json](./package.json).

### Instrumented via OTel SDK, Jaeger Exporter

There's an [tracer setup](./tracer.jaeger.js) to showcase replacing the default OTLP/gRPC Exporter with one that exports in Jaeger format. The configuration is similar to the plain OTel SDK setup, but the Exporter(`OTEL_TRACES_EXPORTER`) has to be replaced by the default Jaeger Exporter which is bundled with the SDK: `jaeger-thrift-http`.

That's it! To run the example with the Jaeger Exporter:

```shell
npm run server:jaeger
# In a separate terminal:
npm run client:jaeger
```

### Instrumented via OTel SDK, exporting to Splunk APM using Jaeger Exporter

Instead of using OTel Collector to forward the telemetry data to Splunk APM, one can also send it directly from the application.
Once `.env` file is created(see file [.env.jaeger-splunk](./.env.jaeger-splunk) for an example) and the access token is substituted into the file. Run it using that:

```shell
npm run server
# In a separate terminal:
npm run client
```

If unsure about the values to use for `.env` but familiar with configuring OpenTracing SDK, one can alternatively also use [.env.opentracing](./.env.opentracing) as the basis - the OTel configuration will be automatically derived from that in this example(see [utils.js](./utils.js) for the conversions).

### Instrumented via legacy OpenTracing SDK

For comparison this example also includes the legacy OpenTracing SDK setup which can be run using predefined commands:

```shell
npm run server:opentracing
# In a separate terminal:
npm run client:opentracing
```

These commands require [SignalFX Tracing Library](https://github.com/signalfx/signalfx-nodejs-tracing)-compatible configuration in the `.env`(see the [example](./.env.opentracing)).

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the [Apache Software License version 2.0](https://github.com/signalfx/splunk-otel-js/LICENSE).
