# Splunk distribution of OpenTelemetry JS 

[![CircleCI](https://circleci.com/gh/signalfx/splunk-otel-js.svg?style=svg)](https://circleci.com/gh/signalfx/splunk-otel-js)
[![codecov](https://codecov.io/gh/signalfx/splunk-otel-js/branch/main/graph/badge.svg?token=XKXjEQKGaK)](https://codecov.io/gh/signalfx/splunk-otel-js)

The Splunk distribution of [OpenTelemetry
JS](https://github.com/open-telemetry/opentelemetry-js) provides
multiple installable packages that automatically instruments your Node 
application to capture and report distributed traces to Splunk APM.

This Splunk distribution comes with the following defaults:

- [B3 context propagation](https://github.com/openzipkin/b3-propagation).
- [Jaeger thrift
  exporter](https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-exporter-jaeger)
  configured to send spans to a locally running [SignalFx Smart
  Agent](https://docs.signalfx.com/en/latest/apm/apm-getting-started/apm-smart-agent.html)
  (`http://localhost:9080/v1/trace`).
- Unlimited default limits for [configuration options](#trace-configuration) to
  support full-fidelity traces.

If you're currently using the SignalFx Tracing Library for Node and want to
migrate to the Splunk Distribution of OpenTelemetry Node, see [Migrate from
the SignalFx Tracing Library for JS](migration.md).

> :construction: This project is currently in **BETA**.

## Getting Started

#### TODO

## All configuration options

### Jaeger exporter

| Environment variable          | Default value                        | Notes                                                                  |
| ----------------------------- | ------------------------------------ | ---------------------------------------------------------------------- |
| SPLK_TRACE_EXPORTER_URL       | `http://localhost:9080/v1/trace`     | The jaeger endpoint to connect to. Currently only HTTP is supported.   |
| SPLK_SERVICE_NAME             | `unnamed-node-service`               | The service name of this Node service.                                 |
| SPLK_ACCESS_TOKEN             |                                      | The optional organization access token for trace submission requests.  |

### Trace configuration

| Environment variable          | Default value  | Purpose                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------- | -------------- | ------------------------------------------------------------------------------------                                                                                                                                                                                                                                                                                                                      |
| SPLK_MAX_ATTR_LENGTH          | 1200            | Maximum length of string attribute value in characters. Longer values are truncated.                                                                                                                                                                                                                                                                                                                      |
| OTEL_RESOURCE_ATTRIBUTES      | unset          | Comma-separated list of resource attributes added to every reported span. <details><summary>Example</summary>`key1=val1,key2=val2`</details>
| OTEL_TRACE_ENABLED            | `true`         | Globally enables tracer creation and auto-instrumentation.                                                                                                                                                                                                                                                                                                                                                |

## Advanced Getting Started


## Exporting to Smart Agent, Otel collector or SignalFx ingest

This package exports spans in Jaeger Thrift format over HTTP and supports
exporting to the SignalFx Smart Agent, OpenTelemetry collector and directly to
SignalFx ingest API. You can use `SPLK_TRACE_EXPORTER_URL` environment variable
to specify an export URL. The value must be a full URL including scheme and
path.

### Smart Agent

This is the default option. You do not need to set any config options if you
want to export to the Smart Agent and you are running the agent on the default
port (`9080`). The exporter will default to `http://localhost:9080/v1/trace`
when the environment variable is not specified.

### OpenTelemetry Collector

In order to do this, you'll need to enable Jaeger Thrift HTTP receiver on
OpenTelemetry Collector and set `SPLK_TRACE_EXPORTER_URL` to
`http://localhost:14268/api/traces` assuming the collector is reachable via
localhost.

### SignalFx Ingest API

In order to send traces directly to SignalFx ingest API, you need to:

1. Set `SPLK_TRACE_EXPORTER_URL` to
   `https://ingest.<realm>.signalfx.com/v2/trace` where `realm` is your
   SignalFx realm e.g, `https://ingest.us0.signalfx.com/v2/trace`.
2. Set `SPLK_ACCESS_TOKEN` to one of your SignalFx APM access tokens.


## Manually instrument an application

TODO:

## Troubleshooting

TODO:

# License and versioning

The Splunk distribution of OpenTelemetry JS Instrumentation is a
distribution of the [OpenTelemetry JS project](https://github.com/open-telemetry/opentelemetry-js).
It is released under the terms of the Apache Software License version 2.0. See [the
license file](./LICENSE) for more details.
