# Change Log - @splunk/otel

## 4.0.0

- Upgrade to OpenTelemetry SDK 2.0. [#1020](https://github.com/signalfx/splunk-otel-js/pull/1020).
  * Minimum Node.js version has been bumped to `^18.19.0 || >=20.6.0`.
  * Refer to https://github.com/open-telemetry/opentelemetry-js/releases/tag/v2.0.0 and the [upgrade guide](https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/upgrade-to-2.x.md) for the complete list of breaking changes in OpenTelemetry JS.
  * Notable changes relevant to `@splunk/otel`:
    * Resource can no longer be created with `new Resource({})`, instead use `resourceFromAttributes({})` when passing in a resource:
      ```ts
      import { start } from '@splunk/otel';
      import { resourceFromAttributes } from '@opentelemetry/resources';

      start({
        resource: (detectedResource) => {
          return detectedResource.merge(resourceFromAttributes({
            'my.attribute': 'foo',
          }));
        },
      })
      ```
    * `Span` no longer has a `parentSpanId` field, use `parentSpanContext.spanId`:
      ```ts
      import { start } from '@splunk/otel';
      import { Context } from '@opentelemetry/api';
      import { ReadableSpan, Span } from '@opentelemetry/sdk-trace-base';
      import { SpanProcessor } from '@opentelemetry/sdk-trace-base';

      class MySpanProcessor implements SpanProcessor {
        onStart(span: Span, _parentContext: Context): void {
          console.log(span.parentSpanContext?.spanId);
        }

        onEnd(span: ReadableSpan): void {
          console.log(span.parentSpanContext?.spanId);
        }

        forceFlush(): Promise<void> {
          return Promise.resolve();
        }

        shutdown(): Promise<void> {
          return Promise.resolve();
        }
      }

      start({
        tracing: {
          spanProcessorFactory: (_opts) => [new MySpanProcessor()],
        },
      });
      ```
    * Passing in custom views to metrics is now done via `ViewOptions` interface instead of `new View({ ... })`:
      ```ts
      import { start } from '@splunk/otel';

      start({
        metrics: { views: [{ name: 'clicks', instrumentName: 'my-counter', }], },
      })
      ```
- [`@opentelemetry/instrumentation-fastify`](https://www.npmjs.com/package/@opentelemetry/instrumentation-fastify) has been deprecated and is replaced with [`@fastify/otel`](https://www.npmjs.com/package/@fastify/otel).
- Add an experimental HTTP instrumentation based on diagnostics channel. [#1021](https://github.com/signalfx/splunk-otel-js/pull/1021)
- Add `oracledb` and `openai` instrumentations. [#1041](https://github.com/signalfx/splunk-otel-js/pull/1041)
- New `nocode` instrumentation that allows instrumenting of custom code. Refer to the [overview](https://github.com/signalfx/splunk-otel-js/blob/main/src/instrumentations/external/nocode/nocode.md) for usage.
- `typeorm` instrumentation has migrated to [upstream](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-typeorm) and is now using updated semantic conventions, e.g. `db.namespace`, `db.operatio.name`, `db.collection.name`, `db.query.text`, `db.system.name`.
- `@opentelemetry/instrumentation-redis-4` has been removed as it has been merged to `@opentelemetry/instrumentation-redis` in the upstream.

## 3.3.0

- Add the option to use AWS Xray propagator. [#1028](https://github.com/signalfx/splunk-otel-js/pull/1028)

## 3.2.0

- Upgrade to OpenTelemetry `1.30.1` / `0.57.2`. [#1024](https://github.com/signalfx/splunk-otel-js/pull/1024)
- Add prebuilt binaries for Node.js 24. [#1024](https://github.com/signalfx/splunk-otel-js/pull/1024)
- Add support for snapshot profiling (callgraphs). [#1023](https://github.com/signalfx/splunk-otel-js/pull/1023)

## 3.1.2

- Add prebuilds for Apple silicon. [#1016](https://github.com/signalfx/splunk-otel-js/pull/1016)
- Fix compilation on macOS with Xcode 16.3. [#1016](https://github.com/signalfx/splunk-otel-js/pull/1016)

## 3.1.1

- Fix loading of neo4j-driver instrumentation. [#1013](https://github.com/signalfx/splunk-otel-js/pull/1013)

## 3.1.0

- Add neo4j-driver instrumentation. [#1010](https://github.com/signalfx/splunk-otel-js/pull/1010)

## 3.0.1

- Make 3.x latest instead of 2.16

## 3.0.0

> [!WARNING]
>### Breaking changes
>- Raise the minimum required Node.js version to 18. If Node <18 is a requirement, [2.x](https://github.com/signalfx/splunk-otel-js/tree/2.x) is still maintained and package versions 2.x can be used.
>- Change the default OTLP protocol from `grpc` to `http/protobuf`. The default exporting endpoint has been changed from `http://localhost:4317` to `http://localhost:4318`. Signal specific URL paths are automatically added when choosing the endpoint, e.g. when `endpoint` is set to `http://collector:4318`, `/v1/traces` is added for traces.
>- Change the default sampler from `parentbased_always_on` to `always_on`.
>- Profiling configuration: `resource: Resource` field has been changed to `resourceFactory: (resource: Resource) => Resource` to bring it in line with tracing and metrics configuration.

- Improve the start API to avoid duplicating parameters in the signal specific configuration.
  * Add `resource` field - a function which can be used to overwrite or add additional parameters to the resource detected from the environment.

    ```ts
    import { start } from '@splunk/otel';
    import { Resource } from '@opentelemetry/resources';

    start({
      serviceName: 'example',
      resource: (detectedResource) => {
        return detectedResource.merge(new Resource({ 'service.version': '0.2.0' }));
      },
    });
    ```

  * Add `realm` field. When set passes the access token and realm to signals.

    ```ts
    import { start } from '@splunk/otel';

    start({
      serviceName: 'example',
      realm: 'us0',
      accessToken: '<token>'
    });

    // Traces and metrics are now sent to the us0 backend.
    ```

  Signal specific options can still be used and take preference over the shared configuration options.
- `splunk.distro.version` (automatically added resource attribute) has been removed and is replaced with `telemetry.distro.version` and `telemetry.distro.name`.
- `SPLUNK_METRICS_ENDPOINT` environment variable has been removed. Use the OpenTelemetry specific `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` instead.
- Fix logging of `service.name` attribute not set from each signal, when the service name is not set.
- Add prebuilt binaries for Node.js 22 and 23.
- Upgrade to OpenTelemetry `1.30.0` / `0.57.0`.

## 3.0.0-rc1

- Changes moved to 3.0.0.

## 2.15.0

- Upgrade to OpenTelemetry `1.28.0` / `0.55.0`. [#987](https://github.com/signalfx/splunk-otel-js/pull/987)

## 2.14.0

- Add Node.js 22 to prebuilds. [#963](https://github.com/signalfx/splunk-otel-js/pull/963)

## 2.13.0

- Add an optional workaround for Next.js span cardinality issues. Can be enabled by setting `SPLUNK_NEXTJS_FIX_ENABLED` to `true`. [#957](https://github.com/signalfx/splunk-otel-js/pull/957)

## 2.12.0

- Add `resourceFactory` option for traces. Allows for customization of the detected resource. Previously a resource could be provided via `tracerConfig`, but this overwrote the detected attributes. For backwards compatibility the latter option is still possible. [#938](https://github.com/signalfx/splunk-otel-js/pull/938)
- Support `none` value for `OTEL_TRACES_EXPORTER` and `OTEL_METRICS_EXPORTER` environment variables. [#939](https://github.com/signalfx/splunk-otel-js/pull/939)
- Use the default `OTEL_BSP_SCHEDULE_DELAY` of `5000` instead of `500`. This was a workaround for an old `BatchSpanProcessor` bug where it failed to flush spans fully. [#940](https://github.com/signalfx/splunk-otel-js/pull/940)
- Disable log sending for Winston instrumentation by default. Add `winston-transport` package as a dependency in case log collection is enabled. [#941](https://github.com/signalfx/splunk-otel-js/pull/941)
- Use a synchronous container detector from upstream. [#944](https://github.com/signalfx/splunk-otel-js/pull/944)
- Add deprecation annotations to signal-specific start calls. [#885](https://github.com/signalfx/splunk-otel-js/pull/885)
- Upgrade to OpenTelemetry `1.26.0` / `0.53.0`. [#945](https://github.com/signalfx/splunk-otel-js/pull/945)

## 2.11.0

- Bundle instrumentations for `undici`, `socket.io` and `lru-memoizer` by default. [#934](https://github.com/signalfx/splunk-otel-js/pull/934)

## 2.10.0

- Use environment, process, host and OS detectors from upstream. Update container detector to support cgroup v2. [#925](https://github.com/signalfx/splunk-otel-js/pull/925)
- Use explicit imports when loading instrumentations [#926](https://github.com/signalfx/splunk-otel-js/pull/926)

## 2.9.0

- Upgrade to OpenTelemetry `1.25.1` / `0.52.1`. [#912](https://github.com/signalfx/splunk-otel-js/pull/912)
- Use kafkajs instrumentation from upstream. [#913](https://github.com/signalfx/splunk-otel-js/pull/913)

## 2.8.0

- Upgrade to OpenTelemetry `1.24.0` / `0.51.0`. [#902](https://github.com/signalfx/splunk-otel-js/pull/902)

## 2.7.1

- Fix reporting of `profiling.data.total.frame.count`. [#886](https://github.com/signalfx/splunk-otel-js/pull/886)

## 2.7.0

- Upgrade to OpenTelemetry `1.21.0` / `0.48.0`. [#874](https://github.com/signalfx/splunk-otel-js/pull/874)
- GraphQL instrumentation: spans for resolvers are no longer generated. This brings in significant performance improvements for queries hitting lots of resolvers. `SPLUNK_GRAPHQL_RESOLVE_SPANS_ENABLED=true` environment variable can be used to unignore resolve spans.

## 2.6.1

- Fix potential memory leak when CPU profiling is active. [#858](https://github.com/signalfx/splunk-otel-js/pull/858)
- Upgrade to protobuf.js 7.2.5. [#859](https://github.com/signalfx/splunk-otel-js/pull/859)

## 2.6.0

- Add missing telemetry.sdk.version to profiling payloads. #[854](https://github.com/signalfx/splunk-otel-js/pull/854)
- Upgrade to OpenTelemetry `1.18.1` / `0.45.1`. [#852](https://github.com/signalfx/splunk-otel-js/pull/852)
- Add Linux ARM64 prebuilt binaries. [#850](https://github.com/signalfx/splunk-otel-js/pull/850)

## 2.5.1

- Prebuild the native module for Node.js 21. [#838](https://github.com/signalfx/splunk-otel-js/pull/838)

## 2.5.0

- Upgrade to OpenTelemetry `1.17.1` / `0.44.0`. [#822](https://github.com/signalfx/splunk-otel-js/pull/822)

## 2.4.4

- Support older libc++ ABIs. This should remove the need for a compilation step on CentOS 7 when running npm install. [#806](https://github.com/signalfx/splunk-otel-js/pull/806)

## 2.4.3

- Compare kafka header values case insensitively. Fixed split traces when b3 propagation is used over kafka headers and the producer does not use lowercase keys. [#804](https://github.com/signalfx/splunk-otel-js/pull/804)

## 2.4.2

September 20, 2023

- Add support for `OTEL_METRICS_EXPORTER=none`. [#801](https://github.com/signalfx/splunk-otel-js/pull/801)

## 2.4.1

August 28, 2023

- Add missing `forceFlush` method to the `NoopMeterProvider`. Some instrumentations (AWS Lambda) logged an error when `forceFlush` was unavailable. [#788](https://github.com/signalfx/splunk-otel-js/pull/788) [#791](https://github.com/signalfx/splunk-otel-js/pull/791)

## 2.4.0

August 18, 2023

- Fix the error message about an unavailable exporter (e.g. `Exporter "otlp" requested through environment variable is unavailable.`) when `OTEL_TRACES_EXPORTER` is set. Workaround for https://github.com/open-telemetry/opentelemetry-js/issues/3422. [#783](https://github.com/signalfx/splunk-otel-js/pull/783)
- Explicitly set a meter provider for instrumentations. `NoopMeterProvider` is set by default. If metrics are enabled and `SPLUNK_INSTRUMENTATION_METRICS_ENABLED` is set to true, instrumentation specific metrics will be emitted, for example `http.server.duration` from the `http` instrumentation. [#784](https://github.com/signalfx/splunk-otel-js/pull/784)

## 2.3.2

August 9, 2023

- Upgrade to OpenTelemetry `1.15.2` / `0.41.2`. [#778](https://github.com/signalfx/splunk-otel-js/pull/778)

## 2.3.1

August 2, 2023

- Support Node.js 20 [#771](https://github.com/signalfx/splunk-otel-js/pull/771)

## 2.3.0

August 1, 2023

- Upgrade to OpenTelemetry `1.15.1` / `0.41.1`. [#761](https://github.com/signalfx/splunk-otel-js/pull/761)
- Fix confusing error message regarding `grpc`: `@opentelemetry/instrumentation-grpc Module @grpc/grpc-js has been loaded before @opentelemetry/instrumentation-grpc so it might not work, please initialize it before requiring @grpc/grpc-js`. `grpc` is internally now lazily loaded. [#762](https://github.com/signalfx/splunk-otel-js/pull/762)
- Allow enabling and disabling instrumentations via environment variables by introducing `OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED` and `OTEL_INSTRUMENTATION_[NAME]_ENABLED`. [#769](https://github.com/signalfx/splunk-otel-js/pull/769)

## 2.2.4

July 1, 2023

- fix: pin OpenTelemetry dependencies to avoid multiple versions of `@opentelemetry/instrumentation` packages being loaded at the same time [#745](https://github.com/signalfx/splunk-otel-js/pull/745)

## 2.2.3

June 27, 2023

- Fixed `logLevel` configuration option for `start` function throwing an error [#741](https://github.com/signalfx/splunk-otel-js/pull/741)
- Added Docker image for the OpenTelemetry Operator for Kubernetes [#740](https://github.com/signalfx/splunk-otel-js/pull/740)

## 2.2.2

May 3, 2023

- Internal: added frame count to profiling data. [#726](https://github.com/signalfx/splunk-otel-js/pull/726)

## 2.2.1

April 5, 2023

- Fixed [`@opentelemetry/instrumentation-mongoose`](https://www.npmjs.com/package/@opentelemetry/instrumentation-mongoose) not being loaded. [#715](https://github.com/signalfx/splunk-otel-js/pull/715)

## 2.2.0

March 22, 2023

- Fixed `SPLUNK_REALM` environment variable taking precedence over endpoint supplied programmatically. `endpoint` now correctly overrides the endpoint created via `SPLUNK_REALM` and when both are set logs a warning. [#668](https://github.com/signalfx/splunk-otel-js/pull/668)
- Empty environment variables are now considered as not defined. [#693](https://github.com/signalfx/splunk-otel-js/pull/693)
- New configuration option: `SPLUNK_DEBUG_METRICS_ENABLED` / `metrics.debugMetricsEnabled`. [#700](https://github.com/signalfx/splunk-otel-js/pull/700) When set, extra set of internal troubleshooting metrics are produced. This should only be enabled to assist debugging. Defaults to `false`. Currently debug metrics for the CPU and memory profiler are produced, each being a histogram:
  - `splunk.profiler.cpu.start.duration`
  - `splunk.profiler.cpu.stop.duration`
  - `splunk.profiler.cpu.process.duration`
  - `splunk.profiler.heap.collect.duration`
  - `splunk.profiler.heap.process.duration`
- Upgrade to OpenTelemetry `1.10.1` / `0.35.1`. The full changes can be seen at OpenTelemetry JS releases:
  - [`1.9.0`](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.9.0)
  - [`1.9.1`](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.9.1)
  - [`1.10.0`](https://github.com/open-telemetry/opentelemetry-js/releases/tag/v1.10.0)
  - [`0.35.0`](https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.35.0)
  - [`0.35.1`](https://github.com/open-telemetry/opentelemetry-js/releases/tag/experimental%2Fv0.35.1)

## 2.1.0

December 1, 2022

- Deduce the service name from `package.json` if it is not explicitly configured. [#625](https://github.com/signalfx/splunk-otel-js/pull/625)
- Fix console metric exporter omitting datapoint specific attributes. [#626](https://github.com/signalfx/splunk-otel-js/pull/626)

## 2.0.0

November 22, 2022

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

October 31, 2022

- Omit setting the default endpoint for metrics, as OpenTelemetry OTLP metrics exporters already have their own default configuration [#592](https://github.com/signalfx/splunk-otel-js/pull/592)

## 2.0.0-rc1

October 28, 2022

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
  The internal SignalFx client is no longer available to users, if you have been using custom metrics with the SignalFx client provided by Splunk OpenTelemetry JS distribution, see the [Migrate from the SignalFx Tracing Library for NodeJS](https://quickdraw.splunk.com/redirect/?product=Observability&version=current&location=nodejs.application.migrate) in the official documentation.

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
