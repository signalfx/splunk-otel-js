# ESBuild Example

This example demonstrates how to use ESBuild with Splunk OpenTelemetry instrumentation. 
Navigate to either the `cjs` or `esm` folder, depending on whether you want to run the application using CommonJS or ESM.

## Structure

- `src/index` - Source Express.js application
- `build` – ESBuild configuration for CommonJS output. To build the project as ESM, add the property `format: 'esm'` in `build.js`.
- `dist_bundle/` - Default output directory for bundled files

## Available Scripts

- `npm run clear-bundle` - Remove the bundle directory
- `npm run esbuild` - Build bundle
- `npm run esbuild-start` - Start the bundled app
- `npm run start:collector` - Build and run the app with profiling and metrics enabled
- `npm start` - Build and run the app (default for e2e tests)

## How it works

The ESBuild plugin `splunkOtelEsbuild` automatically:

1. Bundles splunk-otel-js
2. Handles native extensions for profiling and metrics
3. Provides compatibility shims for ESM/CJS interop

**Note:** ESBuild may rename functions during bundling to avoid naming conflicts — this is expected behavior and does not affect functionality. For example, Express middleware functions might appear as `query2` instead of `query` in trace data.
To preserve original function names, set the `keepNames` option to `true`:

```ts
keepNames: true
```

## Running the App

```bash
npm start
```

For profiling and metrics (uses `.env.collector` configuration):

```bash
npm run start:collector
```

Then visit:
- http://localhost:8080/main - Direct main endpoint

The application will be automatically instrumented and traces will be sent to the configured collector or directly to Splunk APM if realm and access token are configured.
