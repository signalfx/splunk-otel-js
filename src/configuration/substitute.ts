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

enum State {
  Normal,
  DollarSign,
  SubstituteBegin,
  DefaultValue,
}

export function envSubstitute(
  value: string,
  environ: (key: string) => string | undefined
): string {
  let state: State = State.Normal;

  let output = '';
  let envVarBegin = -1;
  let envVarEnd = -1;

  for (let i = 0; i < value.length; i++) {
    const c = value.charAt(i);
    switch (state) {
      case State.Normal: {
        if (c === '$') {
          state = State.DollarSign;
        } else {
          output += c;
        }

        break;
      }
      case State.DollarSign: {
        // $$
        if (c === '$') {
          output += '$';
          state = State.Normal;
        } else if (c === '{') {
          state = State.SubstituteBegin;
          envVarBegin = i + 1;
        } else {
          output += '$';
          output += c;
          state = State.Normal;
        }

        break;
      }
      case State.SubstituteBegin: {
        if (c === '}') {
          const replaced = environ(value.substring(envVarBegin, i));

          if (replaced !== undefined) {
            output += replaced;
          }

          state = State.Normal;
        } else if (c === ':') {
          if (value.substring(envVarBegin, i) === 'env') {
            envVarBegin = i + 1;
          } else {
            const next = value.charAt(i + 1);
            if (next === '-') {
              envVarEnd = i;
              i += 2;
              state = State.DefaultValue;
            }
          }
        }

        break;
      }
      case State.DefaultValue: {
        if (c === '}') {
          const replaced = environ(value.substring(envVarBegin, envVarEnd));

          if (replaced === undefined) {
            output += value.substring(envVarEnd + 2, i);
          } else {
            output += replaced;
          }

          state = State.Normal;
        }

        break;
      }
    }
  }

  return output;
}

export function convertSubstitution(s: string): string | number | boolean {
  if (s === 'true') return true;
  if (s === 'false') return false;

  if (s.startsWith('0x')) {
    return parseInt(s, 16);
  }

  const firstChar = s.charAt(0);
  if (firstChar >= '0' && firstChar <= '9') {
    return parseFloat(s);
  }

  return s;
}
