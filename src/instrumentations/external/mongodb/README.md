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

`addCommentToCommands`, `commentPropagator`, and `supportsDocumentComments` are
read when the instrumentation is constructed. Later `setConfig()` calls preserve
their initial values. Restart the application to change these settings.
When propagation is disabled, the instrumentation leaves message constructors
untouched and adds no propagation context scope around commands.

The following example enables the [proposed MongoDB context propagation convention](https://github.com/open-telemetry/semantic-conventions/pull/4056)
for a deployment known to run MongoDB. MongoDB 4.4 and later support document-valued
comments, corresponding to wire version 9 or later. This is checked by default:

```js
const {
  MongoDBInstrumentation,
} = require('@splunk/otel/lib/instrumentations/external/mongodb');

new MongoDBInstrumentation({
  addCommentToCommands: true,
});
```

Use the configured instance in the application's custom `tracing.instrumentations`
list in place of the default MongoDB instance. The distribution does not enable
comment propagation on its default instance.

`MongoDBServerInfo` includes the selected server's `address`, `maxWireVersion`,
`maxBsonObjectSize`, and `maxMessageSizeBytes`. The default check skips injection
when the wire version is missing, invalid, or older than 9. It assumes a MongoDB
server and does not identify the server's implementation.

For MongoDB-compatible services using OP_MSG, provide a
`supportsDocumentComments` callback that confirms their document-comment support.
Their advertised wire version alone may not establish support. The callback
replaces the default check, allowing compatible services with different version
mappings. Return `false` when support is unknown or unavailable. The
instrumentation does not send additional commands to discover support.

The command's `comment` becomes a BSON document containing the selected propagator's
string fields. Existing application comments are preserved under `originalComment`,
including their BSON type and explicit `null`. That field is reserved and cannot be
set by a propagator. When the application supplied no comment, `originalComment` is
omitted. Cursor `getMore` commands propagate their own client span's context.

The default is the global propagator, including baggage if configured globally.
To propagate only W3C Trace Context, set `commentPropagator` to a
`W3CTraceContextPropagator` from `@opentelemetry/core`. This override does not change
the application's global propagator.

Every injected field, including baggage, may appear in database logs, profiling
data, or diagnostic interfaces. Wrapping an existing comment changes its structure
in those outputs. Propagation does not by itself enable server tracing: the server
must support extraction of the selected propagation format.

Injection is skipped when server support is unknown, the propagator injects no
fields, or the prepared command would exceed the selected server's BSON or wire
message size limits. The original command and comment are retained when injection
is skipped. Propagation errors do not fail database operations. Injection follows
the instrumentation's `requireParentSpan` setting and tracing suppression.

## Tests

Run the serialization and configuration tests from the repository root:

```sh
npm test -- comment-propagation comment-configuration
```

To run the integration tests against MongoDB 4.4 or later:

```sh
RUN_MONGODB_TESTS=1 npm test -- mongodb-comment
```

Set `MONGODB_HOST` and `MONGODB_PORT` if the server is not at `127.0.0.1:27017`.

The MongoDB CI job tests driver majors 4 through 7, including 6.3 and 6.4 around
the callback/promise transition.
