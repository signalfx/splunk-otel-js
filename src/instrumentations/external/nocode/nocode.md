## What Does It Do?

**NoCodeInstrumentation** enables tracing in Node.js applications without modifying the source code. It uses OpenTelemetry's instrumentation package to automatically trace functions defined in:
- Internal project files
- Files within Node.js modules in `node_modules`

This is configured declaratively — spans are automatically generated based on configuration and can include custom attributes extracted from function arguments.

## Configuration

### Configuration File Location

The instrumentation loads its configuration from a JSON file. By default, it looks for `nocode.config.json` in the current working directory, but you can override this with the `NOCODE_CONFIG_PATH` environment variable:

```bash
export NOCODE_CONFIG_PATH=/path/to/your/config.json
```

### Configuration File Structure

The configuration file contains an array of instrumentation definitions. These get mapped to OpenTelemetry's `InstrumentationModuleDefinition` and `InstrumentationFileDefinition` objects.

```json
[
  {
    "moduleName": "mynodemodule",
    "supportedVersions": [">=4.0.0"],
    "files": [
      {
        "name": "lib/util.js",
        "method": "processData",
        "spanName": "mynodemodule.processData",
        "attributes": [
          {
            "attrIndex": 0,
            "attrPath": "user.id",
            "key": "user.id"
          }
        ]
      },
      {
        "name": "lib/processor.js",
        "method": "validateInput",
        "spanName": "mynodemodule.validation",
        "attributes": [
          {
            "attrIndex": 0,
            "attrPath": "schema.version",
            "key": "schema.version"
          },
          {
            "attrIndex": 0,
            "attrPath": "data.type",
            "key": "input.type"
          },
          {
            "attrIndex": 1,
            "attrPath": "strict",
            "key": "validation.strict"
          }
        ]
      },
      {
        "name": "lib/transformer.js",
        "method": "transform",
        "spanName": "mynodemodule.transform",
        "attributes": [
          {
            "attrIndex": 0,
            "attrPath": "source.format",
            "key": "source.format"
          },
          {
            "attrIndex": 0,
            "attrPath": "target.format",
            "key": "target.format"
          },
          {
            "attrIndex": 1,
            "attrPath": "options.preserveMetadata",
            "key": "preserve.metadata"
          }
        ]
      }
    ]
  },
  {
    "absolutePath": "/absolute/path/to/your/project/src/utils/helper.js",
    "files": [
      {
        "name": "utils/helper.js",
        "method": "calculateTotal",
        "spanName": "helper.calculateTotal",
        "attributes": [
          {
            "attrIndex": 0,
            "attrPath": "items.length",
            "key": "item.count"
          },
          {
            "attrIndex": 1,
            "attrPath": "options.currency",
            "key": "currency"
          }
        ]
      }
    ]
  }
]
```

### Configuration Properties

#### InstrumentationDefinition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `moduleName` | `string` | No* | Name of the npm module to instrument (e.g., "express", "lodash") |
| `absolutePath` | `string` | No* | Absolute path to a specific file to instrument |
| `supportedVersions` | `string[]` | No | Array of supported version ranges (defaults to `["*"]`). Only applies to `moduleName` |
| `files` | `InstrumentationFileDefinition[]` | Yes | Array of files within the module/path to instrument |

*Either `moduleName` or `absolutePath` must be specified.

**Usage Guidelines:**
- Use `moduleName` for instrumenting files within npm packages in `node_modules`
- Use `absolutePath` for instrumenting your project's own internal files
- `supportedVersions` only applies when using `moduleName` (ignored for `absolutePath`)

#### InstrumentationFileDefinition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Relative path to the file within the module |
| `method` | `string` | Yes | Name of the function/method to instrument |
| `spanName` | `string` | No | Custom span name (defaults to `"${name}.${method}"`) |
| `attributes` | `AttributeDefinition[]` | No | Array of attributes to extract from function arguments |

## Span Creation and Function Wrapping

