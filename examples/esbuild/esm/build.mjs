import { build } from 'esbuild';
import { splunkOtelEsbuild } from '@splunk/otel-esbuild-plugin-node';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
build({
  entryPoints: ['src/index.mjs'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'esm',
  outfile: 'dist_bundle/bundle.mjs',
  plugins: [splunkOtelEsbuild({
    instrumentations: [new ExpressInstrumentation()]
  })],
  keepNames: true,
}).catch(() => process.exit(1));
