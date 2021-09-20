# Troubleshooting

Debug logs can help you troubleshoot instrumentation issues.

Logging level is controlled by the `OTEL_LOG_LEVEL` environment variable. Available values, from least to most detailed, are:

- `ERROR`: Identifies errors.
- `WARN`: Identifies warnings.
- `INFO`: Informational messages. This is the default level.
- `DEBUG`: Debug log messages.
- `VERBOSE`: Detailed trace level logging.

To output instrumentation logs to the console, you have to set an output first, for example to `stdout`, by adding `DiagConsoleLogger`:

```javascript
   const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");

   diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
```

You can then add `diag` calls in your code:

```javascript

   export function MyFunction() {
   diag.debug("...");
   diag.info("...");
   diag.warn("...");
   diag.error("...");
   diag.verbose("..");
   }
```

To set the logger back to a noop:

```javascript

   diag.setLogger();
```

> Enable debug logging only when needed. Debug mode requires more resources.