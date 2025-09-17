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
import { describe, it } from 'node:test';
import { perftools } from '../../src/profiling/proto/profile.js';
import {
  StringTable,
  serialize,
  serializeHeapProfile,
} from '../../src/profiling/utils';
import { cpuProfile, heapProfile } from './profiles';

const proto = perftools.profiles;
const toBuffer = (profile: any) => {
  return perftools.profiles.Profile.encode(profile).finish();
};
const toProfileObject = (buffer: Uint8Array) => {
  return perftools.profiles.Profile.decode(buffer);
};
const clone = (serializedProfile: any) => {
  const buffer = toBuffer(serializedProfile);
  return toProfileObject(buffer);
};

describe('profiling:serialization', () => {
  describe('StringTable', () => {
    it('should work as expected', () => {
      const stringTable = new StringTable();

      assert.equal(stringTable.getIndex(''), 0);
      assert.equal(stringTable.getIndex('a'), 1);
      assert.equal(stringTable.getIndex('b'), 2);
      assert.equal(stringTable.getIndex('a'), 1);
      assert.deepEqual([...stringTable._stringMap.keys()], ['', 'a', 'b']);
    });
  });

  describe('serialization', () => {
    it('creates a valid proto object', () => {
      const profile = require('./profile.json');
      const serializedProfile = serialize(profile, {
        samplingPeriodMillis: 1_000,
      });
      assert(serializedProfile instanceof proto.Profile);
      assert.equal(proto.Profile.verify(serializedProfile), null);

      assert.deepEqual(
        serializedProfile.toJSON(),
        clone(serializedProfile).toJSON()
      );
    });

    it('correctly serializes a dummy profile', () => {
      const serializedProfile = serialize(cpuProfile, {
        samplingPeriodMillis: 1_000,
      });

      assert.deepEqual(serializedProfile.toJSON(), {
        sample: [
          {
            locationId: ['1', '2'],
            label: [
              { key: '1', num: '1657707471544' },
              { key: '4', num: '1000' },
              { key: '2', str: '5' },
              { key: '3', str: '6' },
            ],
          },
        ],
        location: [
          { id: '1', line: [{ functionId: '1', line: '44' }] },
          { id: '2', line: [{ functionId: '2', line: '-1' }] },
        ],
        function: [
          { id: '1', name: '7', systemName: '7', filename: '8' },
          { id: '2', name: '9', systemName: '9', filename: '10' },
        ],
        stringTable: [
          '',
          'source.event.time',
          'trace_id',
          'span_id',
          'source.event.period',
          '10192d1c807161471ad2011522853770',
          'adbfe5ed33c9a3ff',
          'doWork',
          '/app/file.ts',
          'noline',
          '/app/foo.ts',
        ],
      });

      assert.deepEqual(
        serializedProfile.toJSON(),
        clone(serializedProfile).toJSON()
      );
    });

    it('correctly serializes a heap profile', () => {
      const ts = String(heapProfile.timestamp);
      const serializedProfile = serializeHeapProfile(heapProfile);

      assert.deepEqual(serializedProfile.toJSON(), {
        sample: [
          {
            locationId: ['1', '2', '3'],
            value: ['128'],
            label: [{ key: '1', num: ts }],
          },
          {
            locationId: ['1', '2', '3'],
            value: ['256'],
            label: [{ key: '1', num: ts }],
          },
          {
            locationId: ['3'],
            value: ['512'],
            label: [{ key: '1', num: ts }],
          },
        ],
        location: [
          { id: '1', line: [{ functionId: '1', line: '42' }] },
          { id: '2', line: [{ functionId: '2', line: '241' }] },
          { id: '3', line: [{ functionId: '3', line: '-1' }] },
        ],
        function: [
          { id: '1', name: '2', systemName: '2', filename: '3' },
          { id: '2', name: '4', systemName: '4', filename: '3' },
          { id: '3', name: '5', systemName: '5', filename: '6' },
        ],
        stringTable: [
          '',
          'source.event.time',
          'work',
          '/app/foo.js',
          'schedule',
          'runTimers',
          'node:internal/timers',
        ],
      });

      assert.deepEqual(
        serializedProfile.toJSON(),
        clone(serializedProfile).toJSON()
      );
    });
  });
});
