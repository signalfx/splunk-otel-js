# Changelog

## Unreleased

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