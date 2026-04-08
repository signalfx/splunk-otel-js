/*
 * Copyright Splunk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Generates TypeScript type definitions from the OpenTelemetry configuration
 * JSON schema. Zero dependencies beyond Node.js built-ins.
 *
 * Input:  schema/opentelemetry_configuration.json
 * Output: src/configuration/schema.ts
 *
 * Usage:  node -r ts-node/register/transpile-only packages/generate-config-types.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..');

const SCHEMA_PATH = join(ROOT, 'schema', 'opentelemetry_configuration.json');
const OUTPUT_PATH = join(ROOT, 'src', 'configuration', 'schema.ts');

type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };

type Schema = {
  $defs?: Record<string, Schema>;
  type?: string | string[];
  enum?: string[];
  properties?: Record<string, Schema>;
  required?: string[];
  description?: string;
  title?: string;
  additionalProperties?: boolean | Schema;
  minProperties?: number;
  maxProperties?: number;
  minItems?: number;
  items?: Schema;
  $ref?: string;
};

type GeneratorStats = {
  output: string;
  defCount: number;
  lineCount: number;
};

export function generateTypes(schema: Schema): GeneratorStats {
  const defs = schema.$defs ?? {};
  const lines: string[] = [];

  function emit(line = '') {
    lines.push(line);
  }

  function emitJSDoc(description: string | undefined, indentLevel = 0) {
    if (!description) return;

    const cleaned = description.replace(/\n+$/, '');
    const docLines = cleaned.split('\n');
    const prefix = '  '.repeat(indentLevel);

    emit(`${prefix}/**`);
    for (const line of docLines) {
      if (line.trim()) {
        emit(`${prefix} * ${line}`);
      } else {
        emit(`${prefix} *`);
      }
    }
    emit(`${prefix} */`);
  }

  function resolveType(propSchema: Schema): string {
    if (propSchema.$ref) {
      const refName = propSchema.$ref.replace('#/$defs/', '');
      return refName;
    }

    const type = propSchema.type;

    if (propSchema.enum) {
      const members = propSchema.enum.map((v) => `'${v}'`).join(' | ');
      return wrapNullable(members, type);
    }

    if (Array.isArray(type)) {
      const nonNull = type.filter((t) => t !== 'null');
      const isNullable = type.includes('null');
      const baseType =
        nonNull.length === 1 ? mapPrimitive(nonNull[0]) : 'unknown';

      if (nonNull[0] === 'object' && !propSchema.properties) {
        if (propSchema.additionalProperties === true) {
          return isNullable
            ? 'Record<string, unknown> | null'
            : 'Record<string, unknown>';
        }

        if (propSchema.additionalProperties) {
          const valueType = resolveType(propSchema.additionalProperties);
          return isNullable
            ? `Record<string, ${valueType}> | null`
            : `Record<string, ${valueType}>`;
        }
        return isNullable ? 'object | null' : 'object';
      }

      return isNullable ? `${baseType} | null` : baseType;
    }

    if (type === 'array') {
      const itemType = propSchema.items ? resolveType(propSchema.items) : 'unknown';
      if (propSchema.minItems && propSchema.minItems > 0) {
        return `[${itemType}, ...${itemType}[]]`;
      }
      return `${itemType}[]`;
    }

    if (type === 'object') {
      if (propSchema.additionalProperties === true && !propSchema.properties) {
        return 'Record<string, unknown>';
      }

      if (propSchema.additionalProperties && !propSchema.properties) {
        const valueType = resolveType(propSchema.additionalProperties);
        return `Record<string, ${valueType}>`;
      }
      return 'object';
    }

    return mapPrimitive(type);
  }

  function mapPrimitive(type: string | undefined): string {
    switch (type) {
      case 'string':
        return 'string';
      case 'integer':
      case 'number':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      case 'object':
        return 'object';
      default:
        return 'unknown';
    }
  }

  function wrapNullable(typeStr: string, schemaType: string | string[] | undefined) {
    if (Array.isArray(schemaType) && schemaType.includes('null')) {
      return `(${typeStr}) | null`;
    }
    return typeStr;
  }

  function quotePropName(name: string) {
    if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
      return name;
    }
    return `'${name}'`;
  }

  function indexSignatureType(
    additionalProperties: boolean | Schema | undefined,
    hasNamedProps: boolean
  ) {
    if (additionalProperties === true) {
      return 'unknown';
    }

    if (additionalProperties && typeof additionalProperties === 'object') {
      const valueType = resolveType(additionalProperties);
      return hasNamedProps ? `${valueType} | undefined` : valueType;
    }

    return undefined;
  }

  function isDiscriminatedUnion(def: Schema) {
    return (
      def.minProperties === 1 &&
      def.maxProperties === 1 &&
      def.properties &&
      Object.keys(def.properties).length > 1
    );
  }

  function isMarkerType(def: Schema) {
    const type = def.type;
    const isNullableObject =
      Array.isArray(type) && type.includes('object') && type.includes('null');
    return (
      isNullableObject &&
      !def.properties &&
      !def.enum &&
      def.additionalProperties === false
    );
  }

  function isNullableObjectWithProps(def: Schema) {
    const type = def.type;
    return (
      Array.isArray(type) &&
      type.includes('object') &&
      type.includes('null') &&
      def.properties
    );
  }

  function emitObjectInterface(name: string, def: Schema) {
    const required = new Set(def.required ?? []);
    const props = def.properties ?? {};
    const hasNamedProps = Object.keys(props).length > 0;
    const idxType = indexSignatureType(def.additionalProperties, hasNamedProps);

    emit(`export interface ${name} {`);

    for (const [propName, propDef] of Object.entries(props)) {
      emitJSDoc(propDef.description, 1);
      const optional = required.has(propName) ? '' : '?';
      const propType = resolveType(propDef);
      emit(`  ${quotePropName(propName)}${optional}: ${propType};`);
    }

    if (idxType) {
      emit(`  [key: string]: ${idxType};`);
    }

    emit('}');
  }

  function emitNullableObjectType(name: string, def: Schema) {
    const required = new Set(def.required ?? []);
    const props = def.properties ?? {};
    const hasNamedProps = Object.keys(props).length > 0;
    const idxType = indexSignatureType(def.additionalProperties, hasNamedProps);

    emit(`export interface ${name} {`);

    for (const [propName, propDef] of Object.entries(props)) {
      emitJSDoc(propDef.description, 1);
      const optional = required.has(propName) ? '' : '?';
      const propType = resolveType(propDef);
      emit(`  ${quotePropName(propName)}${optional}: ${propType};`);
    }

    if (idxType) {
      emit(`  [key: string]: ${idxType};`);
    }

    emit('}');
  }

  function emitDiscriminatedUnion(name: string, def: Schema) {
    const props = def.properties ?? {};
    const idxType = indexSignatureType(def.additionalProperties, true);

    emit(`export interface ${name} {`);

    for (const [propName, propDef] of Object.entries(props)) {
      emitJSDoc(propDef.description, 1);
      const propType = resolveType(propDef);
      emit(`  ${quotePropName(propName)}?: ${propType};`);
    }

    if (idxType) {
      emit(`  [key: string]: ${idxType};`);
    }

    emit('}');
  }

  function emitEnumType(name: string, def: Schema) {
    const members = (def.enum ?? []).map((v) => `'${v}'`).join(' | ');
    const isNullable = Array.isArray(def.type) && def.type.includes('null');

    if (isNullable) {
      emit(`export type ${name} = (${members}) | null;`);
    } else {
      emit(`export type ${name} = ${members};`);
    }
  }

  function emitMarkerType(name: string) {
    emit(`export type ${name} = Record<string, never> | null;`);
  }

  function emitOpenMap(name: string, def: Schema) {
    const valueType =
      def.additionalProperties === true
        ? 'unknown'
        : def.additionalProperties
          ? resolveType(def.additionalProperties)
          : 'unknown';
    emit(`export type ${name} = Record<string, ${valueType}>;`);
  }

  function classifyDef(def: Schema) {
    if (def.enum) return 'enum';
    if (isMarkerType(def)) return 'marker';
    if (isDiscriminatedUnion(def)) return 'discriminated-union';

    if (def.type === 'object' && def.additionalProperties && !def.properties) {
      return 'open-map';
    }

    if (
      Array.isArray(def.type) &&
      def.type.includes('object') &&
      def.additionalProperties &&
      !def.properties
    ) {
      return 'open-map';
    }

    if (isNullableObjectWithProps(def)) return 'nullable-object';

    if (
      def.type === 'object' ||
      (Array.isArray(def.type) && def.type.includes('object'))
    ) {
      return 'object';
    }

    if (Array.isArray(def.type) && def.type.includes('string') && !def.enum) {
      return 'string-alias';
    }

    return 'unknown';
  }

  function topologicalSort(definitions: Record<string, Schema>) {
    const sorted: string[] = [];
    const visited = new Set<string>();
    const visiting = new Set<string>();

    function visit(name: string) {
      if (visited.has(name)) return;
      if (visiting.has(name)) return;
      visiting.add(name);

      const def = definitions[name];
      if (def) {
        const refs = collectRefs(def);
        for (const ref of refs) {
          if (definitions[ref]) visit(ref);
        }
      }

      visiting.delete(name);
      visited.add(name);
      sorted.push(name);
    }

    for (const name of Object.keys(definitions)) {
      visit(name);
    }

    return sorted;
  }

  function collectRefs(obj: JsonValue | Schema | undefined, refs = new Set<string>()) {
    if (!obj || typeof obj !== 'object') return refs;
    if ('$ref' in obj && typeof obj.$ref === 'string') {
      refs.add(obj.$ref.replace('#/$defs/', ''));
    }
    for (const value of Object.values(obj)) {
      collectRefs(value as JsonValue | Schema | undefined, refs);
    }
    return refs;
  }

  emit(
    '/* This file is auto-generated by packages/generate-config-types.ts. Do not edit. */'
  );
  emit('');

  const sortedNames = topologicalSort(defs);

  for (const name of sortedNames) {
    const def = defs[name];
    const kind = classifyDef(def);

    emitJSDoc(def.description);

    switch (kind) {
      case 'enum':
        emitEnumType(name, def);
        break;
      case 'marker':
        emitMarkerType(name);
        break;
      case 'discriminated-union':
        emitDiscriminatedUnion(name, def);
        break;
      case 'nullable-object':
        emitNullableObjectType(name, def);
        break;
      case 'object':
        emitObjectInterface(name, def);
        break;
      case 'open-map':
        emitOpenMap(name, def);
        break;
      case 'string-alias': {
        const isNullable = Array.isArray(def.type) && def.type.includes('null');
        emit(`export type ${name} = string${isNullable ? ' | null' : ''};`);
        break;
      }
      default:
        emit(`// WARNING: Could not classify $def '${name}'`);
        emit(`export type ${name} = unknown;`);
        break;
    }

    emit('');
  }

  emitJSDoc(schema.description ?? schema.title);
  emitObjectInterface('OpenTelemetryConfiguration', schema);
  emit('');

  return {
    output: lines.join('\n'),
    defCount: sortedNames.length,
    lineCount: lines.length,
  };
}

export function writeTypes(schemaPath = SCHEMA_PATH, outputPath = OUTPUT_PATH) {
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as Schema;
  const { output, defCount, lineCount } = generateTypes(schema);
  writeFileSync(outputPath, output);
  return { defCount, lineCount, outputPath };
}

if (require.main === module) {
  const { defCount, lineCount, outputPath } = writeTypes();
  console.log(
    `Generated ${outputPath} (${defCount} types, ${lineCount} lines)`
  );
}
