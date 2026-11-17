# MongoDB command comment propagation

The MongoDB instrumentation is vendored from OpenTelemetry. Tracing supports
driver versions `>=3.3.0 <8`; command comment propagation supports `>=4 <8`.

| Option | Description |
| --- | --- |
| `addCommentToCommands` | Opt into context propagation through BSON command comments. Defaults to `false`. |
| `commentPropagator` | Override the global `TextMapPropagator` for command comments only. |
| `supportsDocumentComments` | Override the default `maxWireVersion >= 9` support check. Must return `true` to confirm support; false or a thrown error skips injection. |

Comment propagation supports commands sent using OP_MSG. Legacy OP_QUERY commands
are not modified, including when `supportsDocumentComments` is overridden.

The distribution enables comment propagation on its bundled MongoDB instrumentation
when `tracing.databaseTraceContextPropagationEnabled` is `true`, or when
`SPLUNK_DB_TRACE_CONTEXT_PROPAGATION_ENABLED=true`:

```js
require('@splunk/otel').start({
  tracing: { databaseTraceContextPropagationEnabled: true },
});
```

The bundled instance uses `W3CTraceContextPropagator` to inject `traceparent` and
`tracestate`. It does not inject baggage or change the application's global
propagator. The setting is applied at construction and cannot be toggled at runtime.
Custom MongoDB instrumentation instances in `tracing.instrumentations` retain
their own constructor settings.

When context is injected, an existing `comment` is preserved under `originalComment`,
retaining its BSON value and type. For example, `comment: 'nightly-job'` becomes
`comment: { traceparent: '00-...', originalComment: 'nightly-job' }`.
Database logs and profiling data may show this wrapped structure.
