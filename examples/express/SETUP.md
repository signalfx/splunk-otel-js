
The ingest setup is for OpenTracing only and doesn't mention access tokens



https://docs.signalfx.com/en/latest/apm/apm-getting-started/apm-opentelemetry-collector.html#how-the-opentelemetry-collector-works
references python and java migration guides, no nodejs's.



OTel SDK logs
```
cannot find instrumentation package: HttpInstrumentation
```
using package name here would be lots more useful.




OTel SDK logs
```
@opentelemetry/instrumentation-http %s instrumentation outgoingRequest http
```
seems like string formatting doesn't work




Docs say:
> There is no default output for logs. Even if you set OTEL_LOG_LEVEL=VERBOSE, nothing is output to the console. You need to set an output first, for example to stdout, by adding DiagConsoleLogger:
Desn't make sense to set it twice. Least we could do is to set a diag logger if there isn't one set with the proper log level.




