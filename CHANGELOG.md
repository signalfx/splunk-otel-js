# Change Log - @splunk/otel

This log was last generated on Tue, 12 Oct 2021 06:38:40 GMT and should not be manually modified.

<!-- Start content -->

## 0.14.0

Tue, 12 Oct 2021 06:38:40 GMT

### Minor changes

- feat: remove support for `maxAttrLength` (rauno56@gmail.com)
- feat: warn about missing service.name and no instrumentations (rauno56@gmail.com)
- feat: give OTEL_SPAN_LINK_COUNT_LIMIT and OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT GDI spec compliant defaults (rauno56@gmail.com)
- chore: update core OTel deps to v1.0 (rauno56@gmail.com)

## 0.13.0

Mon, 04 Oct 2021 12:27:07 GMT

### Minor changes

- feat: use gRPC by default and Jaeger for collectorless scenario (Rauno56@gmail.com)
- feat: remove logInjectionEnabled and SPLUNK_LOGS_INJECTION options (Rauno56@gmail.com)
- feat: add the option to capture URL parameters (siimkallas@gmail.com)

### Patches

- Update development dependencies (Rauno56@gmail.com)
- Updated OTel dependencies (Rauno56@gmail.com)

## 0.12.0

Tue, 07 Sep 2021 12:05:40 GMT

### Minor changes

- Added change management using beachball (jakubmal+github@gmail.com)
- Make w3c(tracecontext, baggage) the default propagation mechanism (Rauno56@gmail.com)

## 0.11.0 (2021-07-23)

- Support for Synthetic Run identification
  ([#156](https://github.com/signalfx/splunk-otel-js/pull/156))

## 0.10.0 (07-09-2021)

- Rename `SPLUNK_SERVICE_NAME` to `OTEL_SERVICE_NAME`
  ([#170](https://github.com/signalfx/splunk-otel-js/pull/170))
- Upgrade to OpenTelemetry SDK 0.23.0
  ([#173](https://github.com/signalfx/splunk-otel-js/pull/173))

## 0.9.0 (07-02-2021)

- Add support for injecting trace context into logs.
  ([#121](https://github.com/signalfx/splunk-otel-js/pull/121))
- Rename `SPLUNK_CONTEXT_SERVER_TIMING_ENABLED`
  ([#149](https://github.com/signalfx/splunk-otel-js/pull/149))
- Upgrade to OpenTelemetry SDK 0.22.0, API 1.0.0.
  ([#153](https://github.com/signalfx/splunk-otel-js/pull/153))

## 0.8.0 (04-15-2021)

- Added support for `aws-sdk`, `mongoose`, `sequelize`, `typeorm` and `kafkajs`.
  ([#83](https://github.com/signalfx/splunk-otel-js/pull/83))

## 0.7.0 (04-15-2021)

- Add injection of `Server-Timing` header.
  ([#70](https://github.com/signalfx/splunk-otel-js/pull/70))
- Add support for amqplib and elasticsearch
  ([#74](https://github.com/signalfx/splunk-otel-js/pull/74))

## 0.6.0 (03-29-2021)

### Changed

- Context management should not work properly on older versions of Node.js (<14.8).
  ([#53](https://github.com/signalfx/splunk-otel-js/pull/53))


## 0.5.0 (03-24-2021)

- Replaced `SPLUNK_TRACE_EXPORTER_URL` with `OTEL_EXPORTER_JAEGER_ENDPOINT`.
- The default propagator was changed from B3 to a composite B3 + W3C tracecontext
  propagator. This means splunk-otel-js will now support both B3 and tracecontext
  at the same time.
- `startTracing()` options now accepts a `propagatorFactory` option which can be
  used configure custom text map propagator.
- Listed instrumentations as (optional) peer dependencies. This makes
require()'ing instrumentations safer despite @splunk/otel not listing
them as dependencies. Marking them optional ensures npm7 will not
automatically install these packages. Note that this will still result
in warnings for users on npm <7.
- Added suport for the following instrumentations out of the box:
  - @opentelemetry/instrumentation-express
  - @opentelemetry/instrumentation-ioredis
  - @opentelemetry/instrumentation-mongodb
  - @opentelemetry/instrumentation-mysql
  - @opentelemetry/instrumentation-net
  - @opentelemetry/instrumentation-pg
  - @opentelemetry/instrumentation-hapi
- Removed support for the following instrumentations:
  - @opentelemetry/hapi-instrumentation

## 0.4.0 (03-12-2021)

### Changes

- Changed environment variable prefix from `SPLK_` to `SPLUNK_`. All environment
  variables must be updated for the library to continue to work.

## 0.3.0 (03-11-2021)

### Changed

- `startTracing()` options now accepts a `tracerConfig` option which is
  merged with the default tracer config and passed on to the tracer provider.

- Added `spanExporterFactory` option to `startTracing()` options.
  `spanExporterFactory` receives a processed `Options` instance and
  returns a new instance of `Exporter`.

- Replaced `spanProcessor` option with `spanProcessorFactory`.
  `startTracing()` options now accepts a `spanProcessorFactory` function. The function
  accept a processed `Options` instance and returns a `SpanProcessor`
  instance or an array of `SpanProcessor` instances. It can be used to configure tracing
  with custom Span Processor. If it returns multiple span processors, all of them will
  be used.
