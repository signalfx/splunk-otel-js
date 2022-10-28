# Convert HTTP headers to span attributes

To capture HTTP header names as span attributes, you must specify a list of header names. Headers are case insensitive and are be converted to span attributes in the form of `http.response.header.header_name` or `http.request.header.header_name`, depending on the type of request.

```js
const { start } = require('@splunk/otel');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');

start({
  tracing: {
    instrumentations: [
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
    ],
  },
});
```
# Convert HTTP request parameters to span attributes

To capture query parameters as span attributes, you must specify a list of query parameters. Query parameters are case sensitive and are converted to span attributes in the form of `http.request.param.key`. To avoid name spacing issues in the resulting span attributes, `.` characters in the resulting span are converted to `_`.

```js
const { start } = require('@splunk/otel');

start({
  tracing: {
    captureHttpRequestUriParams: ['sortBy'],
  },
});
```
