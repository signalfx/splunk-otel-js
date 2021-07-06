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
  - `socket.io` - pending vetting, provided by community
- other notes on instrumentation:
  - `express` instrumentation requires `http`/`https` instrumentation
  - `bluebird` - context propagation only (via `async_hooks`)
  - `q` - context propagation only (via `async_hooks`)
  - `when` - context propagation only (via `async_hooks`)

## Requirements

This Splunk Distribution of OpenTelemetry requires Node.js 8.5 or later.
If you're still using an earlier version of Node.js, continue using the SignalFx Tracing Library for Node.js.

## Equivalent configurations

### Instrumented libraries

With the exception of [explicitly listed limitations](#known-limitations) we aim to support all libraries supported by
signalfx-nodejs-tracing.

### Environment variables

| Old environment variable           | New environment variable             | notes |
| ---------------------------------- | ------------------------------------ |
| SIGNALFX_ACCESS_TOKEN              | SPLUNK_ACCESS_TOKEN                  |
| SIGNALFX_SERVICE_NAME              | OTEL_SERVICE_NAME                    |
| SIGNALFX_ENDPOINT_URL              | OTEL_EXPORTER_JAEGER_ENDPOINT or OTEL_EXPORTER_OTLP_ENDPOINT |
| SIGNALFX_RECORDED_VALUE_MAX_LENGTH | SPLUNK_MAX_ATTR_LENGTH               |
| SIGNALFX_TRACING_DEBUG | |
| SIGNALFX_SPAN_TAGS | |
| SIGNALFX_LOGS_INJECTION | |
| SIGNALFX_LOGS_INJECTION_TAGS | |
| SIGNALFX_ENABLED_PLUGINS | |
| SIGNALFX_RECORDED_VALUE_MAX_LENGTH | |
| SIGNALFX_SERVER_TIMING_CONTEXT | |

Remove incompatible environment variables:

- `SIGNALFX_TRACING_ENABLED`
- `SIGNALFX_ENABLED_PLUGINS` - this is controlled by configuration of the `TracerProvider`

### Main instrumentation entrypoint

### Dependencies
