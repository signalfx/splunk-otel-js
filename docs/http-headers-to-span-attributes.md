> The official Splunk documentation for this page is [Instrument a Node application automatically](https://docs.splunk.com/Observability/gdi/get-data-in/application/nodejs/instrumentation/instrument-nodejs-application.html). For instructions on how to contribute to the docs, see [CONTRIBUTING.md](../CONTRIBUTING.md#documentation).

# Converting HTTP headers to span attributes

Specify a list of header names (case insensitive) to capture as span attributes. Headers will be converted to span attributes in the form of `http.response.header.header_name` or `http.request.header.header_name`.

```js
const { startTracing } = require('@splunk/otel');
const { getInstrumentations } = require('@splunk/otel/lib/instrumentations');

startTracing({
	instrumentations: [
		...getInstrumentations()
		new HttpInstrumentation({
			headersToSpanAttributes: {
				// Server side capturing, e.g. express
				server: {
					// Outgoing response headers
					responseHeaders: ['content-type'],
					// Incoming request headers
					requestHeaders: ['accept-language']
				},
				// Client side capturing, e.g. node-fetch, got
				client: {
					// Incoming response headers
					responseHeaders: ['server-timing'],
					// Outgoing request headers
					requestHeaders: ['accept-encoding']
				}
			}
		}),
	]
});
```
# Converting HTTP request parameters to span attributes

Specify a list of query parameters (case sensitive) to capture as span attributes on the server side. Query parameters will be converted to span attributes in the form of `http.request.param.key`. To avoid attribute namespacing issues, `.` characters in keys are converted to `_`.

```js
const { startTracing } = require('@splunk/otel');

startTracing({
	captureHttpRequestUriParams: ['sortBy']
});
```
