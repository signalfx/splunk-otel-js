/*
 * Copyright 2021 Splunk Inc.
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
 * Copyright The OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { diag } from '@opentelemetry/api';
import { getEnv } from '@opentelemetry/core';
import { Resource, ResourceAttributes } from '@opentelemetry/resources';

/* This is based on https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-resources/src/platform/node/detectors/EnvDetector.ts
 We're copying this code and changing the implementation to a synchronous one from async. This is required for our distribution to not incur ~1 second of overhead
 when setting up the tracing pipeline. This is a temporary solution until we can agree upon and implement a solution upstream.
*/
export class EnvResourceDetector {
  private readonly _MAX_LENGTH = 255;

  private readonly _COMMA_SEPARATOR = ',';

  private readonly _LABEL_KEY_VALUE_SPLITTER = '=';

  private readonly _ERROR_MESSAGE_INVALID_CHARS =
    'should be a ASCII string with a length greater than 0 and not exceed ' +
    this._MAX_LENGTH +
    ' characters.';

  private readonly _ERROR_MESSAGE_INVALID_VALUE =
    'should be a ASCII string with a length not exceed ' +
    this._MAX_LENGTH +
    ' characters.';

  public detect(): Resource {
    try {
      const rawAttributes = getEnv().OTEL_RESOURCE_ATTRIBUTES;
      if (!rawAttributes) {
        diag.debug(
          'EnvDetector failed: Environment variable "OTEL_RESOURCE_ATTRIBUTES" is missing.'
        );
        return Resource.empty();
      }
      const attributes = this._parseResourceAttributes(rawAttributes);
      return new Resource(attributes);
    } catch (e) {
      diag.debug(`EnvDetector failed: ${e.message}`);
      return Resource.empty();
    }
  }

  private _parseResourceAttributes(
    rawEnvAttributes?: string
  ): ResourceAttributes {
    const attributes: ResourceAttributes = {};
    const rawAttributes: string[] = (rawEnvAttributes || '').split(
      this._COMMA_SEPARATOR,
      -1
    );
    for (const rawAttribute of rawAttributes) {
      const keyValuePair: string[] = rawAttribute.split(
        this._LABEL_KEY_VALUE_SPLITTER,
        -1
      );
      if (keyValuePair.length !== 2) {
        continue;
      }
      let [key, value] = keyValuePair;
      // Leading and trailing whitespaces are trimmed.
      key = key.trim();
      value = value.trim().split('^"|"$').join('');
      if (!this._isValidAndNotEmpty(key)) {
        throw new Error(`Attribute key ${this._ERROR_MESSAGE_INVALID_CHARS}`);
      }
      if (!this._isValid(value)) {
        throw new Error(`Attribute value ${this._ERROR_MESSAGE_INVALID_VALUE}`);
      }
      attributes[key] = value;
    }
    return attributes;
  }

  private _isValid(name: string): boolean {
    return name.length <= this._MAX_LENGTH && this._isPrintableString(name);
  }

  private _isPrintableString(str: string): boolean {
    for (let i = 0; i < str.length; i++) {
      const ch: string = str.charAt(i);
      if (ch <= ' ' || ch >= '~') {
        return false;
      }
    }
    return true;
  }

  private _isValidAndNotEmpty(str: string): boolean {
    return str.length > 0 && this._isValid(str);
  }
}
