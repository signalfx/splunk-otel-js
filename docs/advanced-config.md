> The official Splunk documentation for this page is [Configure the Splunk Distribution of OTel JS](https://docs.splunk.com/Observability/gdi/get-data-in/application/nodejs/configuration/advanced-nodejs-otel-configuration.html). For instructions on how to contribute to the docs, see [CONTRIBUTING.md](../CONTRIBUTING.md#documentation).

# Advanced Configuration

To configure the Splunk Distribution of OpenTelemetry JS, you can use a combination of environment variables and arguments passed to the `start()` function:

- Environment variables

   For example: `export OTEL_SERVICE_NAME='test-service'`

- Arguments passed to the `start()` function

   For example: `start({ serviceName: 'my-node-service', });`

> `start()` arguments take precedence over the corresponding environment variables.

Configuration for each of the supported signals(Metrics, Profiling, and Tracing) is set with additional properties on the configuration object:

```javascript
start({
  // general options like `serviceName` and `endpoint`
  metrics: {
    // configuration passed to metrics signal
  },
  profiling: {
    // configuration passed to profiling signal
  },
  tracing: {
    // configuration passed to tracing signal
  },
});
```

Instead of passing an object, boolean is also an valid for turning on the signals that are not enabled by default using the default configuration:

```javascript
start({
  // general options like `serviceName` and `endpoint`
  metrics: true, // turn metrics on with default options
  profiling: true, // turn profiling on with default options
});
```

`start()` turns on all stable [signals](https://github.com/open-telemetry/opentelemetry-specification/blob/70fecd2dcba505b3ac3a7cb1851f947047743d24/specification/glossary.md#signals) with one call, which means the list will change over time.

## List of settings

This distribution supports all the configuration options supported by the components it uses with the defaults specified by the [OTel Specification](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/sdk-environment-variables.md).

### Tracing

| Environment variable<br>``start()`` argument             | Default value           | Support | Notes
| --------------------------------------------------------------- | ----------------------- | ------- | ---
| `OTEL_ATTRIBUTE_COUNT_LIMIT`                                    |                         | Stable  | Maximum allowed span attribute count
| `OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT`                             | `12000`\*               | Stable  | Maximum allowed attribute value size
| `OTEL_EXPORTER_OTLP_ENDPOINT`<br>`endpoint`                     | `http://localhost:4317` | Stable  | The OTLP endpoint to export to. Only OTLP over gRPC is supported.
| `OTEL_LOG_LEVEL`                                                |                         | Stable  | Log level to use in diagnostics logging. **Does not set the logger.**
| `OTEL_PROPAGATORS`<br>`tracing.propagators`                     | `tracecontext,baggage`  | Stable  | Comma-delimited list of propagators to use. Valid keys: `baggage`, `tracecontext`, `b3multi`, `b3`.
| `OTEL_RESOURCE_ATTRIBUTES`                                      |                         | Stable  | Comma-separated list of resource attributes added to every reported span. <details><summary>Example</summary>`key1=val1,key2=val2`</details>
| `OTEL_SERVICE_NAME`<br>`serviceName`                            | `unnamed-node-service`  | Stable  | The service name of this Node service.
| `OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT`                               | `128`                   | Stable  | Maximum allowed span attribute count
| `OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT`                        |                         | Stable  | Maximum allowed attribute value size. Empty value is treated as infinity
| `OTEL_SPAN_EVENT_COUNT_LIMIT`                                   | `128`                   | Stable  | 
| `OTEL_SPAN_LINK_COUNT_LIMIT`                                    | `1000`\*                | Stable  | 
| `OTEL_TRACES_EXPORTER`<br>`tracing.spanExporterFactory`         | `otlp`                  | Stable  | Chooses the trace exporters. Shortcut for setting `spanExporterFactory`. Comma-delimited list of exporters. Currently supported values: `otlp`, `console`.
| `OTEL_TRACES_SAMPLER`                                           | `parentbased_always_on` | Stable  | Sampler to be used for traces. See [Sampling](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/trace/sdk.md#sampling)
| `OTEL_TRACES_SAMPLER_ARG`                                       |                         | Stable  | String value to be used as the sampler argument. Only be used if OTEL_TRACES_SAMPLER is set.
| `SPLUNK_ACCESS_TOKEN`<br>`accessToken`                          |                         | Stable  | The optional access token for exporting signal data directly to SignalFx API.
| `SPLUNK_REALM`<br>`realm`                                       |                         | Stable  | The name of your organization's realm, for example, ``us0``. When you set the realm, telemetry is sent directly to the ingest endpoint of Splunk Observability Cloud, bypassing the Splunk OpenTelemetry Collector. Overridden by settings that define a complete endpoint URL, like `OTEL_EXPORTER_OTLP_ENDPOINT`.
| `SPLUNK_TRACE_RESPONSE_HEADER_ENABLED`<br>`tracing.serverTimingEnabled` | `true`          | Stable  | Enable injection of `Server-Timing` header to HTTP responses.
| `SPLUNK_REDIS_INCLUDE_COMMAND_ARGS`                             | `false`                 | Stable  | Will include the full redis query in `db.statement` span attribute when using `redis` instrumentation.

\*: Overwritten default value

#### Additional `tracing` config options in `start()`

The following config options can be set by passing them as tracing arguments to `start()`.

- `tracing.tracerConfig`: A JS object that is merged into the default tracer config replacing any existing keys. It's passed to the tracer provider during initialization. This can be used to customize the tracer provider or tracer. Must satisfy [`TracerConfig` interface](https://github.com/open-telemetry/opentelemetry-js/blob/71ba83a0dc51118e08e3148c788b81fe711003e7/packages/opentelemetry-tracing/src/types.ts#L26)

- `tracing.spanExporterFactory`: A function that accepts the tracing options. Returns a new instance of SpanExporter. When set, this function is used to create a new exporter and the returned exporter will be used in the pipeline.

- `tracing.spanProcessorFactory`: Returns a SpanProcessor instance or an array of SpanProcessor instances. When set, this function is be used to create one or more span processors. The returned processors are added to the global tracer provider and configured to process all spans generated by any tracer provider by the global provider. The function creates a new span exporter and uses it with each processor it creates. It may call `options.spanExporterFactory(options)` to create a new exporter as configured by the user.

- `tracing.propagatorFactory`: A function that returns a new instance of a TextMapPropagator. Defaults to a composite propagator comprised of W3C [Trace Context](https://www.w3.org/TR/trace-context/) and [Baggage](https://w3c.github.io/baggage/) propagators.

- `tracing.instrumentations`: Can be used to enable additional instrumentation packages.

- `tracing.captureHttpRequestUriParams`: Either a list of keys (case-sensitive) of HTTP query parameters to capture or a function that gets invoked with the current span and query parameters to set a custom span attribute. When using the former, parameters are set as span attributes as `http.request.param.${key}`. Attribute keys are normalized at capture time, meaning `.` is replaced with `_` to avoid any attribute namespacing issues.

### Metrics

Configuration examples can be seen [here](metrics.md).

| Environment variable<br>``start()`` argument             | Default value           | Support | Notes
| --------------------------------------------------------------- | ----------------------- | ------- | ---
| `OTEL_SERVICE_NAME`<br>`serviceName`                            | `unnamed-node-service`  | Stable  | The service name of this Node service.
| `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT`<br>`endpoint`             | `http://localhost:4317` | Stable | The OTLP endpoint to export to.
| `OTEL_METRIC_EXPORT_INTERVAL`<br>`metrics.exportIntervalMillis` | `30000`                 | Stable | The interval, in milliseconds, of metrics collection and exporting.
| `OTEL_METRICS_EXPORTER`<br>`metrics.metricReaderFactory`        | `otlp`                  | Stable  | Chooses the metric exporters. Comma-delimited list of exporters. Currently supported values: `otlp`, `console`.
| `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`<br>`metrics.metricReaderFactory` | `grpc`           | Stable  | Chooses the metric exporter protocol. Currently supported values: `grpc`, `http/protobuf`.
| `OTEL_RESOURCE_ATTRIBUTES`                                      |                         | Stable  | The resource attributes to metric data. <details><summary>Environment variable example</summary>`key1=val1,key2=val2`</details>
| `SPLUNK_METRICS_ENABLED`<br>n/a (enabled by calling `start`) | `false`             | Experimental | Sets up the metrics pipeline (global meter provider, exporters).
| n/a<br>`metrics.resourceFactory`                                |                         | Experimental | Callback which allows to filter the default resource or provide a custom one. The function takes one argument of type `Resource` which is the resource pre-filled by the SDK containing the `service.name`, environment, host and process attributes. |
| `SPLUNK_RUNTIME_METRICS_ENABLED`<br>`metrics.runtimeMetricsEnabled` | `true`                 | Experimental | Enable collecting and exporting of runtime metrics. See [metrics documentation](metrics.md) for more information.
| `SPLUNK_RUNTIME_METRICS_COLLECTION_INTERVAL`<br>`metrics.runtimeMetricsCollectionIntervalMillis`  | `5000`                 | Experimental | The interval, in milliseconds, during which GC and event loop statistics are collected. After the collection is done, the values become available to the metric exporter.

### Profiling

| Environment variable<br>``start()`` argument           | Default value           | Support | Notes
| --------------------------------------------------------------- | ----------------------- | ------- | ---
| `SPLUNK_PROFILER_ENABLED`                                       | `false`                 | Experimental | Enable continuous profiling. See [profiling documentation](profiling.md) for more information.
| `SPLUNK_PROFILER_MEMORY_ENABLED`<br>`profiling.memoryProfilingEnabled` | `false`          | Experimental | Enable continuous memory profiling.
| `SPLUNK_PROFILER_LOGS_ENDPOINT`<br>`endpoint`                   | `http://localhost:4317` | Experimental | The OTLP logs receiver endpoint used for profiling data.
| `OTEL_SERVICE_NAME`<br>`serviceName`                            | `unnamed-node-service`  | Stable  | Service name of the application.
| `OTEL_RESOURCE_ATTRIBUTES`                                      |                         | Stable  | Comma-separated list of resource attributes. <details><summary>Example</summary>`deployment.environment=demo,key2=val2`</details>

### Migrating from signal-specific `start*` functions

Older versions of `@splunk/otel` shipped with signal-specific start functions: `startMetrics`, `startProfiling`, and `startTracing`. Calling these functions is now deprecated and these functions will be removed in future versions.

If your code still uses these, merge them into one start call:

```js
const { start } = require('@splunk/otel');

start({
  // accessToken,
  // endpoint,
  // serviceName,
  tracing: {
    // tracing-specific options here.
  },
  // profiling: true, // enable experimental profiling signal
  /*
  metrics: { // enable experimental metrics signal with specific configuration
    // exportInterval,
  },
  */
});
```
