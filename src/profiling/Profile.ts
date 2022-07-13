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
import { strict as assert } from 'assert';
import { perftools } from './proto/profile';
import { inspect } from 'util';
import type { RawProfilingData } from './types';

inspect.defaultOptions.depth = 20;

class StringTable {
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

const stringTable = new StringTable();

assert.equal(stringTable.getIndex(''), 0);
assert.equal(stringTable.getIndex('a'), 1);
assert.equal(stringTable.getIndex('b'), 2);
assert.equal(stringTable.getIndex('a'), 1);
assert.deepEqual([...stringTable._stringMap.keys()], ['', 'a', 'b']);

// // Set with each element having an non-zero ID
// class UniqueElementSet {
//   _map = new Map();

//   getOrAdd(key, el) {
//     let el = this._map.get(key);
//     if (el !== undefined) {
//         return el;
//     }
//     idx = this._map.size + 1;
//     this._map.set(el, idx);
//     return idx;
//   }
// }

// const els = new UniqueElementSet();

// const a = {};
// const b = {};

// assert.equal(els.getId(a), 1);
// assert.equal(els.getId(b), 2);
// assert.equal(els.getId(a), 1);
// assert.deepEqual([...els._map.keys()], [a, b]);

export const serialize = (profile: RawProfilingData) => {
  const { stacktraces, ...rest } = profile;
  console.log(stacktraces.length, rest);

  const stringTable = new StringTable();
  const locationsMap = new Map();
  const functionsMap = new Map();

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

  const samples = stacktraces.map(({ stacktrace }) => {
    return new perftools.profiles.Sample({
      locationId: stacktrace.map(([fileName, functionName, lineNumber]) => {
        return getLocation(fileName, functionName, lineNumber).id;
      }),
      value: [],
      label: [],
    });
  });

  return perftools.profiles.Profile.create({
    sample: samples,
    location: [...locationsMap.values()],
    function: [...functionsMap.values()],
    stringTable: stringTable.serialize(),
  });
};
