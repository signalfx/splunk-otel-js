import { describe, before, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

type GeneratorResult = {
  output: string;
  defCount: number;
  lineCount: number;
};

type GeneratorModule = {
  generateTypes: (schema: Record<string, unknown>) => GeneratorResult;
};

const SCRIPT_PATH = path.resolve(
  __dirname,
  '../../packages/generate-config-types.ts'
);
const REAL_SCHEMA_PATH = path.resolve(
  __dirname,
  '../../schema/opentelemetry_configuration.json'
);
const TSC_PATH = path.resolve(
  __dirname,
  '../../node_modules/typescript/bin/tsc'
);
let generateTypes: GeneratorModule['generateTypes'];

function createTempDir() {
  return mkdtempSync(path.join(tmpdir(), 'config-types-test-'));
}

function assertInOrder(haystack: string, needles: string[]) {
  let previousIndex = -1;

  for (const needle of needles) {
    const index = haystack.indexOf(needle);
    assert.notEqual(index, -1, `Expected output to contain: ${needle}`);
    assert.ok(
      index > previousIndex,
      `Expected "${needle}" to appear after the previous definition`
    );
    previousIndex = index;
  }
}

describe('generate-config-types', () => {
  before(() => {
    const mod = require(SCRIPT_PATH) as GeneratorModule;
    generateTypes = mod.generateTypes;
  });

  it('generates focused patterns from a small schema fixture', () => {
    const schema = {
      title: 'FixtureConfiguration',
      type: 'object',
      additionalProperties: true,
      properties: {
        container: {
          $ref: '#/$defs/Container',
        },
        distribution: {
          $ref: '#/$defs/Distribution',
        },
      },
      $defs: {
        Status: {
          type: ['string', 'null'],
          enum: ['on', 'off'],
        },
        Marker: {
          type: ['object', 'null'],
          additionalProperties: false,
        },
        Entry: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: {
              type: 'string',
            },
          },
          required: ['name'],
        },
        Distribution: {
          type: 'object',
          additionalProperties: {
            $ref: '#/$defs/Entry',
          },
        },
        Container: {
          type: ['object', 'null'],
          additionalProperties: false,
          properties: {
            status: {
              $ref: '#/$defs/Status',
            },
            marker: {
              $ref: '#/$defs/Marker',
            },
            names: {
              type: 'array',
              minItems: 1,
              items: {
                type: 'string',
              },
            },
          },
        },
      },
    };

    const { output } = generateTypes(schema);

    assert.match(output, /export type Status = \('on' \| 'off'\) \| null;/);
    assert.match(output, /export type Marker = Record<string, never> \| null;/);
    assert.match(output, /export interface Entry \{\n  name: string;\n\}/);
    assert.match(output, /export type Distribution = Record<string, Entry>;/m);
    assert.match(output, /status\?: Status;/);
    assert.match(output, /marker\?: Marker;/);
    assert.match(output, /names\?: \[string, \.\.\.string\[\]\];/);
    assert.match(output, /export interface OpenTelemetryConfiguration \{/);
    assert.match(output, /\[key: string\]: unknown;/);
  });

  it('emits pick-one schemas as flat interfaces for ergonomic access', () => {
    const schema = {
      title: 'SamplerFixture',
      type: 'object',
      properties: {
        sampler: {
          $ref: '#/$defs/Sampler',
        },
      },
      $defs: {
        AlwaysOnSampler: {
          type: ['object', 'null'],
          additionalProperties: false,
        },
        AlwaysOffSampler: {
          type: ['object', 'null'],
          additionalProperties: false,
        },
        Sampler: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          maxProperties: 1,
          properties: {
            always_on: {
              $ref: '#/$defs/AlwaysOnSampler',
            },
            always_off: {
              $ref: '#/$defs/AlwaysOffSampler',
            },
          },
        },
      },
    };

    const { output } = generateTypes(schema);

    assert.match(output, /export interface Sampler \{/);
    assert.match(output, /always_on\?: AlwaysOnSampler;/);
    assert.match(output, /always_off\?: AlwaysOffSampler;/);
    assert.doesNotMatch(output, /export type Sampler =/);
  });

  it('sorts referenced definitions before their dependents', () => {
    const schema = {
      title: 'OrderingFixture',
      type: 'object',
      properties: {
        root: {
          $ref: '#/$defs/A',
        },
      },
      $defs: {
        A: {
          type: 'object',
          additionalProperties: false,
          properties: {
            b: {
              $ref: '#/$defs/B',
            },
          },
        },
        B: {
          type: 'object',
          additionalProperties: false,
          properties: {
            c: {
              $ref: '#/$defs/C',
            },
          },
        },
        C: {
          type: ['string', 'null'],
        },
      },
    };

    const { output } = generateTypes(schema);

    assertInOrder(output, [
      'export type C = string | null;',
      'export interface B {',
      'export interface A {',
      'export interface OpenTelemetryConfiguration {',
    ]);
  });

  it('keeps real-schema output deterministic and free of duplicate numbered types', () => {
    const schema = JSON.parse(readFileSync(REAL_SCHEMA_PATH, 'utf-8'));

    const first = generateTypes(schema);
    const second = generateTypes(schema);

    assert.equal(first.output, second.output);
    assert.ok(first.defCount > 0);
    assert.ok(first.lineCount > 0);
    assert.match(first.output, /export interface Sampler \{/);
    assert.doesNotMatch(first.output, /\bSampler[1-9]\d*\b/);
    assert.doesNotMatch(
      first.output,
      /\bExperimentalLanguageSpecificInstrumentation[1-9]\d*\b/
    );
    assert.doesNotMatch(first.output, /export type [A-Za-z0-9_]+ = unknown;/);
    assert.match(
      first.output,
      /export interface OpenTelemetryConfiguration \{/
    );
    assert.match(first.output, /\[key: string\]: unknown;/);
  });

  it('produces generated types that compile in a small consumer example', () => {
    const schema = {
      title: 'CompileFixture',
      type: 'object',
      additionalProperties: true,
      properties: {
        sampler: {
          $ref: '#/$defs/Sampler',
        },
      },
      $defs: {
        AlwaysOnSampler: {
          type: ['object', 'null'],
          additionalProperties: false,
        },
        TraceIdRatioBasedSampler: {
          type: ['object', 'null'],
          additionalProperties: false,
          properties: {
            ratio: {
              type: ['number', 'null'],
            },
          },
        },
        Sampler: {
          type: 'object',
          additionalProperties: false,
          minProperties: 1,
          maxProperties: 1,
          properties: {
            always_on: {
              $ref: '#/$defs/AlwaysOnSampler',
            },
            trace_id_ratio_based: {
              $ref: '#/$defs/TraceIdRatioBasedSampler',
            },
          },
        },
      },
    };

    const tempDir = createTempDir();

    try {
      const { output } = generateTypes(schema);
      const schemaPath = path.join(tempDir, 'schema.ts');
      const consumerPath = path.join(tempDir, 'consumer.ts');

      writeFileSync(schemaPath, output);
      writeFileSync(
        consumerPath,
        [
          "import type { OpenTelemetryConfiguration, Sampler } from './schema';",
          '',
          'declare const config: OpenTelemetryConfiguration;',
          'declare const sampler: Sampler;',
          '',
          "const vendorSection = config['custom.vendor'];",
          '',
          'if (sampler.always_on !== undefined) {',
          '  void vendorSection;',
          '}',
          '',
          'if (sampler.trace_id_ratio_based !== undefined) {',
          '  const ratio = sampler.trace_id_ratio_based.ratio ?? 1;',
          '  void ratio;',
          '}',
          '',
        ].join('\n')
      );

      execFileSync(
        process.execPath,
        [
          TSC_PATH,
          '--noEmit',
          '--strict',
          '--target',
          'es2022',
          '--module',
          'commonjs',
          consumerPath,
        ],
        {
          cwd: tempDir,
          stdio: 'pipe',
        }
      );
    } finally {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
