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
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';
import { strict as assert } from 'assert';
import { describe, it, mock } from 'node:test';
import * as Utils from '../../../../src/instrumentations/external/elasticsearch/utils';
import { calledWithExactly } from '../../../utils';

describe('elasticsearch utils', () => {
  const spanMock = {
    recordException: (err) => {},
    setStatus: (obj) => {},
    end: () => {},
    setAttributes: (obj) => {},
  };

  describe('defaultDbStatementSerializer', () => {
    it('should serialize', () => {
      const result = Utils.defaultDbStatementSerializer(
        'operationName',
        { index: 'test' },
        {}
      );
      assert.deepStrictEqual(
        result,
        '{"params":{"index":"test"},"options":{}}'
      );
    });
  });

  describe('onError', () => {
    it('should record error', () => {
      const recordExceptionStub = mock.method(spanMock, 'recordException');
      const setStatusStub = mock.method(spanMock, 'setStatus');
      const endStub = mock.method(spanMock, 'end');

      const error = new Error('test error');

      Utils.onError(spanMock, error);

      assert(recordExceptionStub.mock.callCount() === 1);
      calledWithExactly(recordExceptionStub, error);

      assert(setStatusStub.mock.callCount() === 1);
      calledWithExactly(setStatusStub, {
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      assert(endStub.mock.callCount() === 1);

      recordExceptionStub.mock.resetCalls();
      setStatusStub.mock.resetCalls();
      endStub.mock.resetCalls();
    });
  });

  describe('onResponse', () => {
    it('should record response without responseHook', () => {
      const setAttributesStub = mock.method(spanMock, 'setAttributes');
      const setStatusStub = mock.method(spanMock, 'setStatus');
      const endStub = mock.method(spanMock, 'end');

      Utils.onResponse(spanMock, {
        meta: { connection: { url: 'http://localhost' } },
      });

      assert(setAttributesStub.mock.callCount() === 1);
      assert(setStatusStub.mock.callCount() === 1);
      assert(endStub.mock.callCount() === 1);
      calledWithExactly(setStatusStub, { code: SpanStatusCode.OK });

      setAttributesStub.mock.resetCalls();
      setStatusStub.mock.resetCalls();
      endStub.mock.resetCalls();
    });

    it('should record response with responseHook', () => {
      const setAttributesStub = mock.method(spanMock, 'setAttributes');
      const setStatusStub = mock.method(spanMock, 'setStatus');
      const endStub = mock.method(spanMock, 'end');

      const responseHook = mock.fn();

      Utils.onResponse(
        spanMock,
        { meta: { connection: { url: 'http://localhost' } } },
        responseHook
      );

      assert(setAttributesStub.mock.callCount() === 1);
      assert(setStatusStub.mock.callCount() === 1);
      assert(endStub.mock.callCount() === 1);
      calledWithExactly(setStatusStub, { code: SpanStatusCode.OK });

      assert(responseHook.mock.callCount() === 1);

      setAttributesStub.mock.resetCalls();
      setStatusStub.mock.resetCalls();
      endStub.mock.resetCalls();
    });
  });

  describe('getNetAttributes', () => {
    const url = 'http://localhost:9200';
    const attributes = Utils.getNetAttributes(url);

    it('should get hostname from url', () => {
      assert.strictEqual(
        attributes[SemanticAttributes.NET_PEER_NAME],
        'localhost'
      );
    });

    it('should get hostname from url', () => {
      assert.strictEqual(attributes[SemanticAttributes.NET_PEER_PORT], '9200');
    });

    it('should set net.transport', () => {
      assert.strictEqual(
        attributes[SemanticAttributes.NET_TRANSPORT],
        'IP.TCP'
      );
    });
  });

  describe('getPort', () => {
    it('should get port', () => {
      const result = Utils.getPort('3030', 'http:');
      assert.strictEqual(result, '3030');
    });

    it('should get port from http protocol', () => {
      const result = Utils.getPort('', 'http:');
      assert.strictEqual(result, '80');
    });

    it('should get port from https protocol', () => {
      const result = Utils.getPort('', 'https:');
      assert.strictEqual(result, '443');
    });
  });

  describe('normalizeArguments', () => {
    it('should normalize with callback only', () => {
      const callbackFunction = () => {};
      const [params, options, callback] =
        Utils.normalizeArguments(callbackFunction);

      assert.deepStrictEqual(params, {});
      assert.deepStrictEqual(options, {});
      assert.strictEqual(callback, callbackFunction);
    });

    it('should normalize with params only', () => {
      const [params, options, callback] = Utils.normalizeArguments({
        index: 'test',
      });

      assert.deepStrictEqual(params, { index: 'test' });
      assert.strictEqual(options, undefined);
      assert.strictEqual(callback, undefined);
    });
  });

  describe('getIndexName', () => {
    it('should accept index string', () => {
      const index = Utils.getIndexName({ index: 'test' });
      assert.strictEqual(index, 'test');
    });

    it('should accept index array', () => {
      const indexes = Utils.getIndexName({ index: ['index1', 'index2'] });

      assert.strictEqual(indexes, 'index1,index2');
    });

    it('should accept no index', () => {
      const undefinedParams = Utils.getIndexName(undefined);
      const emptyObject = Utils.getIndexName({});

      assert.strictEqual(undefinedParams, undefined);
      assert.strictEqual(emptyObject, undefined);
    });

    it('should ignore unassert.strictEqualed index', () => {
      const functionIndex = Utils.getIndexName({ index: () => {} });
      const objectIndex = Utils.getIndexName({ index: {} });

      assert.strictEqual(functionIndex, undefined);
      assert.strictEqual(objectIndex, undefined);
    });
  });

  describe('startSpan', () => {
    const tracerMock = {
      startSpan: (name, options?, context?): any => {},
      startActiveSpan: () => {},
    };
    it('should start span with client kind', () => {
      const startSpanStub = mock.method(tracerMock, 'startSpan');

      Utils.startSpan({
        tracer: tracerMock,
        attributes: { testAttribute: 'testValue' },
      });

      assert(startSpanStub.mock.callCount() === 1);

      // const [operation, options] = startSpanStub.getCall(0).args;
      console.log('startSpanStub.mock.calls[0].arguments');
      console.log(startSpanStub.mock.calls[0].arguments);
      const [operation, options] = startSpanStub.mock.calls[0].arguments;

      assert.strictEqual(operation, 'elasticsearch.request');
      assert.strictEqual(options.kind, SpanKind.CLIENT);
      assert.strictEqual(
        options.attributes[SemanticAttributes.DB_SYSTEM],
        'elasticsearch'
      );
      assert.strictEqual(options.attributes.testAttribute, 'testValue');
    });
  });
});
