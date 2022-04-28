> The official Splunk documentation for this page is [Configure the Splunk Distribution of OTel JS](https://docs.splunk.com/Observability/gdi/get-data-in/application/nodejs/configuration/advanced-nodejs-otel-configuration.html). For instructions on how to contribute to the docs, see [CONTRIBUTING.md](../CONTRIBUTING.md#documentation).

# Advanced Configuration

To configure the Splunk Distribution of OpenTelemetry JS, you can use a combination of environment variables and arguments passed to the `startTracing()` function:

- Environment variables

   For example: `export OTEL_SERVICE_NAME='test-service'`

- Arguments passed to the `startTracing()` function

   For example: `startTracing({ serviceName: 'my-node-service', });`

> `startTracing()` arguments take precedence over the corresponding environment variables.

## List of settings

This distribution supports all the configuration options supported by the components it uses with the defaults specified by the [OTel Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md).

### Tracing

| Environment variable<br>``startTracing()`` argument             | Default value           | Support | Notes
| --------------------------------------------------------------- | ----------------------- | ------- | ---
| `OTEL_ATTRIBUTE_COUNT_LIMIT`                                    |                         | Stable  | Maximum allowed span attribute count
| `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`                             | `12000`\*               | Stable  | Maximum allowed attribute value size
| `OTEL_EXPORTER_JAEGER_ENDPOINT`                                 | `http://localhost:14268/v1/traces` or<br>`http://localhost:9080/v1/trace`<br>if `jaeger-thrift-splunk` is used as exporter | Stable | HTTP endpoint for Jaeger traces
| `OTEL_EXPORTER_OTLP_ENDPOINT`<br>`endpoint`                     | `localhost:4317`        | Stable  | The OTLP endpoint to export to. Only OTLP over gRPC is supported.
| `OTEL_LOG_LEVEL`                                                |                         | Stable  | Log level to use in diagnostics logging. **Does not set the logger.**
| `OTEL_PROPAGATORS`<br>`propagators`                             | `tracecontext,baggage`  | Stable  | Comma-delimited list of propagators to use. Valid keys: `baggage`, `tracecontext`, `b3multi`, `b3`.
| `OTEL_RESOURCE_ATTRIBUTES`                                      |                         | Stable  | Comma-separated list of resource attributes added to every reported span. <details><summary>Example</summary>`key1=val1,key2=val2`</details>
| `OTEL_SERVICE_NAME`<br>`serviceName`                            | `unnamed-node-service`  | Stable  | The service name of this Node service.
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`                               | `128`                   | Stable  | Maximum allowed span attribute count
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT`                        |                         | Stable  | Maximum allowed attribute value size. Empty value is treated as infinity
| `OTEL_SPAN_EVENT_COUNT_LIMIT`                                   | `128`                   | Stable  | 
| `OTEL_SPAN_LINK_COUNT_LIMIT`                                    | `1000`\*                | Stable  | 
| `OTEL_TRACES_EXPORTER`<br>`tracesExporter`                      | `otlp`                  | Stable  | Chooses the exporter. Shortcut for setting `spanExporterFactory`. One of [`otlp`, `jaeger-thrift-http`, `jaeger-thrift-splunk`]. See [`TracesExporter`](../src/options.ts).
| `OTEL_TRACES_SAMPLER`                                           | `parentbased_always_on` | Stable  | Sampler to be used for traces. See [Sampling](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/sdk.md#sampling)
| `OTEL_TRACES_SAMPLER_ARG`                                       |                         | Stable  | String value to be used as the sampler argument. Only be used if OTEL_TRACES_SAMPLER is set.
| `SPLUNK_ACCESS_TOKEN`<br>`accessToken`                          |                         | Stable  | The optional access token for exporting signal data directly to SignalFx API.
| `SPLUNK_TRACE_RESPONSE_HEADER_ENABLED`<br>`serverTimingEnabled` | `true`                  | Stable  | Enable injection of `Server-Timing` header to HTTP responses.
| `SPLUNK_REDIS_INCLUDE_COMMAND_ARGS` | `false`                  | Stable  | Will include the full redis query in `db.statement` span attribute when using `redis` instrumentation.

#### Additional `startTracing` config options

The following config options can be set by passing them as arguments to `startTracing()`.

- `tracerConfig`: A JS object that is merged into the default tracer config replacing any existing keys. It's passed to the tracer provider during initialization. This can be used to customize the tracer provider or tracer. Must satisfy [`TracerConfig` interface](https://github.com/open-telemetry/opentelemetry-js/blob/71ba83a0dc51118e08e3148c788b81fe711003e7/packages/opentelemetry-tracing/src/types.ts#L26)

- `spanExporterFactory`: A function that accepts the options passed to the startTracing function. Returns a new instance of SpanExporter. When set, this function is used to create a new exporter and the returned exporter will be used in the pipeline.

- `spanProcessorFactory`: Returns a SpanProcessor instance or an array of SpanProcessor instances. When set, this function is be used to create one or more span processors. The returned processors are added to the global tracer provider and configured to process all spans generated by any tracer provider by the global provider. The function creates a new span exporter and uses it with each processor it creates. It may call `options.spanExporterFactory(options)` to create a new exporter as configured by the user.

- `propagatorFactory`: A function that returns a new instance of a TextMapPropagator. Defaults to a composite propagator comprised of W3C [Trace Context](https://www.w3.org/TR/trace-context/) and [Baggage](https://w3c.github.io/baggage/) propagators.

- `instrumentations`: Can be used to enable additional instrumentation packages.

- `captureHttpRequestUriParams`: Either a list of keys (case-sensitive) of HTTP query parameters to capture or a function that gets invoked with the current span and query parameters to set a custom span attribute. When using the former, parameters are set as span attributes as `http.request.param.${key}`. Attribute keys are normalized at capture time, meaning `.` is replaced with `_` to avoid any attribute namespacing issues.

### Metrics

| Environment variable<br>``startMetrics()`` argument             | Default value           | Support | Notes
| --------------------------------------------------------------- | ----------------------- | ------- | ---
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`<br>`endpoint`             | `localhost:4317`        | Stable | The OTLP endpoint to export to.
| `OTEL_METRIC_EXPORT_INTERVAL`<br>`exportIntervalMillis`         | `5000`                  | Stable | The interval, in milliseconds, of metrics collection and exporting.
| `SPLUNK_RUNTIME_METRICS_ENABLED`                                | `false`                 | Experimental | Enable collecting and exporting of runtime metrics. See [metrics documentation](metrics.md) for more information.

\*: Overwritten default value
