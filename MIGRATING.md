# Migrate from the SignalFx Tracing Library for Node.js

The Splunk Distribution of OpenTelemetry for Node.js replaces the SignalFx Tracing
Library for Node.js. If you’re using the SignalFx Tracing Library, migrate to
the Splunk Distribution of OpenTelemetry for Node.js to send traces to Splunk 
Observability Cloud. The Splunk Distribution of OpenTelemetry for Node.js uses 
OpenTelemetry to instrument applications, which is an open-source API to gather 
telemetry data, and has a smaller footprint.

Because the SignalFx Tracing Library for Node.js uses OpenTracing and the Splunk
 Distribution of OpenTelemetry for Node.js uses OpenTelemetry, the semantic 
 conventions for span names and attributes change when you migrate. For more
information, see [Migrate from OpenTracing to OpenTelemetry](https://docs.signalfx.com/en/latest/apm/apm-getting-started/apm-opentelemetry-collector.html#apm-opentelemetry-migration).

## Getting help

If you experience any issues following the guide below, or something is unclear, or missing, don't hesitate to
open an issue in GitHub. Any and all ideas for improvements are also welcome.

<a name="known-limitations"></a>
## Known limitations as compared to SignalFx Tracing Library

- Different subset of supported Node.js versions, see [Requirements section](#requirements) for more information.
- No auto-instrumentation for:
  - `AdonisJS`,
  - `amqp10`,
  - `mongodb-core` ([because it's deprecated](https://github.com/mongodb-js/mongodb-core)), but note that there is
    [an instrumentation for MongoDB driver](https://opentelemetry.io/registry/?s=mongodb&component=&language=js#),
  - `sails`.
- Other notes on instrumentation:
  - `express`, `koa` and `hapi` instrumentations require active `http`/`https` instrumentation to produce spans,
  - `bluebird`, `q`, `when` - supported out-of-the-box via `AsyncLocalStorageContextManager` (or `AsyncHooksContextManager` in Node.js below `14.8`),

## Changes to defaults

- Default flush interval, which defines how frequently captured trace data is sent to the backend, is now 500ms instead of 2s.

## Requirements

This Splunk Distribution of OpenTelemetry requires Node.js 14 or higher,
[see more information here](https://github.com/open-telemetry/opentelemetry-js#node-support)

Current effective required Node.js version is: ![node-current](https://img.shields.io/node/v/@splunk/otel?style=flat-square)

## Migration steps

### Instrumented libraries

With the exception of [explicitly listed limitations](#known-limitations) we aim to support all libraries supported by
signalfx-nodejs-tracing. To find an equivalent autoinstrumentation open <https://opentelemetry.io/registry/> and for
each instrumentation
[from `signalfx-nodejs-tracing`'s README](https://github.com/signalfx/signalfx-nodejs-tracing/#requirements-and-supported-software)
search by the name of the library in the registry.

If an instrumentation is not [bundled](./README.md#default-instrumentation-packages) you can use custom instrumentation
packages via the method described [here](./docs/instrumentations.md#using-custom-or-third-party-instrumentations).

### Environment variables

Rename environment variables:

| OpenTracing environment variable   | OpenTelemetry environment variable     | notes |
| ---------------------------------- | -------------------------------------- | ----- |
| SIGNALFX_ACCESS_TOKEN              | SPLUNK_ACCESS_TOKEN                    | |
| SIGNALFX_SERVICE_NAME              | OTEL_SERVICE_NAME                      | |
| SIGNALFX_ENDPOINT_URL              | _no direct equivalent_                 | See [the notes on endpoint](#endpoint) |
| SIGNALFX_RECORDED_VALUE_MAX_LENGTH | OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT | |
| SIGNALFX_TRACING_DEBUG             | _no direct equivalent_                 | See [Instrumentation logs](#instrumentation-logs) |
| SIGNALFX_SPAN_TAGS                 | OTEL_RESOURCE_ATTRIBUTES               | Format needs to be changed to `key1=val1,key2=val2` |
| SIGNALFX_LOGS_INJECTION            | n/a                                    | Logs injection is now enabled by default. |
| SIGNALFX_LOGS_INJECTION_TAGS       | n/a                                    | |
| SIGNALFX_ENABLED_PLUGINS           | n/a                                    | see [the section about instrumentations](./docs/instrumentations.md#using-custom-or-third-party-instrumentations) |
| SIGNALFX_SERVER_TIMING_CONTEXT     | SPLUNK_TRACE_RESPONSE_HEADER_ENABLED   | |
| SIGNALFX_TRACING_ENABLED           | n/a                                    | |

### Programmatic configuration

Update these programmatic configuration options (passed as arguments to `start()`):

| OpenTracing property     | OpenTelemetry property  | Notes |
| ------------------------ | ----------------------- | ----- |
| `service`                | `serviceName`           |       |
| `url`                    | `endpoint`              |       |
| `accessToken`            | `accessToken`           |       |
| `enabled`                | -                       | no equivalent, but Environment Variable can be used |
| `debug`                  | -                       | no direct equivalent, see [instrumentation logs](#instrumentation-logs) |
| `tags`                   | `tracing.tracerConfig.resource` | |
| `logInjection`           | `tracing.logInjectionEnabled`   | |
| `logInjectionTags`       | -                       | no direct equivalent, but `tracerConfig.resource` can be used |
| `flushInterval`          | -                       | no direct equivalent, contact us if you had customized this value |
| `plugins`                | -                       | see [the section about instrumentations](./docs/instrumentations.md#using-custom-or-third-party-instrumentations) |
| `enableServerTiming`     | `tracing.serverTimingEnabled`   | |

### Instrumentation entry point

```javascript
const tracer = require('signalfx-tracing').init({
  // your options here
})
```

becomes

```javascript
const { start } = require('@splunk/otel');

start({
  // your new options here
});
```

and requires installing `@splunk/otel` first, using either npm or Yarn. Same as in `signalfx-nodejs-tracing`, this code
is to be run before your `import` or `require` statements.

Alternatively, you can append the flag `-r @splunk/otel/instrument` instead when launching `node` (it runs
`start()` under the hood). In that case you cannot use programmatic configuration and must rely on environment
variables only.

### Instrumentation logs

There isn't a one-to-one mapping for `SIGNALFX_TRACING_DEBUG`. The closest equivalent is `OTEL_LOG_LEVEL`, however the
logged information will be different.

> Note that this section is about the logs produced by instrumentation, and not
about the logs produced by the application.

Logging level is controlled by the `OTEL_LOG_LEVEL` environment variable. The two most common values are:
- `INFO`: the default value
- `VERBOSE`: highest value likely to be needed

For all possible log levels see
[this source file](https://github.com/open-telemetry/opentelemetry-js-api/blob/main/src/diag/types.ts).

There is no default output for logs. Even if you set `OTEL_LOG_LEVEL=VERBOSE`, nothing is output to the console. You
need to set an output first, for example to `stdout`, by adding `DiagConsoleLogger`:

```js
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
```

### Endpoint

This package uses OTLP for export format by default so `SIGNALFX_ENDPOINT_URL` doesn't have an direct equivalent without replacing the exporter with one that uses Jaeger format. Options to consider:

- **Using OTLP**: If the receiving endpoint supports OTLP over gRPC (for example, the OTel Collector), set `OTEL_EXPORTER_OTLP_ENDPOINT` instead of `SIGNALFX_ENDPOINT_URL`.
- **Replacing gRPC with HTTP**: To export directly to Splunk Observability Cloud set `SPLUNK_REALM` and `SPLUNK_ACCESS_TOKEN` environment variables. [See the example](./examples/express).
