# Migrate from the SignalFx Tracing Library for NodeJS

The Splunk Distribution of OpenTelemetry for NodeJS replaces the SignalFx Tracing
Library for NodeJS. If you’re using the SignalFx Tracing Library, migrate to
the Splunk Distribution of OpenTelemetry for NodeJS to use OpenTelemetry’s
instrumentation to send traces to Splunk APM. The Splunk Distribution of
OpenTelemetry for NodeJS uses OpenTelemetry to instrument applications, which is
an open-source API to gather telemetry data, and has a smaller footprint.

Because the SignalFx Tracing Library for NodeJS uses OpenTracing and the Splunk Distribution
of OpenTelemetry for NodeJS uses OpenTelemetry, the semantic
conventions for span tag names change when you migrate. For more information,
see [Migrate from OpenTracing to OpenTelemetry](https://docs.signalfx.com/en/latest/apm/apm-getting-started/apm-opentelemetry-collector.html#apm-opentelemetry-migration).

<a name="known-limitations"></a>
## Known limitations as compared to SignalFx Tracing Library

- Lowest supported version of NodeJS is `v8.5`, [see more information here](https://github.com/open-telemetry/opentelemetry-js#node-support)
- No auto-instrumentation for:
  - `AdonisJS`
  - `amqp10`
  - `mongodb-core` ([because it's deprecated](https://github.com/mongodb-js/mongodb-core))
  - `sails`
- Limited instrumentation for:
  - `nest` - only manual insturmentation helpers, provided by community
- other notes on instrumentation:
  - `express` instrumentation requires `http`/`https` instrumentation
  - `bluebird` - context propagation only (via `async_hooks`)
  - `q` - context propagation only (via `async_hooks`)
  - `when` - context propagation only (via `async_hooks`)
  - `socket.io` - provided by community (<https://github.com/aspecto-io/opentelemetry-ext-js/tree/master/packages/instrumentation-socket.io>)

## Requirements

This Splunk Distribution of OpenTelemetry requires Node.js 8.5 or later.
If you're still using an earlier version of Node.js, continue using the SignalFx Tracing Library for Node.js.

## Equivalent configurations

### Changes to defaults

- default flush interval is now 30s instead of 2s (how frequently captured telemetry data is sent to the backend)

### Instrumented libraries

With the exception of [explicitly listed limitations](#known-limitations) we aim to support all libraries supported by
signalfx-nodejs-tracing. To find an equivalent auto-instrumentation open <https://opentelemetry.io/registry/> and for
each instrumentation
[from `signalfx-nodejs-tracing`'s README](https://github.com/signalfx/signalfx-nodejs-tracing/#requirements-and-supported-software)
search by the name of the library in the registry.

For example, if you'd like to migrate instrumentation for `mysql`, go to
[https://opentelemetry.io/registry/?s=**mysql**&component=&language=**js**#](https://opentelemetry.io/registry/?s=mysql&component=&language=js#).

Once you have identified an instrumentation package, install it using `npm` or `yarn` and:

- if the package is [on this list](./README.md#default-instrumentation-packages-) then it
  will be enabled automatically
- if it's not on the list, then please follow the steps for
  [installing other instrumentation packages](./README.md#custom-instrumentation-packages)

### Environment variables

Rename environment variables:

| Old environment variable           | New environment variable             | notes |
| ---------------------------------- | ------------------------------------ | ----- |
| SIGNALFX_ACCESS_TOKEN              | SPLUNK_ACCESS_TOKEN                  |       |
| SIGNALFX_SERVICE_NAME              | OTEL_SERVICE_NAME                    |       |
| SIGNALFX_ENDPOINT_URL              | OTEL_EXPORTER_JAEGER_ENDPOINT        | if Jaeger is used |
| SIGNALFX_ENDPOINT_URL              | n/a                                  | OTLP is not implemented yet |
| SIGNALFX_RECORDED_VALUE_MAX_LENGTH | SPLUNK_MAX_ATTR_LENGTH               |       |
| SIGNALFX_TRACING_DEBUG             | no direct equivalent                 | see [instrumentation logs](#instrumentation-logs) |
| SIGNALFX_SPAN_TAGS                 | OTEL_RESOURCE_ATTRIBUTES             | format needs to be changed to `key1=val1,key2=val2` |
| SIGNALFX_LOGS_INJECTION            | SPLUNK_LOGS_INJECTION                | |
| SIGNALFX_LOGS_INJECTION_TAGS       | OTEL_RESOURCE_ATTRIBUTES             | there's no direct equivalent, but values specified in `OTEL_RESOURCE_ATTRIBUTES` will also be used for logs injection |
| SIGNALFX_ENABLED_PLUGINS           | n/a                                  | See <./README.md#custom-instrumentation-packages> |
| SIGNALFX_SERVER_TIMING_CONTEXT     | SPLUNK_TRACE_RESPONSE_HEADER_ENABLED | |
| SIGNALFX_TRACING_ENABLED           | OTEL_TRACE_ENABLED                   | |

### Programmatic configuration

| Old property             | New property    | Notes |
| ------------------------ | --------------- | |
| `service`                | `serviceName`   | |
| `url`                    | `endpoint`      | |
| `accessToken`            | `accessToken`   | |
| `enabled`                | -               | no equivalent, but Environment Variable can be used |
| `debug`                  | -               | no direct equivalent, see [instrumentation logs](#instrumentation-logs) |
| `tags`                   | `tracerConfig.resource` | |
| `logInjection`           | `logInjectionEnabled` | |
| `logInjectionTags`       | -               | no direct equivalent, but `tracerConfig.resource` can be used |
| `flushInterval`          | -               | no direct equivalent, contact us if you had customized this value |
| `plugins`                | -               | see <./README.md#default-instrumentation-packages->
| `recordedValueMaxLength` | `maxAttrLength` | |
| `enableServerTiming`     | `serverTimingEnabled` | |

### Invocation

```javascript
const tracer = require('signalfx-tracing').init({
  // your options here
})
```

becomes

```javascript
const { startTracing } = require('@splunk/otel');

startTracing({
  // your new options here
});
```

and requires installing `@splunk/otel` first, using either NPM or Yarn. Same as in `signalfx-nodejs-tracing`, this code
is to be run before your `import` or `require` statements.

Alternatively, you can append the flag `-r @splunk/otel/instrument` instead when launching `node` (it runs
`startTracing` under the hood). In that case you cannot use programmatic configuration and must rely on environment
variables only.

### Instrumentation logs

There isn't a 1-to-1 mapping for `SIGNALFX_TRACING_DEBUG`. Closest equivalent is `OTEL_LOG_LEVEL`, however the logged
information might be different. Please note that this section is about the logs **produced by instrumentation**, and not
about the logs produced by the application.

Logging level is controlled by an ENV variable `OTEL_LOG_LEVEL`, two most common values are:
- `INFO` - the default value
- `VERBOSE` - highest value likely to be needed

For all possible log levels see
[this source file](https://github.com/open-telemetry/opentelemetry-js-api/blob/main/src/diag/types.ts).

There is no default output for logs. Even if you set `OTEL_LOG_LEVEL=VERBOSE`, there won't be anything in the console.
You need to set an output first, for example to `stdout`, by adding `DiagConsoleLogger`:

```js
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
```
