# Changelog

## Unreleased

- The default propagator was changed from B3 to a composite B3 + W3C tracecontext
  propagator. This means splunk-otel-js will now support both B3 and tracecontext
  at the same time.
- `startTracing()` options now accepts a `propagatorFactory` option which can be
  used configure custom text map propagator.

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