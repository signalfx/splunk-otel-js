> The official Splunk documentation for this page is [Troubleshoot Node.js instrumentation](https://docs.splunk.com/Observability/gdi/get-data-in/application/nodejs/troubleshooting/common-nodejs-troubleshooting.html). For instructions on how to contribute to the docs, see [CONTRIBUTING.md](../CONTRIBUTING.md#documentation).

# Troubleshooting

Diagnostic logs can help you troubleshoot instrumentation issues.

To enable diagnostic logging, set the `logLevel` option or `OTEL_LOG_LEVEL` environment variable to `debug`.

Available values, from least to most detailed, are `error`, `warn`, `info`, `debug`, `verbose`.

To disable logging after it has been enabled:

```javascript
  const { diag } = require('@opentelemetry/api');
  diag.setLogger();
```

> Enable debug logging only when needed. Debug mode requires more resources.

## Webpack compatibility issues

The Splunk Distribution of OpenTelemetry JS can't instrument modules
bundled using Webpack, as OpenTelemetry can instrument libraries only by
intercepting its `require` calls.

To instrument Node applications that use bundled modules, use the
Webpack `externals` configuration option so that the `require` calls are
visible to OpenTelemetry.

The following example shows how to edit the `webpack.config.js` file to
instrument the `express` framework:

``` javascript
module.exports = {
   // ...
   externalsType: "node-commonjs",
   externals: [
      "express"
   // See https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node
   // for a list of supported instrumentations. Use the require name of the library or framework,
   // not the name of the instrumentation. For example, "tedious" instead of "instrumentation-tedious".
   ]
};
```

When added to `externals`, the `express` framework loads through the
`require` method and OpenTelemetry can instrument it. Make sure that the
package is in the `node_modules` folder so that the `require` method can
find it:

``` shell
# Install the library or framework and add it to node_modules
npm install express
```

For a code example of the workaround, see https://github.com/signalfx/splunk-otel-js-webpack-workaround/blob/main/webpack.config.js

> **Note**: You don't need to add Node.js core modules such as `http`, `net`, and
`dns` to the `externals` list.
