# Basic Example

This example showcases basic integration with OpenTelemetry(OTel): automatic(HTTP calls) as well as manual([index.js](./index.js) manually creates spans) instrumentation.
By default it requires OTel Collector to be running with Jaeger reciever open on `localhost:14268`.

```shell
docker run --name otel-collector -d -p 14268:14268 otel/opentelemetry-collector
npm start
```

Then generate spans by making requests to the applications endpoints:

```shell
curl localhost:3000
```

The generated spans then appear in collector logs:

```shell
docker logs otel-collector -f 2>&1 | grep hello
```

### Running Collectorless

It's also possible to send the traces directly to Splunk APM. For that additional environment variables need to be set up:

```shell
# Replace <realm> with the correct realm:
export OTEL_EXPORTER_JAEGER_ENDPOINT="https://ingest.<realm>.signalfx.com/v2/trace"
export SPLUNK_ACCESS_TOKEN="<your access token>"
# Optional. To set the environment:
export OTEL_RESOURCE_ATTRIBUTES='deployment.environment=dev'
npm start
```

Generate spans the same way as above and you'll soon see your data on the dashboard of Splunk APM.
