> The official Splunk documentation for this page is [Instrument a Node application automatically](https://docs.splunk.com/Observability/gdi/get-data-in/application/nodejs/instrumentation/instrument-nodejs-application.html). For instructions on how to contribute to the docs, see [CONTRIBUTING.md](../CONTRIBUTING.md#documentation).

# Using custom or third-party instrumentations

If you set up tracing manually by calling the `start()` method, you can use custom or third-party instrumentations as long as they implement the [OpenTelemetry JS Instrumentation interface](https://github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-instrumentation). Custom instrumentations can be enabled by passing them to the `start()` method as follows:

```js
const { start } = require('@splunk/otel');

const AnotherInstrumentation = require('...');
const MyCustomInstrumentation = require('...');

start({
  tracing: {
    instrumentations: [
      new MyCustomInstrumentation(),
      new AnotherInstrumentation(),
    ],
  },
});
```

You can also add the default set of instrumentation to the list as follows:

```js
const { start } = require('@splunk/otel');
const { getInstrumentations } = require('@splunk/otel/lib/instrumentations');

const AnotherInstrumentation = require('...');
const MyCustomInstrumentation = require('...');

start({
  tracing: {
    instrumentations: [
      ...getInstrumentations(),
      new MyCustomInstrumentation(),
      new AnotherInstrumentation(),
    ],
  },
});
```
