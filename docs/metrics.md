# Metrics

The Splunk Distribution for OpenTelemetry Node.js configures the default OpenTelemetry meter provider and can collect
runtime metrics.

## Configuration

For configuration options, see [advanced configuration](advanced-config.md#metrics).

## Usage (custom metrics)

Add `@opentelemetry/api` to your dependencies.

```javascript
const { start } = require('@splunk/otel');
const { Resource } = require('@opentelemetry/resources');
const { metrics } = require('@opentelemetry/api');

// All fields are optional.
start({
  // Takes preference over OTEL_SERVICE_NAME environment variable
  serviceName: 'my-service',
  metrics: {
    // The suggested resource is filled in via OTEL_RESOURCE_ATTRIBUTES
    resourceFactory: (suggestedResource: Resource) => {
      return suggestedResource.merge(new Resource({
        'my.property': 'xyz',
        'build': 42,
      }));
    },
    exportIntervalMillis: 1000, // default: 5000
    // The default exporter used is OTLP over gRPC
    endpoint: 'http://collector:4317',
  },
});

const meter = metrics.getMeter('my-meter');
const counter = meter.createCounter('clicks');
counter.add(3);
```

## Using custom metric readers and exporters

Custom exporters and/or readers can be provided via the `metricReaderFactory` option.

:warning: Setting `metricReaderFactory` will invalidate `exportInterval` and `endpoint` options.

```javascript
const { start } = require('@splunk/otel');
const { PrometheusExporter } = require('@opentelemetry/exporter-prometheus');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics-base');

start({
  serviceName: 'my-service',
  metrics: {
    metricReaderFactory: () => {
      return [
        new PrometheusExporter(),
        new PeriodicExportingMetricReader({
          exportIntervalMillis: 1000,
          exporter: new OTLPMetricExporter({ url: 'http://localhost:4318' })
        })
      ]
    },
  },
});
```

## Choosing [aggregation temporality](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/data-model.md#sums)

There are 2 possible aggregation temporalities:
- `AggregationTemporality.CUMULATIVE` (default) - cumulative metrics (e.g. counters, histograms) are continuously summed together from a given starting point, which in this case is set with the call to `start()`.
- `AggregationTemporality.DELTA` - similar to `CUMULATIVE`, but the metrics are summed together relative to the last metric collection step, which is set by the export interval.

```javascript
const { start } = require('@splunk/otel');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-grpc');
const { AggregationTemporality, PeriodicExportingMetricReader } = require('@opentelemetry/sdk-metrics-base');

start({
  serviceName: 'my-service',
  metrics: {
    metricReaderFactory: () => {
      return [
        new PeriodicExportingMetricReader({
          exporter: new OTLPMetricExporter({
            temporalityPreference: AggregationTemporality.DELTA
          })
        })
      ]
    },
  },
});
```

## Migrating from SignalFx metrics

Dependency on the SignalFx client has been removed from the Splunk distribution.

The following snippets are semantically equivalent and is an example of how to convert SignalFx custom metrics to OpenTelemetry.

### SignalFx (no longer available)

```javascript
const { start } = require('@splunk/otel');
const { getSignalFxClient } = start({ serviceName: 'my-service' });

getSignalFxClient().send({
  gauges: [{ metric: 'cpu', value: 42, timestamp: Date.now()}],
  cumulative_counters: [{ metric: 'clicks', value: 99, timestamp: Date.now()}],
});
```

### OpenTelemetry

```javascript
const { start } = require('@splunk/otel');
const { metrics } = require('@opentelemetry/api');

start({
  serviceName: 'my-service',
  metrics: true, // enable metrics with default configuration
});

const meter = metrics.getMeter('my-meter');
meter.createObservableGauge('cpu', result => {
  result.observe(42);
});
const counter = meter.createCounter('clicks');
counter.add(99);
```

## Runtime metrics

The following is a list of metrics automatically collected and exported if runtime metrics is switched on:

- `process.runtime.nodejs.memory.heap.total` (gauge, bytes) - Heap total via `process.memoryUsage().heapTotal`.
- `process.runtime.nodejs.memory.heap.used` (gauge, bytes) - Heap used via `process.memoryUsage().heapUsed`.
- `process.runtime.nodejs.memory.rss` (gauge, bytes) - Resident set size via `process.memoryUsage().rss`.
- `process.runtime.nodejs.memory.gc.size` (counter, bytes) - Total collected by the garbage collector.
- `process.runtime.nodejs.memory.gc.pause` (counter, nanoseconds) - Time spent doing GC.
- `process.runtime.nodejs.memory.gc.count` (counter, count) - Number of times GC ran.
- `process.runtime.nodejs.event_loop.lag.max` (gauge, nanoseconds) - Max event loop lag within the collection interval.
- `process.runtime.nodejs.event_loop.lag.min` (gauge, nanoseconds) - Min event loop lag within the collection interval.

Runtime metrics are enabled by default if metrics are enabled. To switch them off, set `runtimeMetricsEnabled` to `false`:

```javascript
const { start } = require('@splunk/otel');

start({
  serviceName: 'my-service',
  metrics: {
    runtimeMetricsEnabled: false,
  },
});
```

