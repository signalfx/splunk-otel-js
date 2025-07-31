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

import * as path from 'path';
import * as fs from 'fs';
import { strict as assert } from 'assert';
import { after, before, beforeEach, describe, it } from 'node:test';
import { NoCodeInstrumentation } from '../../../../src/instrumentations/external/nocode';
import { getTestSpans, setInstrumentation, provider, exporter } from '../setup';

const configPath = './test/instrumentation/external/nocode/nocode.config.json';
const absolutePathToUtils = path.resolve(__dirname, 'sample-utils.ts');
process.env.NOCODE_CONFIG_PATH = configPath;

const config = [
  {
    absolutePath: absolutePathToUtils,
    files: [
      {
        name: 'sample-utils',
        method: 'muchWork',
        spanName: 'util.js.muchWork',
        attributes: [
          {
            attrIndex: 0,
            key: 'stringAttribute',
          },
        ],
      },
      {
        name: 'sample-utils',
        method: 'muchWorkWithPromise',
        spanName: 'util.js.muchWorkWithPromise',
      },
      {
        name: 'sample-utils',
        method: 'funWithNestedArgs',
        attributes: [
          {
            attrIndex: 0,
            attrPath: 'user.preferences.theme',
            key: 'userTheme',
          },
          {
            attrIndex: 0,
            attrPath: 'user.preferences.notifications.push.enabled',
            key: 'pushEnabled',
          },
          {
            attrIndex: 0,
            attrPath: 'items.0.details.category',
            key: 'firstItemCategory',
          },
        ],
      },
      {
        name: 'sample-utils',
        method: 'funWithNestedArrays',
        attributes: [
          {
            attrIndex: 0,
            attrPath: 'orders.0.items.0.name',
            key: 'firstOrderFirstItem',
          },
          {
            attrIndex: 0,
            attrPath: 'orders.1.items.0.tags.0',
            key: 'secondOrderFirstTag',
          },
          {
            attrIndex: 0,
            attrPath: 'orders.0.items.1.price',
            key: 'firstOrderSecondPrice',
          },
        ],
      },
    ],
  },
];
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

const instrumentation = new NoCodeInstrumentation();
provider.register();
import {
  muchWork,
  muchWorkWithPromise,
  funWithNestedArgs,
  funWithNestedArrays,
} from './sample-utils';
import { NoCodeInstrumentationConfig } from '../../../../src/instrumentations/external/nocode/nocode';

describe('nocode', () => {
  before(() => {
    setInstrumentation(instrumentation);
  });

  beforeEach(() => {
    exporter.reset();
  });

  after(() => {
    fs.unlinkSync(configPath);
  });

  describe('nocode', () => {
    it('can load config via file', () => {
      const config = instrumentation.getConfig() as NoCodeInstrumentationConfig;
      assert.ok(config.definitions, 'config.definitions should be defined');
      assert.strictEqual(config.definitions.length, 1);
      assert.strictEqual(
        config.definitions[0].absolutePath,
        absolutePathToUtils
      );
      assert.deepStrictEqual(config.definitions[0].files[0], {
        name: 'sample-utils',
        method: 'muchWork',
        spanName: 'util.js.muchWork',
        attributes: [
          {
            attrIndex: 0,
            key: 'stringAttribute',
          },
        ],
      });
    });
    it('basic util function is instrumented', async () => {
      muchWork('Test String Attribute');
      const spans = getTestSpans();
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(spans[0].name, 'util.js.muchWork');
      assert.strictEqual(
        spans[0].attributes['stringAttribute'],
        'Test String Attribute'
      );
    });
    it('extracts attributes from nested arguments', () => {
      const args = {
        user: {
          id: 1,
          name: 'John Doe',
          preferences: {
            theme: 'dark',
            notifications: {
              email: true,
              sms: false,
              push: { enabled: true, time: '10:00 AM' },
            },
          },
        },
        items: [
          {
            id: 'item1',
            details: {
              category: 'electronics',
              tags: ['gadget', 'tech'],
              metadata: { created: new Date(), updated: new Date() },
            },
          },
        ],
      };

      const result = funWithNestedArgs(args);
      const spans = getTestSpans();

      assert.strictEqual(spans.length, 1);
      const attributes = spans[0].attributes;
      assert.strictEqual(attributes['userTheme'], 'dark');
      assert.strictEqual(attributes['pushEnabled'], true);
      assert.strictEqual(attributes['firstItemCategory'], 'electronics');
      assert.strictEqual(
        result,
        'User John Doe prefers dark theme, push notifications: true, first item category: electronics'
      );
    });
    it('async util function with promise is instrumented', async () => {
      const result = await muchWorkWithPromise();
      const spans = getTestSpans();
      assert.strictEqual(spans.length, 1);
      assert.strictEqual(spans[0].name, 'util.js.muchWorkWithPromise');
      const durationMs =
        spans[0].duration[0] * 1e3 + spans[0].duration[1] / 1e6;
      // 1900 instead of 2000 cause nodejs be wildin sometimes
      assert(durationMs >= 1900, 'Actual duration: ' + durationMs);
      assert.strictEqual(result, 'Done after timeout');
    });
    it('extracts attributes from nested arrays', () => {
      const testArgs = {
        orders: [
          {
            id: 'order1',
            items: [
              { name: 'Laptop', price: 999, tags: ['electronics', 'computer'] },
              { name: 'Mouse', price: 25, tags: ['electronics', 'accessory'] },
            ],
          },
          {
            id: 'order2',
            items: [
              { name: 'Book', price: 15, tags: ['literature', 'fiction'] },
            ],
          },
        ],
      };

      const result = funWithNestedArrays(testArgs);
      const spans = getTestSpans();

      assert.strictEqual(spans.length, 1);
      const attributes = spans[0].attributes;
      assert.strictEqual(attributes['firstOrderFirstItem'], 'Laptop');
      assert.strictEqual(attributes['secondOrderFirstTag'], 'literature');
      assert.strictEqual(attributes['firstOrderSecondPrice'], 25);
      assert.strictEqual(result, 'Processed 2 orders');
    });
  });
});
