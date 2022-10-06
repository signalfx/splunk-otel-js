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
const { start } = require('@splunk/otel');

// NOTE: profiling needs to be started before tracing. This will be fixed in future versions.
start({
  serviceName: 'my-service',
  profiling: {
    // Optional, disabled by default
    memoryProfilingEnabled: true,
  },
  tracing: {
    // additional tracing options if needed
  },
});
```


### Memory profiling

Memory profiling is disabled by default. You can enable it via the `memoryProfilingEnabled` flag.

Internally the profiler uses V8's sampling heap profiler, where it periodically queries for new allocation samples from the allocation profile.

You can tune [V8 heap profiler's parameters](https://v8.github.io/api/head/classv8_1_1HeapProfiler.html#a6b9450bbf1f4e1a4909df92d4df4a174) using the `memoryProfilingOptions` configuration field:

```javascript
start({
  serviceName: 'my-service',
  profiling: {
    memoryProfilingEnabled: true,
    memoryProfilingOptions: {
      maxStackDepth: 128, // default: 256
      sampleIntervalBytes: 1024 * 64, // default: 1024 * 128
    },
  },
  // can omit `tracing` property when running on default configuration
});
```
