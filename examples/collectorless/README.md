
# Overview

This example demonstrates tracing client and server side calls to an Express app and setting up the the easiest export mechanism - the collectorless export - to a Splunk APM backend without any changes to the original code.

## Setup

Before starting install dependencies:

```shell
npm install
```

## Running

This example app can be run in 3 ways:

1. Uninstrumented
2. Instrumented via OpenTelemetry(OTel) SDK
3. Instrumented via legacy OpenTracing SDK

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
If you are unsure about the values to use for `.env.example` but are familiar with configuring OpenTracing SDK, you can alternatively also use [.env.opentracing.example](./.env.opentracing.example) as the basis - the OTel configuration will be automatically derived from that in this example(see [utils.js](./utils.js) for the conversions).

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
