> The official Splunk documentation for this page is [Connect Node.js trace data with logs](https://docs.splunk.com/Observability/gdi/get-data-in/application/nodejs/instrumentation/connect-traces-logs.html). For instructions on how to contribute to the docs, see [CONTRIBUTING.md](../CONTRIBUTING.md#documentation).
# Correlating traces with logs

The Splunk Distribution of OpenTelemetry JS automatically injects trace metadata into logs so that Node.js logging libraries can access it. You can use trace metadata to correlate traces with log events and explore logs in Observability Cloud.

## Supported logging libraries

The following logging librares are supported:

- Bunyan
- Pino
- Winston

## Injected trace data

The following attributes are automatically injected into logs:

- Trace information: `trace_id`, `span_id`, and `trace_flags`
- Resource attributes: `service.name`, `service.version`, and `deployment.environment`(as `service.environment`)

The format of each log message depends on the logging library. The following is a sample log message formatted by the Pino library:

```
   {"level":30,"time":1979374615686,"pid":728570,"hostname":"my_host","trace_id":"f8e261432221096329baf5e62090d856","span_id":"3235afe76b55fe51","trace_flags":"01","url":"/lkasd","msg":"request handler"}
```

## Enable logs injection

To enable log injection, install the instrumentation package for your logging library:

``
@opentelemetry/instrumentation-bunyan
@opentelemetry/instrumentation-pino
@opentelemetry/instrumentation-winston
``

To inject trace data into formatted logs, refer to the documentation of each library.