The NoCode instrumentation creates **client spans** that wrap around your target functions, providing complete observability of function execution.

### How Functions Are Wrapped

When a function is instrumented, it gets wrapped with tracing logic that:

1. **Creates a span** before the function executes
2. **Sets the span as active** during function execution
3. **Extracts custom attributes** from function arguments
4. **Ends the span** after the function completes
5. **Handles errors** by recording exceptions and setting error status

### Span Characteristics

Each instrumented function creates:

- **Span Type**: Client span (internal operation)
- **Span Name**: Configurable via `spanName` field, defaults to `"${fileName}.${methodName}"`
- **Duration**: Measures the complete function execution time
- **Context**: Becomes the active span during execution, allowing child spans to be created
- **Attributes**: Custom attributes extracted from function arguments
- **Status**: Set to error if the function throws an exception

### Synchronous vs Asynchronous Handling

The instrumentation automatically handles both sync and async functions:

- **Synchronous Functions**: Span ends immediately when function returns
- **Asynchronous Functions**: Span remains active until the Promise resolves or rejects

For async functions, proper timing and error handling are maintained throughout the Promise lifecycle.

## Attribute Extraction

The NoCode instrumentation can automatically extract attributes from function arguments and add them to spans. This allows you to capture contextual information without modifying your code.

### AttributeDefinition Properties

| Property | Type | Description |
|----------|------|-------------|
| `attrIndex` | `number` | Zero-based index of the function argument to extract from |
| `attrPath` | `string` | Dot-notation path to navigate through object properties |
| `key` | `string` | The attribute name that will appear in the span |

### Path Navigation Examples

#### Simple Object Properties
```javascript
// Function call: processUser({ id: 123, name: "John" })
{
  "attrIndex": 0,
  "attrPath": "name",
  "key": "user.name"
}
// Result: span attribute "user.name" = "John"
```

#### Nested Objects
```javascript
// Function call: processUser({ user: { profile: { theme: "dark" } } })
{
  "attrIndex": 0,
  "attrPath": "user.profile.theme",
  "key": "userTheme"
}
// Result: span attribute "userTheme" = "dark"
```

#### Array Access
```javascript
// Function call: processItems({ items: [{ name: "first" }, { name: "second" }] })
{
  "attrIndex": 0,
  "attrPath": "items.0.name",
  "key": "firstItemName"
}
// Result: span attribute "firstItemName" = "first"
```

#### Multiple Arguments
```javascript
// Function call: processData(userData, { debug: true })
[
  {
    "attrIndex": 0,
    "attrPath": "id",
    "key": "user.id"
  },
  {
    "attrIndex": 1,
    "attrPath": "debug",
    "key": "debug.enabled"
  }
]
```

### Complex Example

Given this function call:
```javascript
processOrder({
  user: {
    id: 123,
    preferences: {
      notifications: {
        push: { enabled: false, time: "9:00" }
      }
    }
  },
  items: [
    { id: "item1", category: "electronics", price: 299.99 },
    { id: "item2", category: "books", price: 19.99 }
  ]
})
```

Configuration:
```json
{
  "attributes": [
    {
      "attrIndex": 0,
      "attrPath": "user.id",
      "key": "user.id"
    },
    {
      "attrIndex": 0,
      "attrPath": "user.preferences.notifications.push.enabled",
      "key": "push.notifications"
    },
    {
      "attrIndex": 0,
      "attrPath": "items.0.category",
      "key": "first.item.category"
    },
    {
      "attrIndex": 0,
      "attrPath": "items.1.price",
      "key": "second.item.price"
    }
  ]
}
```

Resulting span attributes:
- `user.id`: `123`
- `push.notifications`: `false`
- `first.item.category`: `"electronics"`
- `second.item.price`: `19.99`

- **File-level granularity**: Can only instrument functions exported from modules, not internal functions
- **Static configuration**: Configuration is loaded once at startup and cannot be changed at runtime
- **Path sensitivity**: File paths must exactly match the module structure
