# Change Log - @splunk/otel

## 2.0.0

22nd of November, 2022

For a list of major changes and features in `2.0.0` see the notes for [`2.0.0-rc1`](CHANGELOG.md#200-rc1).

Additional changes in this release:
- Upgrade to OpenTelemetry JS 1.8.0 / 0.34.0. [#612](https://github.com/signalfx/splunk-otel-js/pull/612)
- Remove `@opentelemetry/instrumentation-aws-lambda` from the bundled packages as there exists a separate [lambda instrumentation](https://github.com/signalfx/splunk-otel-lambda) and due to the package not being compatible with `@opentelemetry/instrumentation@0.34.0`. [#612](https://github.com/signalfx/splunk-otel-js/pull/612).
- `@opentelemetry/api` is now a peer dependency and the required version has been bumped to `1.3.0`.
- `OTEL_LOG_LEVEL` now also sets up the logging pipeline, thus diagnostic logging can now be enabled just by enabling it
  via the environment variable. The supported log level values are `none`, `verbose`, `debug`, `info`, `warn`, `error`.
  The logging pipeline can additionally be enabled by setting `logLevel` configuration option. [#605](https://github.com/signalfx/splunk-otel-js/pull/605).
- `process.command`, `process.command_line` and `process.runtime.description` resource attributes have been removed from the automatic process detection. [#613](https://github.com/signalfx/splunk-otel-js/pull/613)
- `OTEL_TRACES_EXPORTER` now only supports `otlp`, `console` or both (e.g. `OTEL_TRACES_EXPORTER=otlp,console`).
  [#599](https://github.com/signalfx/splunk-otel-js/pull/599)
- Add support for `OTEL_EXPORTER_OTLP_PROTOCOL`, `OTEL_EXPORTER_OTLP_TRACES_PROTOCOL`, `OTEL_EXPORTER_OTLP_METRICS_PROTOCOL`. The supported values are `grpc` (the default) or `http/protobuf`. [#599](https://github.com/signalfx/splunk-otel-js/pull/599) [#614](https://github.com/signalfx/splunk-otel-js/pull/614)

## 2.0.0-rc2

31st of October, 2022

- Omit setting the default endpoint for metrics, as OpenTelemetry OTLP metrics exporters already have their own default configuration [#592](https://github.com/signalfx/splunk-otel-js/pull/592)

## 2.0.0-rc1

28th of October, 2022

- ### Deprecate `startTracing`, `startMetrics`, `startProfiling` functions

  There is a new function called `start`, which can be used to start all 3 signals:
  ```js
  const { start } = require('@splunk/otel');

  start({
    serviceName: 'my-node-service',
    metrics: true, // Sets up OpenTelemetry metrics pipeline for custom metrics
    profiling: true, // Enables CPU profiling
  });
  ```

  If you have been only been using tracing, then `startTracing` can be replaced like this:

  ```js
  const { start } = require('@splunk/otel');

  start({
    serviceName: 'my-node-service',
    endpoint: 'http://collector:4317',
  });
  ```

  Signal-specific configuration options can still be passed in:

  ```js
  const { start } = require('@splunk/otel');

  start({
    serviceName: 'my-node-service',
    tracing: {
      instrumentations: [
        // Custom instrumentation list
      ],
    },
    metrics: {
      runtimeMetricsEnabled: true,
    },
    profiling: {
      memoryProfilingEnabled: true,
    }
  });
  ```

  For all possible options see [Advanced Configuration](./docs/advanced-config.md#advanced-configuration).

  The deprecated functions are still available, but using them will log a deprecation message.

- ### Replace SignalFx metrics with OpenTelemetry metrics
  
  SignalFx metrics SDK has been removed and replaced with OpenTelemetry Metrics SDKs.
  The internal SignalFx client is no longer available to users, if you have been using custom metrics with the SignalFx client provided by Splunk OpenTelemetry JS distribution, see the [migration guide](./docs/metrics.md#migrating-from-signalfx-metrics) for how to start using custom metrics via OpenTelemetry.

  Runtime metric names are now using [OpenTelemetry conventions](https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/semantic_conventions/runtime-environment-metrics.md), the following is a list of changed metric names:
  
  | SignalFx (no longer available) | OpenTelemetry                               |
  | ------------------------------ | ------------------------------------------- |
  | `nodejs.memory.heap.total`     | `process.runtime.nodejs.memory.heap.total`  |
  | `nodejs.memory.heap.used`      | `process.runtime.nodejs.memory.heap.used`   |
  | `nodejs.memory.rss`            | `process.runtime.nodejs.memory.rss`         |
  | `nodejs.memory.gc.size`        | `process.runtime.nodejs.memory.gc.size`     |
  | `nodejs.memory.gc.pause`       | `process.runtime.nodejs.memory.gc.pause`    | 
  | `nodejs.memory.gc.count`       | `process.runtime.nodejs.memory.gc.count`    | 
  | `nodejs.event_loop.lag.max`    | `process.runtime.nodejs.event_loop.lag.max` |
  | `nodejs.event_loop.lag.min`    | `process.runtime.nodejs.event_loop.lag.min` |

- ### Bundle instrumentations with the distribution

  It is no longer necessary to add instrumentation packages to your `package.json` file, unless you intend to use instrumentations not bundled in the distribution.

  For the list of instrumentations bundled by default see [Default instrumentation packages](./README.md#default-instrumentation-packages).

- ### Remove Jaeger exporter

  It is no longer possible to use the `jaeger-thrift-splunk` value for `OTEL_TRACES_EXPORTER` to send traces via Jaeger Thrift over HTTP.

  The default exporting format is still OTLP over gRPC, however it is now possible to use OTLP over HTTP by setting `OTLP_TRACES_EXPORTER` environment variable to `otlp-splunk`.

  If you want to keep using Jaeger exporter, you can use the [@opentelemetry/exporter-jaeger](https://www.npmjs.com/package/@opentelemetry/exporter-jaeger) package by specifying a custom span exporter for the tracing configuration:

  ```js
  const { start } = require('@splunk/otel');
  const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

  start({
    serviceName: 'my-node-service',
    tracing: {
      spanExporterFactory: (options) => {
        return new JaegerExporter({
          serviceName: options.serviceName,
          // Additional config
        })
      }
    },
  });
  ```

- ### Update OpenTelemetry SDKs

  Minimum Node.js version has been bumped to 14 due to OpenTelemetry SDKs dropping support for Node.js 12.

## 1.4.1

Wed, 22 Sep 2022 09:24:01 GMT

- chore: upgrade to signalfx 7.5.0 for Node.js 18 support [#557](https://github.com/signalfx/splunk-otel-js/pull/557)
- fix: don't log a diagnostic error when profiling is started [#556](https://github.com/signalfx/splunk-otel-js/pull/556)

## 1.4.0

Mon, 19 Sep 2022 12:41:01 GMT

- feat: add detector for container ID (cgroup v1) [#515](https://github.com/signalfx/splunk-otel-js/pull/515)
- feat: memory profiling [#524](https://github.com/signalfx/splunk-otel-js/pull/524)
- fix: support compilation on CentOS 7 [#552](https://github.com/signalfx/splunk-otel-js/pull/552)

## 1.3.0

Fri, 26 Aug 2022 09:07:44 GMT

### Minor changes

- feat: add support for SPLUNK_REALM (siimkallas@gmail.com)
- feat: export in pprof (rauno56@gmail.com)

## 1.2.1

Thu, 28 Jul 2022 07:45:57 GMT

### Patches

- feat: start profiling syncronously (rauno56@gmail.com)
- fix: profiling: avoid biased samples due to self sampling

## 1.2.0

Fri, 15 Jul 2022 15:39:32 GMT

### Minor changes

- feat: add a way to collect unformatted profiling data (rauno56@gmail.com)
- fix: use a 500ms default delay for batch span processor to avoid excessive throttling
- fix: support HTTP schemes for profiling logs exporter

## 1.1.0

Mon, 13 Jun 2022 08:22:59 GMT

### Minor changes

- feat: call shutdown in `stopTracing()` (rauno56@gmail.com)

## 1.0.0

Fri, 03 Jun 2022 13:48:20 GMT

### Major changes

- chore: remove support for deprecated `opentelemetry-instrumentation-amqplib` (rauno56@gmail.com)
- chore: remove support for deprecated `opentelemetry-instrumentation-aws-sdk` (rauno56@gmail.com)
- feat: throw when `startTracing` is called twice (rauno56@gmail.com)
- feat: throw when extraneous properties are provided (rauno56@gmail.com)
- chore: remove support for Node versions before LTS 12 (rauno56@gmail.com)
- feat: upgrade OTel deps and bump min instrumentation versions (rauno56@gmail.com)

### Minor changes

- feat: prebuild for node@18 (rauno56@gmail.com)
- feat: add splunk.distro.version resource attribute (rauno56@gmail.com)
- feat: bring in detectors for os.* and host.* attributes (rauno56@gmail.com)
- feat: add a generic start API (rauno56@gmail.com)
- feat: detect resource from process (rauno56@gmail.com)
- feat: throw when unexpected configuration provided (rauno56@gmail.com)
- feat: implement setting up ConsoleSpanExporter via env var (rauno56@gmail.com)

## 0.18.0

Thu, 21 Apr 2022 17:01:07 GMT

### Minor changes

- refactor: remove enabled flag from startMetrics options [#429](https://github.com/signalfx/splunk-otel-js/pull/429)
- chore: [update minimist to 1.2.6](https://security.snyk.io/vuln/SNYK-JS-MINIMIST-2429795) [#435](https://github.com/signalfx/splunk-otel-js/pull/435)
- chore: remove unnecessary dependency on jaeger-client [#445](https://github.com/signalfx/splunk-otel-js/pull/445)

## 0.17.0

Mon, 28 Feb 2022 12:54:34 GMT

### Minor changes

- add SPLUNK_REDIS_INCLUDE_COMMAND_ARGS env var to include redis command args in span's db.statement (siimkallas@gmail.com)

## 0.16.0

Thu, 10 Feb 2022 13:37:02 GMT

### Minor changes

- feat: implement the alpha version of profiling support (siimkallas@gmail.com)

### Patches

- chore: update dependencies (rauno56@gmail.com)

## 0.15.0

Thu, 11 Nov 2021 15:56:29 GMT

### Minor changes

- feat: add runtime metrics (siimkallas@gmail.com)
- feat: remove OTEL_TRACE_ENABLED (rauno56@gmail.com)

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
