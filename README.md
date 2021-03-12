# Splunk distribution of OpenTelemetry JS 

[![CircleCI](https://circleci.com/gh/signalfx/splunk-otel-js.svg?style=svg)](https://circleci.com/gh/signalfx/splunk-otel-js)
[![codecov](https://codecov.io/gh/signalfx/splunk-otel-js/branch/main/graph/badge.svg?token=XKXjEQKGaK)](https://codecov.io/gh/signalfx/splunk-otel-js)

The Splunk distribution of [OpenTelemetry
JS](https://github.com/open-telemetry/opentelemetry-js) provides
multiple installable packages that automatically instruments your Node 
application to capture and report distributed traces to Splunk APM.

This Splunk distribution comes with the following defaults:

- [B3 context propagation](https://github.com/openzipkin/b3-propagation).
- [Jaeger thrift
  exporter](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-jaeger)
  configured to send spans to a locally running [SignalFx Smart
  Agent](https://docs.signalfx.com/en/latest/apm/apm-getting-started/apm-smart-agent.html)
  (`http://localhost:9080/v1/trace`).
- Unlimited default limits for [configuration options](#trace-configuration) to
  support full-fidelity traces.

If you're currently using the SignalFx Tracing Library for Node and want to
migrate to the Splunk Distribution of OpenTelemetry Node, see [Migrate from
the SignalFx Tracing Library for JS](migration.md).

> :construction: This project is currently in **BETA**.

## Getting Started

Assuming the default Splunk APM setup with SignalFx Smart Agent running on localhost. If you're running a
different setup, refer to the [configuration options](#env-config-options) below to customize trace export endpoint
and other behaviour.

1. Install @splunk/otel package

```
npm install @splunk/otel --save
```

2. Install instrumentation packages

```
npm install @opentelemetry/instrumentation-http --save
```

You can find a list of instrumentation packages supported out of the box [here](#default-instrumentation-packages).

You can also install additional packages and use them as described [here](#custom-instrumentation-packages).


3. Run node app with `-r @splunk/otel/instrument` CLI argument

```
export SPLK_SERVICE_NAME=my-node-svc
node -r @splunk/otel/instrument app.js
```

You can also instrument your app with code as described [here](#instrument-with-code).


## Environmental configuration options <a name="env-config-options"></a>

### Jaeger exporter

| Environment variable          | Default value                        | Notes                                                                  |
| ----------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| SPLK_TRACE_EXPORTER_URL       | `http://localhost:9080/v1/trace`     | The jaeger endpoint to connect to. Currently only HTTP is supported.   |
| SPLK_SERVICE_NAME             | `unnamed-node-service`               | The service name of this Node service.                                 |
| SPLK_ACCESS_TOKEN             |                                      | The optional organization access token for trace submission requests.  |

### Trace configuration

| Environment variable          | Default value  | Purpose                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------                                                                                                                                                                                                                                                                                                                      |
| SPLK_MAX_ATTR_LENGTH          | 1200            | Maximum length of string attribute value in characters. Longer values are truncated.                                                                                                                                                                                                                                                                                                                      |
| OTEL_RESOURCE_ATTRIBUTES      | unset          | Comma-separated list of resource attributes added to every reported span. <details><summary>Example</summary>`key1=val1,key2=val2`</details>
| OTEL_TRACE_ENABLED            | `true`         | Globally enables tracer creation and auto-instrumentation.                                                                                                                                                                                                                                                                                                                                                |

More details on config options can be seen [here](#config-options)

## Advanced Getting Started


## Exporting to Smart Agent, Otel collector or SignalFx ingest

This package exports spans in Jaeger Thrift format over HTTP and supports
exporting to the SignalFx Smart Agent, OpenTelemetry collector and directly to
SignalFx ingest API. You can use `SPLK_TRACE_EXPORTER_URL` environment variable
to specify an export URL. The value must be a full URL including scheme and
path.

### Smart Agent

This is the default option. You do not need to set any config options if you
want to export to the Smart Agent and you are running the agent on the default
port (`9080`). The exporter will default to `http://localhost:9080/v1/trace`
when the environment variable is not specified.

### OpenTelemetry Collector

In order to do this, you'll need to enable Jaeger Thrift HTTP receiver on
OpenTelemetry Collector and set `SPLK_TRACE_EXPORTER_URL` to
`http://localhost:14268/api/traces` assuming the collector is reachable via
localhost.

### SignalFx Ingest API

In order to send traces directly to SignalFx ingest API, you need to:

1. Set `SPLK_TRACE_EXPORTER_URL` to
   `https://ingest.<realm>.signalfx.com/v2/trace` where `realm` is your
   SignalFx realm e.g, `https://ingest.us0.signalfx.com/v2/trace`.
2. Set `SPLK_ACCESS_TOKEN` to one of your SignalFx APM access tokens.

## Automatically instrument an application

You can use node's `-r` CLI flag to pre-load the instrumentation module and automatically instrument your NodeJS application.
You can add `-r @splunk/otel/instrument` CLI parameter to automatically instrument your application. 

For example, if you start your application as follows:

```bash
node index.js
```

Then you can automatically instrument your application by running

```bash
node -r @splunk/otel/instrument index.js
```

## Manually instrument an application <a name="instrument-with-code"></a>

You can also manually instrument your application by adding the following lines before everything else in your application.

```js
const { startTracing } = require('@splunk/otel');

startTracing();

// rest of your application entry point script
```
`startTracing()` accept an optional `Options` argument. It can be used to customize many aspects of the tracing pipeline. For example:

```js
startTracing({
  endpoint: 'http://localhost:14268/api/traces',
  serviceName: 'my-node-service',
});
```
### All config options <a name="config-options"></a>

`startTracing()` accepts an optional argument to pass down configuration. The argument must be an Object and may contain any of the following keys.

- `endpoint`: corresponds to the `SPLK_TRACE_EXPORTER_URL` environment variable. Defaults to `http://localhost:9080/v1/trace`. Configures the http endpoint to which all spans will be exported.

- `serviceName`: corresponds to the `SPLK_SERVICE_NAME` environment variable. Defaults to `unnamed-node-service`. Configures the service name of the instrumented node service. The name is added to all spans as an attribute.

- `accessToken`: corresponds to the `SPLK_ACCESS_TOKEN` environment variable. Configures the access token that should be used to authenticate with the span exporter http endpoint. Used when exporting directly to Splunk APM from a Node service.

- `maxAttrLength`: corresponds to the `SPLK_MAX_ATTR_LENGTH` environment variable. Defaults to `1200`. Configures the maximum length any span attribute value can have. Values longer than the specified length will be truncated.

- `tracerConfig`: a JS object that is merged into the default tracer config replacing any existing keys and is passed on to the tracer provider during initialization. This can be used to customize the tracer provider or tracer. Must satisfy [`TracerConfig` interface](https://github.com/open-telemetry/opentelemetry-js/blob/71ba83a0dc51118e08e3148c788b81fe711003e7/packages/opentelemetry-tracing/src/types.ts#L26)

- `spanExporterFactory`: A function that accepts the options passed to startTracing function and returns a new instance of SpanExporter. When set, this function will be used to create a new exporter and the returned exporter will be used in the pipeline.

- `spanProcessorFactory`: A function that accepts the options passed to startTracing function and returns a SpanProcessor instance or an array of SpanProcessor instances. When set, this function is be used to create one or more span processor(s). The returned processors are added to the global tracer provider and configured to process all spans generated by any tracer provider by the global provider. The function is responsible for creating a new span exporter and using it with each processor it creates. It may call `options.spanExporterFactory(options)` to create a new exporter as configured by the user.

- `instrumentations`: defaults to the list of instrumentation listed [below](#default-instrumentation-packages). Can be used to enable additional instrumentation packages. Refer examples [here](#custom-instrumentation-packages)

## Using additional instrumentation plugins <a name="custom-instrumentation-packages"></a>

If you setup tracing manually by calling the `startTracing()` method, you can use custom or 3rd party instrumentations as long as they implement the [OpenTelemetry JS Instrumentation interface](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-instrumentation). Custom instrumentations can be enabled by passing them to the `startTracing()` method as follows:

```js
const { startTracing } = require('splunk-otel-js');

startTracing({
  instrumentations: [
    new MyCustomInstrumentation(),
    new AnotherInstrumentation(),
  ]
});
```

You can also add the default set of instrumentation to the list as follows:


```js
const { startTracing } = require('splunk-otel-js');
const { getInstrumentations } = require('splunk-otel-js/instrumentations');

startTracing({
  instrumentations: [
    ...getInstrumentations(),
    new MyCustomInstrumentation(),
    new AnotherInstrumentation(),
  ]
});
```

## Default Instrumentation Packages <a name="default-instrumentation-packages"></a>

By default the following instrumentations will automatically be enabled if they are installed. In order to use
any of these instrumentations, you'll need to install them with npm and then run your app with `-r @splunk/otel/instrument`
flag as described above.

```
@opentelemetry/instrumentation-http
@opentelemetry/instrumentation-dns
@opentelemetry/instrumentation-graphql
@opentelemetry/instrumentation-grpc
@opentelemetry/instrumentation-koa
@opentelemetry/hapi-instrumentation
```

You can find more instrumentation packages over at the [OpenTelemetry Registry](https://opentelemetry.io/registry/?language=js) and enable them manually 
as described above.

## Troubleshooting

TODO:

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the Apache Software License version 2.0. See [the
license file](./LICENSE) for more details.
