# Change Log - @splunk/otel-esbuild-plugin-node

## 0.1.0

- Update `esbuild` to `^0.28.1`
- Update `opentelemetry-esbuild-plugin-node` to `^4.4.0`
- Update the `@splunk/otel` peer dependency to `^4.9.0`
- Migrate package linting to `oxlint` and formatting to `oxfmt`
- Expand esbuild example coverage with CommonJS and ESM e2e tests

## 0.0.2

- Add `publishConfig.access: public` to ensure public publishing on npm
- Add early check for `GITHUB_TOKEN` in release script to prevent unauthenticated publishing

## 0.0.1

- Initial release for testing and release pipeline setup
