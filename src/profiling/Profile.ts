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
import { perftools } from './proto/profile';
import type { RawProfilingData } from './types';

export class StringTable {
  _stringMap = new Map();

  constructor() {
    this.getIndex('');
  }

  getIndex(str: string) {
    let idx = this._stringMap.get(str);
    if (idx !== undefined) {
      return idx;
    }
    idx = this._stringMap.size;
    this._stringMap.set(str, idx);
    return idx;
  }

  serialize() {
    return [...this._stringMap.keys()];
  }
}

export const serialize = (profile: RawProfilingData) => {
  const { stacktraces } = profile;

  const stringTable = new StringTable();
  const locationsMap = new Map();
  const functionsMap = new Map();

  // Precreating those because they are really likely to be used
  const STR = {
    TIMESTAMP: stringTable.getIndex('source.event.time'),
    TRACE_ID: stringTable.getIndex('trace_id'),
    SPAN_ID: stringTable.getIndex('span_id'),
  };

  const getLocation = (
    fileName: string,
    functionName: string,
    lineNumber: number
  ): perftools.profiles.Location => {
    const key = [fileName, functionName, lineNumber].join(':');
    let location = locationsMap.get(key);
    if (!location) {
      location = new perftools.profiles.Location({
        id: locationsMap.size + 1,
        line: [getLine(fileName, functionName, lineNumber)],
      });
      locationsMap.set(key, location);
    }
    return location;
  };

  const getFunction = (
    fileName?: string,
    functionName?: string
  ): perftools.profiles.Function => {
    const key = [fileName, functionName].join(':');
    let fun = functionsMap.get(key);
    if (!fun) {
      const functionNameId = stringTable.getIndex(
        functionName || '(anonymous)'
      );
      fun = new perftools.profiles.Function({
        id: functionsMap.size + 1,
        name: functionNameId,
        systemName: functionNameId,
        filename: stringTable.getIndex(fileName || ''),
      });
      functionsMap.set(key, fun);
    }
    return fun;
  };

  const getLine = (
    fileName?: string,
    functionName?: string,
    lineNumber?: number
  ): perftools.profiles.Line => {
    return new perftools.profiles.Line({
      functionId: getFunction(fileName, functionName).id,
      line: lineNumber,
    });
  };

  const samples = stacktraces.map(
    ({ stacktrace, timestamp, spanId, traceId }) => {
      const labels = [
        new perftools.profiles.Label({
          key: STR.TIMESTAMP,
          num: Number(BigInt(timestamp) / BigInt(1_000_000)),
        }),
      ];
      if (traceId) {
        labels.push(
          new perftools.profiles.Label({
            key: STR.TRACE_ID,
            str: stringTable.getIndex(traceId.toString()),
          })
        );
      }
      if (spanId) {
        labels.push(
          new perftools.profiles.Label({
            key: STR.SPAN_ID,
            str: stringTable.getIndex(spanId.toString()),
          })
        );
      }

      return new perftools.profiles.Sample({
        locationId: stacktrace.map(([fileName, functionName, lineNumber]) => {
          return getLocation(fileName, functionName, lineNumber).id;
        }),
        value: [],
        label: labels,
      });
    }
  );

  return perftools.profiles.Profile.create({
    sample: samples,
    location: [...locationsMap.values()],
    function: [...functionsMap.values()],
    stringTable: stringTable.serialize(),
  });
};
