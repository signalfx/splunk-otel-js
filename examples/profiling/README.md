# Profiling Example

This example showcases enabling profiling for Splunk APM. There's no official support for profiling in OTel, so profiling requires working with some Splunk-specific components.
By default, the example requires the OTel Collector to run with the OTLP receiver listening for logs on `localhost:4317`. To export profiling data to APM, you must set up `splunk_hec` exporter in the Collector. See [the example collector config](./collector-config.yml).

```shell
# Replace <...> with the correct values
export SPLUNK_REALM="<realm>"
export SPLUNK_ACCESS_TOKEN="<your access token>"
# Docker Compose configuration has been provided for convenience:
docker compose up
```

Then run the script in a separate terminal:

```shell
# Optional. To set the environment:
export OTEL_SERVICE_NAME='profiling-example'
export OTEL_RESOURCE_ATTRIBUTES='deployment.environment=dev'
export OTEL_LOG_LEVEL='DEBUG'
# Run the example:
npm start
```

The script will then export to collector on shutdown and the collector will take care of transforming the payload into `splunk_hec` format.
