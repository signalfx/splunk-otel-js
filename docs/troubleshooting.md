# Troubleshooting

Diagnostic logs can help you troubleshoot instrumentation issues.

To output instrumentation logs to the console, add `DiagConsoleLogger` and `DiagLogLevel`:

```javascript
   const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");

   diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ALL);
```

Logging level is controlled by the `OTEL_LOG_LEVEL` environment variable. Available values, from least to most detailed, are:

- `ERROR`: Identifies errors.
- `WARN`: Identifies warnings.
- `INFO`: Informational messages. This is the default level.
- `DEBUG`: Debug log messages.
- `VERBOSE`: Detailed trace level logging.

To set the logger back to a noop:

```javascript

   diag.setLogger();
```

> Enable debug logging only when needed. Debug mode requires more resources.