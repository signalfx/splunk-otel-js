# "nocode" instrumentation

Stability: under active development; breaking changes can occur

Please don't use this if you have the ability to edit the code being instrumented.

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
        "methodName": "processData",
        "spanName": "mynodemodule.processData",
        "attributes": [
          {
            "attrIndex": 0,
            "attrPath": "user.id",
            "key": "user.id"
          }
        ]
      }
    ]
  },
  {
    "absolutePath": "/absolute/path/to/your/project/src/utils/helper.js",
    "files": [
      {
        "name": "utils/helper",
        "methodName": "calculateTotal",
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
  },
  {
    "moduleName": "lodash",
    "supportedVersions": [">=4.0.0"],
    "mainModuleMethods": [
      {
        "methodName": "chunk",
        "spanName": "lodash.chunk",
        "attributes": [
          {
            "attrIndex": 1,
            "key": "chunkSize"
          }
        ]
      }
    ]
  },
  {
    "moduleName": "express",
    "files": [
      {
        "name": "lib/router/index.js",
        "methodName": "use",
        "spanName": "express.router.use"
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
| `mainModuleMethods` | `MethodInstrumentation[]` | No | Array of methods to instrument on the main module export (only applies to `moduleName`) |
| `files` | `InstrumentationFileDefinition[]` | No | Array of files within the module/path to instrument |

*Either `moduleName` or `absolutePath` must be specified.

**Usage Guidelines:**
- Use `moduleName` for instrumenting files within npm packages in `node_modules`
- Use `absolutePath` for instrumenting your project's own internal files
- Use `mainModuleMethods` to instrument methods directly exported by a module's main file
- Use `files` to instrument methods in specific files within a module
- `supportedVersions` only applies when using `moduleName` (ignored for `absolutePath`)
- When using absolutePath, the name property in files should not include file extensions
- When using moduleName, include file extensions in the name property as needed

#### InstrumentationFileDefinition

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | `string` | Yes | Relative path to the file within the module |
| `methodName` | `string` | Yes | Name of the function/method to instrument |
| `spanName` | `string` | No | Custom span name (defaults to `"${methodName}"`) |
| `attributes` | `AttributeDefinition[]` | No | Array of attributes to extract from function arguments |

#### MethodInstrumentation

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `methodName` | `string` | Yes | Name of the function/method to instrument |
| `spanName` | `string` | No | Custom span name (defaults to `"${methodName}"`) |
| `attributes` | `AttributeDefinition[]` | No | Array of attributes to extract from function arguments |

## Limitations

- **File-level granularity**: Can only instrument functions exported from modules, not internal functions
- **Static configuration**: Configuration is loaded once at startup and cannot be changed at runtime
