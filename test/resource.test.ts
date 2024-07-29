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

import { DockerCGroupV1Detector } from '../src/detectors/DockerCGroupV1Detector';
import { detect } from '../src/resource';
import * as utils from './utils';

describe('resource detector', () => {
  beforeEach(() => {
    utils.cleanEnvironment();
  });

  describe('DockerCGroupV1Detector', () => {
    const invalidCases = [
      '13:name=systemd:/podruntime/docker/kubepods/ac679f8a8319c8cf7d38e1adf263bc08d23zzzz',
    ];
    const expectedId = 'ac679f8a8319c8cf7d38e1adf263bc08d23';
    const testCases = [
      [
        '13:name=systemd:/podruntime/docker/kubepods/ac679f8a8319c8cf7d38e1adf263bc08d23.slice',
        'ac679f8a8319c8cf7d38e1adf263bc08d23',
      ],
      [
        '13:name=systemd:/podruntime/docker/kubepods/crio-dc679f8a8319c8cf7d38e1adf263bc08d23.slice',
        'dc679f8a8319c8cf7d38e1adf263bc08d23',
      ],
      [
        '13:name=systemd:/pod/d86d75589bf6cc254f3e2cc29debdf85dde404998aa128997a819ff991827356',
        'd86d75589bf6cc254f3e2cc29debdf85dde404998aa128997a819ff991827356',
      ],
      [
        [
          '1:name=systemd:/podruntime/docker/kubepods/docker-dc579f8a8319c8cf7d38e1adf263bc08d23',
          '2:name=systemd:/podruntime/docker/kubepods/docker-dc579f8a8319c8cf7d38e1adf263bc08d23',
          '3:name=systemd:/podruntime/docker/kubepods/docker-dc579f8a8319c8cf7d38e1adf263bc08d23',
        ].join('\n'),
        'dc579f8a8319c8cf7d38e1adf263bc08d23',
      ],
      [
        [
          '1:blkio:/docker/a4d00c9dd675d67f866c786181419e1b44832d4696780152e61afd44a3e02856',
          '2:cpu:/docker/a4d00c9dd675d67f866c786181419e1b44832d4696780152e61afd44a3e02856',
          '3:cpuacct:/docker/a4d00c9dd675d67f866c786181419e1b44832d4696780152e61afd44a3e02856',
        ].join('\n'),
        'a4d00c9dd675d67f866c786181419e1b44832d4696780152e61afd44a3e02856',
      ],
      [
        [
          '1:blkio:/ecs/eb9d3d0c-8936-42d7-80d8-f82b2f1a629e/7e9139716d9e5d762d22f9f877b87d1be8b1449ac912c025a984750c5dbff157',
          '2:cpu:/ecs/eb9d3d0c-8936-42d7-80d8-f82b2f1a629e/7e9139716d9e5d762d22f9f877b87d1be8b1449ac912c025a984750c5dbff157',
          '3:cpuacct:/ecs/eb9d3d0c-8936-42d7-80d8-f82b2f1a629e/7e9139716d9e5d762d22f9f877b87d1be8b1449ac912c025a984750c5dbff157',
        ].join('\n'),
        '7e9139716d9e5d762d22f9f877b87d1be8b1449ac912c025a984750c5dbff157',
      ],
    ];

    it('parses all the known test cases correctly', () => {
      const detector = new DockerCGroupV1Detector();
      testCases.forEach(([testCase, result]) => {
        assert.equal(detector['_parseFile'](testCase), result);
      });
      invalidCases.forEach(([testCase, result]) => {
        assert.equal(detector['_parseFile'](testCase), null);
      });
    });
  });

  describe('resource.detect', () => {
    it('catches resource attributes from the env', () => {
      process.env.OTEL_RESOURCE_ATTRIBUTES =
        'k=v,service.name=node-svc,x=a%20b';

      const resource = detect();
      assert.strictEqual(resource.attributes['k'], 'v');
      assert.strictEqual(resource.attributes['x'], 'a b');
      assert.strictEqual(resource.attributes['service.name'], 'node-svc');
    });

    it('catches service name from the env', () => {
      const expectedAttributes = {
        'service.name': 'node-svc',
      };
      process.env.OTEL_SERVICE_NAME = 'node-svc';
      const resource = detect();

      assert.strictEqual(resource.attributes['service.name'], 'node-svc');
    });

    it('catches process attributes', () => {
      const resource = detect();
      assert.strictEqual(typeof resource.attributes['process.pid'], 'number');

      for (const attributeName of [
        'process.executable.name',
        'process.runtime.version',
        'process.runtime.name',
      ]) {
        assert.strictEqual(typeof resource.attributes[attributeName], 'string');
      }
    });

    it('detects OS attributes', () => {
      const resource = detect();
      assert.strictEqual(typeof resource.attributes['os.type'], 'string');
      assert.strictEqual(typeof resource.attributes['os.version'], 'string');
    });
  });
});
