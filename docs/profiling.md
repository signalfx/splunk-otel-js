# Profiling

> :construction: &nbsp;Status: Experimental - profiling is currently considered in alpha status and not suitable for production use.

Continuous profiling of applications.

## Configuration

When loading the instrumentation via CLI:

```
export SPLUNK_PROFILER_ENABLED=true
export SPLUNK_PROFILER_MEMORY_ENABLED=true
node -r @splunk/otel/instrument app.js
```

Or when using [advanced configuration](advanced-config.md):

```javascript
const { startProfiling } = require('@splunk/otel');

// NOTE: profiling needs to be started before tracing. This will be fixed in future versions.
startProfiling({
  serviceName: 'my-service',
  // Optional, disabled by default
  memoryProfilingEnabled: true,
});

startTracing({ ... });
```


### Memory profiling

Memory profiling is disabled by default. You can enable it via the `memoryProfilingEnabled` flag.

Internally the profiler uses V8's sampling heap profiler, where it periodically queries for new allocation samples from the allocation profile.

You can tune [V8 heap profiler's parameters](https://v8.github.io/api/head/classv8_1_1HeapProfiler.html#a6b9450bbf1f4e1a4909df92d4df4a174) using the `memoryProfilingOptions` configuration field:

```javascript
startProfiling({
  serviceName: 'my-service',
  memoryProfilingEnabled: true,
  memoryProfilingOptions: {
    maxStackDepth: 128, // default: 256
    sampleIntervalBytes: 1024 * 64, // default: 1024 * 128
  },
});
```
