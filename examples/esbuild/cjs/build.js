const { build } = require('esbuild');
const { splunkOtelEsbuild } = require('@splunk/otel-esbuild-plugin-node');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');

build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist_bundle/bundle.js',
  plugins: [splunkOtelEsbuild({
    instrumentations: [new ExpressInstrumentation()]
  })],
  keepNames: true,
}).catch(() => process.exit(1));
