# Overview

This is a more extensive example that demonstrates tracing client and server side calls to an Express app with setting up tracing in different ways.
In all the cases the application logic in  [server.js](./server.js) and [client.js](./client.js) files stay exactly the same. The difference comes from:

1. The command used to run the application: to bootstrap with different tracing mechanism, we use `-r` option to require our tracing initialization script before the application code;
2. The tracing initialization script: see `tracer.*` files for different variants;
3. The environment variables to configure the traces: see `.env*` files for examples.

## Setup

Before starting install dependencies:

```shell
npm install
```

## Running

This example app can be run in following ways:

1. Uninstrumented
2. Instrumented via OTel SDK
3. Instrumented via OTel SDK and Jaeger Exporter
4. Instrumented via OTel SDK and exporting to locally running collector
5. Instrumented via legacy OpenTracing SDK

### Uninstrumented

Original app files do not cointain any reference to neither OTel or OpenTracing, nor does it need the SDKs to be installed. To run the app as is, without tracing run the server and the client in different terminals:

```shell
node server.js
# in a separate terminal:
node client.js
```

### Instrumented via OTel SDK

To start collecting and exporting tracing data from the app it requires

1. Three additional packages to be installed, which are specified in `package.json` and were installed automatically during the setup:
    - `@opentelemetry/instrumentation-express`,
    - `@opentelemetry/instrumentation-http` and
    - `@splunk/otel`.
2. Configuration for the SDK.
3. SDK initialization in [tracer.js](./tracer.js).

Once `.env` file is filled in with access token(see file [.env.example](./.env.example)) the app can be run by setting the environment variables and requiring SDK initialization just before the application code:

```shell
npm run server
# in a separate terminal:
npm run client
```

See the exact commands in [package.json](./package.json).
If unsure about the values to use for `.env.example` but familiar with configuring OpenTracing SDK, one can alternatively also use [.env.opentracing.example](./.env.opentracing.example) as the basis - the OTel configuration will be automatically derived from that in this example(see [utils.js](./utils.js) for the conversions).

### Instrumented via OTel SDK, Jaeger Exporter

There's an [tracer setup](./tracer.jaeger.js) to showcase replacing the default OTLP/HTTP exporter with one that exports in Jaeger format. The configuration is similar to the plain OTel SDK setup, but

1. `@opentelemetry/exporter-jaeger` package has to be installed and the factory initiating the Exporter has to be passed to `startTracing`;
2. The endpoint(`OTEL_EXPORTER_JAEGER_ENDPOINT`) for Splunk's APM has to be replaced by one that accepts Jaeger formatted tracing data: `https://ingest.<realm>.signalfx.com/v2/trace`.

That's it! To run the example with the Jaeger Exporter:

```shell
npm run server:jaeger
# in a separate terminal:
npm run client:jaeger
```

### Instrumented via OTel SDK, exporting to locally running collector

Instead of sending telemetry data directly to Splunk APM API, one can also use OTel Collector to as a forwarder or an endpoint.
There is an exmample [.env](./.env.collector) file included, which following commands use:

```shell
# make sure the collector is running
docker run --name otel-collector -d -p 55681:55681 otel/opentelemetry-collector
# run the example server
npm run server:collector
# in a separate terminal:
npm run client:collector
```

### Instrumented via legacy OpenTracing SDK

For comparison this example also includes the legacy OpenTracing SDK setup which can be run using predefined commands:

```shell
npm run server:opentracing
# in a separate terminal:
npm run client:opentracing
```

These commands require [SignalFX Tracing Library](https://github.com/signalfx/signalfx-nodejs-tracing)-compatible configuration in the `.env`(see the [example](./.env.opentracing.example)).

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the [Apache Software License version 2.0](https://github.com/signalfx/splunk-otel-js/LICENSE).
