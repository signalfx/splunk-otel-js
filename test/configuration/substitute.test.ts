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
import { test } from 'node:test';
import { strict as assert } from 'assert';

import { envSubstitute } from '../../src/configuration/substitute';

// Example env from https://opentelemetry.io/docs/specs/otel/configuration/data-model/#environment-variable-substitution
const envValues = {
  STRING_VALUE: 'value',
  BOOL_VALUE: 'true',
  INT_VALUE: '1',
  FLOAT_VALUE: '1.1',
  HEX_VALUE: '0xdeadbeef',
  INVALID_MAP_VALUE: 'value\nkey:value',
  REPLACE_ME: '${DO_NOT_REPLACE_ME}',
  VALUE_WITH_ESCAPE: 'value$$',
};

const environ = (key: string): string | undefined => {
  return envValues[key];
};

test('otel yaml env var substitution', () => {
  assert.deepStrictEqual(envSubstitute('', environ), '');
  assert.deepStrictEqual(
    envSubstitute('bla bla bla 123', environ),
    'bla bla bla 123'
  );
  assert.deepStrictEqual(envSubstitute('${STRING_VALUE}', environ), 'value');
  assert.deepStrictEqual(
    envSubstitute('${env:STRING_VALUE}', environ),
    'value'
  );
  assert.deepStrictEqual(envSubstitute('${UNDEFINED_KEY}', environ), '');
  assert.deepStrictEqual(
    envSubstitute('${UNDEFINED_KEY:-fallback}', environ),
    'fallback'
  );
  assert.deepStrictEqual(
    envSubstitute('$${STRING_VALUE:-fallback}', environ),
    '${STRING_VALUE:-fallback}'
  );
  assert.deepStrictEqual(
    envSubstitute('$${STRING_VALUE:-${STRING_VALUE}}', environ),
    '${STRING_VALUE:-value}'
  );
  assert.deepStrictEqual(
    envSubstitute('${UNDEFINED_KEY:-$${UNDEFINED_KEY}}', environ),
    '$${UNDEFINED_KEY}'
  );
  assert.deepStrictEqual(
    envSubstitute('${UNDEFINED_KEY:-${STRING_VALUE}}', environ),
    '${STRING_VALUE}'
  );
  assert.deepStrictEqual(
    envSubstitute('${VALUE_WITH_ESCAPE}', environ),
    'value$$'
  );
  assert.deepStrictEqual(
    envSubstitute('$${STRING_VALUE}', environ),
    '${STRING_VALUE}'
  );
  assert.deepStrictEqual(envSubstitute('$$${STRING_VALUE}', environ), '$value');
  assert.deepStrictEqual(
    envSubstitute('$$$${STRING_VALUE}', environ),
    '$${STRING_VALUE}'
  );
  assert.deepStrictEqual(
    envSubstitute('foo ${STRING_VALUE} ${FLOAT_VALUE}', environ),
    'foo value 1.1'
  );
  assert.deepStrictEqual(envSubstitute('a $$ b', environ), 'a $ b');
  assert.deepStrictEqual(envSubstitute('a $ b', environ), 'a $ b');
});
