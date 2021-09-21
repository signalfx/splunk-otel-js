# Mixed Instrumentation

This example showcases a more extensive integration with OpenTelemetry(OTel):

1. automatic instrumentation: HTTP calls are instrumented by installing `@opentelemetry/instrumentation-http`,
2. manual instrumentation: [index.js](./index.js) manually creates spans for custom "work",
3. log injection: the example is using a logging library `pino` for structured logging, `trace_id` and `span_id` properties are added to every log line automatically.

By default it requires OTel Collector to be running with OTLP reciever open on `localhost:55681`.

```shell
docker run --name otel-collector -d -p 55681:55681 otel/opentelemetry-collector
npm start
```

Then generate spans by making requests to the applications endpoints:

```shell
curl localhost:8080
```

The generated spans then appear in collector logs:

```shell
docker logs otel-collector -f 2>&1 | grep work
```

### Running Collectorless

It's also possible to send the traces directly to Splunk APM. For that additional environment variables need to be set up:

```shell
# Replace <realm> with the correct realm:
export OTEL_EXPORTER_OTLP_ENDPOINT="https://ingest.<realm>.signalfx.com/v2/trace/otlp"
export SPLUNK_ACCESS_TOKEN="<your access token>"
# Optional. To set the environment:
export OTEL_RESOURCE_ATTRIBUTES='deployment.environment=dev'
npm start
```

Generate spans the same way as above and you'll soon see your data on the dashboard of Splunk APM.
