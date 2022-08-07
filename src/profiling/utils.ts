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
import * as fs from 'fs';
import { gzip } from 'zlib';
import { promisify } from 'util';
import * as grpc from '@grpc/grpc-js';
import { diag } from '@opentelemetry/api';

import { perftools } from './proto/profile';
import type { HeapProfile, RawProfilingData } from './types';

const gzipPromise = promisify(gzip);

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

export interface PProfSerializationOptions {
  samplingPeriodMillis: number;
}

class Serializer {
  stringTable = new StringTable();
  locationsMap = new Map();
  functionsMap = new Map();

  getLocation(
    fileName: string,
    functionName: string,
    lineNumber: number
  ): perftools.profiles.Location {
    const key = `${fileName}:${functionName}:${lineNumber}`;
    let location = this.locationsMap.get(key);
    if (!location) {
      location = new perftools.profiles.Location({
        id: this.locationsMap.size + 1,
        line: [this.getLine(fileName, functionName, lineNumber)],
      });
      this.locationsMap.set(key, location);
    }
    return location;
  }

  getFunction(
    fileName: string,
    functionName: string
  ): perftools.profiles.Function {
    const key = `${fileName}:${functionName}`;
    let fun = this.functionsMap.get(key);
    if (!fun) {
      const functionNameId = this.stringTable.getIndex(functionName);
      fun = new perftools.profiles.Function({
        id: this.functionsMap.size + 1,
        name: functionNameId,
        systemName: functionNameId,
        filename: this.stringTable.getIndex(fileName),
      });
      this.functionsMap.set(key, fun);
    }
    return fun;
  }

  getLine(
    fileName: string,
    functionName: string,
    lineNumber: number
  ): perftools.profiles.Line {
    return new perftools.profiles.Line({
      functionId: this.getFunction(fileName, functionName).id,
      line: lineNumber !== 0 ? lineNumber : -1,
    });
  }

  serializeHeapProfile(profile: HeapProfile) {
    const SOURCE_EVENT_TIME = this.stringTable.getIndex('source.event.time');

    const label = [{ key: SOURCE_EVENT_TIME, num: Date.now() }];

    const sample: perftools.profiles.ISample[] = [];

    const { samples, treeMap } = profile;

    for (const s of samples) {
      let node = treeMap[s.nodeId];
      const path: number[] = [];

      while (node !== undefined) {
        const location = this.getLocation(
          node.scriptName,
          node.name,
          node.lineNumber
        );

        path.push(location.id as number);

        node = treeMap[node.parentId];
      }

      sample.push({
        locationId: path,
        value: [s.size],
        label,
      });
    }

    return perftools.profiles.Profile.create({
      sample,
      location: [...this.locationsMap.values()],
      function: [...this.functionsMap.values()],
      stringTable: this.stringTable.serialize(),
    });
  }

  serializeCpuProfile(
    profile: RawProfilingData,
    options: PProfSerializationOptions
  ) {
    const { stacktraces } = profile;

    const stringTable = new StringTable();
    const locationsMap = new Map();
    const functionsMap = new Map();

    // Precreating those because they are really likely to be used
    const STR = {
      TIMESTAMP: stringTable.getIndex('source.event.time'),
      TRACE_ID: stringTable.getIndex('trace_id'),
      SPAN_ID: stringTable.getIndex('span_id'),
      SOURCE_EVENT_PERIOD: stringTable.getIndex('source.event.period'),
    };

    const eventPeriodLabel = new perftools.profiles.Label({
      key: STR.SOURCE_EVENT_PERIOD,
      num: options.samplingPeriodMillis,
    });

    const samples = stacktraces.map(
      ({ stacktrace, timestamp, spanId, traceId }) => {
        const labels = [
          new perftools.profiles.Label({
            key: STR.TIMESTAMP,
            num: Number(BigInt(timestamp) / BigInt(1_000_000)),
          }),
          eventPeriodLabel,
        ];
        if (traceId) {
          labels.push(
            new perftools.profiles.Label({
              key: STR.TRACE_ID,
              str: stringTable.getIndex(traceId.toString('hex')),
            })
          );
        }
        if (spanId) {
          labels.push(
            new perftools.profiles.Label({
              key: STR.SPAN_ID,
              str: stringTable.getIndex(spanId.toString('hex')),
            })
          );
        }

        return new perftools.profiles.Sample({
          locationId: stacktrace.map(([fileName, functionName, lineNumber]) => {
            return this.getLocation(fileName, functionName, lineNumber).id;
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
  }
}

export const serialize = (
  profile: RawProfilingData,
  options: PProfSerializationOptions
) => {
  return new Serializer().serializeCpuProfile(profile, options);
};

export function serializeHeapProfile(profile: HeapProfile) {
  return new Serializer().serializeHeapProfile(profile);
}

export const encode = async function encode(
  profile: perftools.profiles.IProfile
): Promise<Buffer> {
  const buffer = perftools.profiles.Profile.encode(profile).finish();
  return gzipPromise(buffer);
};

function readContentSync(location: string): Buffer | undefined {
  try {
    return fs.readFileSync(location);
  } catch (e) {
    diag.error(`Failed to read file at ${location}`, e);
  }

  return undefined;
}

function maybeReadPath(location: string | undefined): Buffer | undefined {
  if (location === undefined) {
    return undefined;
  }

  return readContentSync(location);
}

export function parseEndpoint(endpoint: string): {
  host: string;
  credentials: grpc.ChannelCredentials;
} {
  let host = endpoint;
  let credentials = grpc.ChannelCredentials.createInsecure();

  if (endpoint.startsWith('https://')) {
    host = endpoint.substr(8);
    credentials = grpc.credentials.createSsl(
      maybeReadPath(process.env.OTEL_EXPORTER_OTLP_CERTIFICATE),
      maybeReadPath(process.env.OTEL_EXPORTER_OTLP_CLIENT_KEY),
      maybeReadPath(process.env.OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE)
    );
  } else if (endpoint.startsWith('http://')) {
    host = endpoint.substr(7);
  }

  return {
    host,
    credentials,
  };
}
