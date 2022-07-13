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
import { hrtime } from 'process';
import {
  defaultExporterFactory,
  startProfiling,
  _setDefaultOptions,
} from '../../src/profiling';
import { ProfilingExporter, ProfilingData } from '../../src/profiling/types';
import { serialize } from '../../src/profiling/Profile';
import { detect as detectResource } from '../../src/resource';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import * as utils from '../utils';
import { perftools } from '../../src/profiling/proto/profile.js';

const proto = perftools.profiles;
const dummyProfile = {
  stacktraces: [
    {
      timestamp: '1657707471544258336',
      stacktrace: [
        ['/app/file.ts', 'doWork', 44],
        ['/app/file.ts', '', 50],
      ],
      timepoint: '288828185919000',
    },
  ],
  startTimeNanos: '1657707471456450000',
  startTimepoint: '288828098110664',
};
const toBuffer = (profile) => {
  return perftools.profiles.Profile.encode(profile).finish();
};
const toProfileObject = (buffer) => {
  return perftools.profiles.Profile.decode(buffer);
};
const clone = (serializedProfile) => {
  const buffer = toBuffer(serializedProfile);
  return toProfileObject(buffer);
};

describe.only('profiling:serialization', () => {
  it('creates a valid proto object', () => {
    const profile = require('./profile.json');
    const serializedProfile = serialize(profile);
    assert(serializedProfile instanceof proto.Profile);
    assert.equal(proto.Profile.verify(serializedProfile), null);

    assert.deepEqual(serializedProfile.toJSON(), clone(serializedProfile).toJSON());
  });

  it('correctly serializes a dummy profile', () => {
    const serializedProfile = serialize(dummyProfile);

    assert.deepEqual(serializedProfile.toJSON(), {
      sample: [
        {
          locationId: [ '1', '2' ],
          label: [ { key: '1', num: '1657707471544' } ]
        }
      ],
      location: [
        { id: '1', line: [ { functionId: '1', line: '44' } ] },
        { id: '2', line: [ { functionId: '2', line: '50' } ] }
      ],
      function: [
        { id: '1', name: '4', systemName: '4', filename: '5' },
        { id: '2', name: '6', systemName: '6', filename: '5' }
      ],
      stringTable: [
        '',
        'source.event.time',
        'trace_id',
        'span_id',
        'doWork',
        '/app/file.ts',
        '(anonymous)'
      ]
    });

    assert.deepEqual(serializedProfile.toJSON(), clone(serializedProfile).toJSON());
  });
});
