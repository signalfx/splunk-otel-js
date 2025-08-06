const { build } = require('esbuild');


// later change this line to:  const { splunkOtelEsbuild } = require('@splunk/otel')
const { splunkOtelEsbuild } = require('../../lib/esbuild-plugin');

build({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist_bundle/bundle.js',
  plugins: [splunkOtelEsbuild()],
  keepNames: true,
}).catch(() => process.exit(1));
