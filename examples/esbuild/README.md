# ESBuild Example

This example demonstrates how to use ESBuild with Splunk OpenTelemetry instrumentation. 

## Structure

- `src/index.js` - Source Express.js application
- `build.js` – ESBuild configuration for CommonJS output. To build the project as ESM, add the property `format: 'esm'` in `build.js`.
- `dist_bundle/` - Default output directory for bundled files

## Available Scripts

- `npm run clear-bundle` - Remove the bundle directory
- `npm run esbuild` - Build bundle
- `npm run esbuild-start` - Start the bundled app
- `npm start` - Build and run the ap (default for e2e tests)

## How it works

The ESBuild plugin `splunkOtelEsbuild` automatically:

1. Bundles splunk-otel-js
2. Handles native extensions for profiling and metrics
3. Provides compatibility shims for ESM/CJS interop
4. Resolves instrumentation dependencies correctly

**Note:** ESBuild may rename functions during bundling to avoid naming conflicts — this is expected behavior and does not affect functionality. For example, Express middleware functions might appear as `query2` instead of `query` in trace data.
To preserve original function names, set the `keepNames` option to `true`:

```ts
keepNames: true
```



## Testing

```bash
npm start
```

Then visit:
- http://localhost:8080/main - Direct main endpoint

The application will be automatically instrumented and traces will be sent to the configured collector or directly to Splunk APM if realm and access token are configured.
