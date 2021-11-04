# Metrics

> :construction: &nbsp;Status: Experimental - exported metric data and
> configuration properties will change once OpenTelemetry metrics become available.

The Splunk Distribution for OpenTelemetry Node.js gathers runtime metrics and allows to send custom metrics via a [SignalFx client](https://github.com/signalfx/signalfx-nodejs).

## Configuration

For configuration options, see [advanced configuration](advanced-config.md#metrics).

## Runtime metrics

The following is a list of metrics automatically collected and exported:

- `nodejs.memory.heap.total` (gauge, bytes) - Heap total via `process.memoryUsage().heapTotal`.
- `nodejs.memory.heap.used` (gauge, bytes) - Heap used via `process.memoryUsage().heapUsed`.
- `nodejs.memory.rss` (gauge, bytes) - Resident set size via `process.memoryUsage().rss`.
- `nodejs.memory.gc.size` (cumulative_counter, bytes) - Total collected by the garbage collector.
- `nodejs.memory.gc.pause` (cumulative_counter, nanoseconds) - Time spent doing GC.
- `nodejs.memory.gc.count` (cumulative_counter, count) - Number of times GC ran.
- `nodejs.event_loop.lag.max` (gauge, nanoseconds) - Max event loop lag within the collection interval.
- `nodejs.event_loop.lag.min` (gauge, nanoseconds) - Min event loop lag within the collection interval.

## Custom metrics

You can send custom metrics via the internal [SignalFx client](https://github.com/signalfx/signalfx-nodejs#reporting-data):

```javascript
const { startMetrics } = require('@splunk/otel');

const { getSignalFxClient } = startMetrics();

getSignalFxClient().send({
  gauges: [{ metric: 'my.app.foo', value: 42, timestamp: 1442960607000}]
})
```
