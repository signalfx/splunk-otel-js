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

import * as assert from 'assert';
import * as sinon from 'sinon';

import * as otel from '@opentelemetry/api';
import { EnvResourceDetector } from '../src/resource';
import * as utils from './utils';

describe('resource detector', () => {
  beforeEach(() => {
    utils.cleanEnvironment();
  });

  it('ignores missing attributes', () => {
    const resource = new EnvResourceDetector().detect();
    assert.deepStrictEqual(resource.attributes, {});
  });

  it('ignores wrongly formatted env string', () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'kkkkkkkkkkk';
    const resource = new EnvResourceDetector().detect();
    assert.deepStrictEqual(resource.attributes, {});
  });

  it('ignores missing attr keys', () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = '=v';
    const resource = new EnvResourceDetector().detect();
    assert.deepStrictEqual(resource.attributes, {});
  });

  it('ignores unsupported value chars', () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES = 'k2=␟';
    const resource = new EnvResourceDetector().detect();
    assert.deepStrictEqual(resource.attributes, {});
  });

  it('parses properly formatted attributes', () => {
    process.env.OTEL_RESOURCE_ATTRIBUTES =
      'k=v,key1=val1,service.name=node-svc';
    const resource = new EnvResourceDetector().detect();
    assert.deepStrictEqual(resource.attributes, {
      k: 'v',
      key1: 'val1',
      'service.name': 'node-svc',
    });
  });
});
