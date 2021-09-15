## Using additional instrumentation plugins<a name="custom-instrumentation-packages"></a>

If you setup tracing manually by calling the `startTracing()` method, you can use custom or 3rd party instrumentations as long as they implement the [OpenTelemetry JS Instrumentation interface](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-instrumentation). Custom instrumentations can be enabled by passing them to the `startTracing()` method as follows:

```js
const { startTracing } = require('@splunk/otel');

startTracing({
  instrumentations: [
    new MyCustomInstrumentation(),
    new AnotherInstrumentation(),
  ]
});
```

You can also add the default set of instrumentation to the list as follows:

```js
const { startTracing } = require('@splunk/otel');
const { getInstrumentations } = require('@splunk/otel/lib/instrumentations');

startTracing({
  instrumentations: [
    ...getInstrumentations(),
    new MyCustomInstrumentation(),
    new AnotherInstrumentation(),
  ]
});
```