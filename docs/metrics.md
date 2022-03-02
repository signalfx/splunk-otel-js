# Metrics

> :construction: &nbsp;Status: Experimental - exported metric data and
> configuration properties will change once OpenTelemetry metrics become available.

The Splunk Distribution for OpenTelemetry Node.js configures the default OpenTelemetry meter provider and can collect
runtime metrics.

## Configuration

For configuration options, see [advanced configuration](advanced-config.md#metrics).

## Usage (custom metrics)

[Documentation](https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_api_metrics.html) for OpenTelemetry metrics API.

Add `@opentelemetry/api-metrics` to your dependencies.

```javascript
const { startMetrics } = require('@splunk/otel');
const { metrics } = require('@opentelemetry/api-metrics');

startMetrics();

const meter = metrics.getMeter('my-app');
const counter = meter.createCounter('foo');
counter.add(3);
```

## Runtime metrics

Runtime metrics are disabled by default and need to be explicitly [enabled](advanced-config.md#metrics).

The following is a list of metrics automatically collected and exported:

- `process.runtime.nodejs.memory.heap.total` (gauge, bytes) - Heap total via `process.memoryUsage().heapTotal`.
- `process.runtime.nodejs.memory.heap.used` (gauge, bytes) - Heap used via `process.memoryUsage().heapUsed`.
- `process.runtime.nodejs.memory.rss` (gauge, bytes) - Resident set size via `process.memoryUsage().rss`.

Coming soon:
- `process.nodejs.memory.gc.size` (counter, bytes) - Total collected by the garbage collector.
- `process.nodejs.memory.gc.pause` (counter, nanoseconds) - Time spent doing GC.
- `process.nodejs.memory.gc.count` (counter, count) - Number of times GC ran.
- `process.nodejs.event_loop.lag.max` (gauge, nanoseconds) - Max event loop lag within the collection interval.
- `process.nodejs.event_loop.lag.min` (gauge, nanoseconds) - Min event loop lag within the collection interval.
