# Mixed Instrumentation

This example showcases a more extensive integration with OpenTelemetry(OTel):

1. automatic HTTP call instrumentation via `@opentelemetry/instrumentation-http`,
2. manual instrumentation: [index.js](./index.js) manually creates spans for custom "work",
3. log injection: the example is using a logging library `pino` for structured logging, `trace_id` and `span_id` properties are added to every log line automatically.

By default it requires OTel Collector to be running with OTLP reciever open on `localhost:4317`.

```shell
# Exposing ports for OTLP/gRPC and OTLP/HTTP from collector
docker run --name otel-collector -d -p 4317:4317 -p 4318:4318 otel/opentelemetry-collector
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

and the application logs to stdout:

```
{"level":30,"time":1979374615686,"pid":728570,"hostname":"my_host","trace_id":"f8e261432221096329baf5e62090d856","span_id":"3235afe76b55fe51","trace_flags":"01","url":"/lkasd","msg":"request handler"}
{"level":30,"time":1979374615689,"pid":728570,"hostname":"my_host","trace_id":"f8e261432221096329baf5e62090d856","span_id":"3235afe76b55fe51","trace_flags":"01","duration":300,"msg":"working"}
```

### Running Collectorless

It's also possible to send the traces directly to Splunk APM. For that additional environment variables need to be set up:

```shell
export OTEL_TRACES_EXPORTER="otlp-splunk"
# Replace <realm> with the correct realm:
export SPLUNK_REALM="<your Splunk APM realm>"
export SPLUNK_ACCESS_TOKEN="<your access token>"
# Optional. To set the environment:
export OTEL_RESOURCE_ATTRIBUTES='deployment.environment=dev'
npm start
```

Generate spans the same way as above and you'll soon see your data on the dashboard of Splunk APM.
