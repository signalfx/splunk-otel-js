/* eslint-disable header/header */
/*
 * Copyright Splunk Inc.
 * Copyright The OpenTelemetry Authors
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
/*
 * Significant portportions of this file have been ported over from EnvDetector to make it more generic
 * https://github.com/open-telemetry/opentelemetry-js/blob/bd3f2658f52e7b272d9b62ed219000b2b7e91f6a/packages/opentelemetry-resources/src/detectors/EnvDetector.ts#L57
 */
import { Attributes } from '@opentelemetry/api';

const MAX_LENGTH = 255;
const COMMA_SEPARATOR = ',';
const LABEL_KEY_VALUE_SPLITTER = '=';
const ERROR_MESSAGE_INVALID_CHARS =
  'should be a ASCII string with a length greater than 0 and not exceed ' +
  MAX_LENGTH +
  ' characters.';

const ERROR_MESSAGE_INVALID_VALUE =
  'should be a ASCII string with a length not exceed ' +
  MAX_LENGTH +
  ' characters.';

export function parseResourceAttributes(rawEnvAttributes?: string): Attributes {
  if (!rawEnvAttributes) return {};

  const attributes: Attributes = {};
  const rawAttributes: string[] = rawEnvAttributes.split(COMMA_SEPARATOR, -1);
  for (const rawAttribute of rawAttributes) {
    const keyValuePair: string[] = rawAttribute.split(
      LABEL_KEY_VALUE_SPLITTER,
      -1
    );
    if (keyValuePair.length !== 2) {
      continue;
    }
    let [key, value] = keyValuePair;
    // Leading and trailing whitespaces are trimmed.
    key = key.trim();
    value = value.trim().split(/^"|"$/).join('');
    if (!isValidAndNotEmpty(key)) {
      throw new Error(`Attribute key ${ERROR_MESSAGE_INVALID_CHARS}`);
    }
    if (!isValid(value)) {
      throw new Error(`Attribute value ${ERROR_MESSAGE_INVALID_VALUE}`);
    }
    attributes[key] = decodeURIComponent(value);
  }
  return attributes;
}

function isValid(name: string): boolean {
  return name.length <= MAX_LENGTH && isBaggageOctetString(name);
}

// https://www.w3.org/TR/baggage/#definition
function isBaggageOctetString(str: string): boolean {
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    if (ch < 0x21 || ch === 0x2c || ch === 0x3b || ch === 0x5c || ch > 0x7e) {
      return false;
    }
  }
  return true;
}

function isValidAndNotEmpty(str: string): boolean {
  return str.length > 0 && isValid(str);
}
