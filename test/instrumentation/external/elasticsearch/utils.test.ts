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
import * as sinon from 'sinon';
import * as assert from 'assert';
import * as Utils from '../../../../src/instrumentations/external/elasticsearch/utils';
import { SpanKind, SpanStatusCode } from '@opentelemetry/api';
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

describe('elasticsearch utils', () => {
  const spanMock = {
    recordException: (err) => {},
    setStatus: (obj) => {},
    end: () => {},
    setAttributes: (obj) => {},
  };

  context('defaultDbStatementSerializer', () => {
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

  context('onError', () => {
    it('should record error', () => {
      const recordExceptionStub = sinon.stub(spanMock, 'recordException');
      const setStatusStub = sinon.stub(spanMock, 'setStatus');
      const endStub = sinon.stub(spanMock, 'end');

      const error = new Error('test error');

      Utils.onError(spanMock, error);

      sinon.assert.calledOnce(recordExceptionStub);
      sinon.assert.calledWith(recordExceptionStub, error);

      sinon.assert.calledOnce(setStatusStub);
      sinon.assert.calledWith(setStatusStub, {
        code: SpanStatusCode.ERROR,
        message: error.message,
      });

      sinon.assert.calledOnce(endStub);

      recordExceptionStub.restore();
      setStatusStub.restore();
      endStub.restore();
    });
  });

  context('onResponse', () => {
    it('should record response without responseHook', () => {
      const setAttributesStub = sinon.stub(spanMock, 'setAttributes');
      const setStatusStub = sinon.stub(spanMock, 'setStatus');
      const endStub = sinon.stub(spanMock, 'end');

      Utils.onResponse(spanMock, {
        meta: { connection: { url: 'http://localhost' } },
      });

      sinon.assert.calledOnce(setAttributesStub);
      sinon.assert.calledOnce(setStatusStub);
      sinon.assert.calledOnce(endStub);
      sinon.assert.calledWith(setStatusStub, { code: SpanStatusCode.OK });

      setAttributesStub.restore();
      setStatusStub.restore();
      endStub.restore();
    });

    it('should record response with responseHook', () => {
      const setAttributesStub = sinon.stub(spanMock, 'setAttributes');
      const setStatusStub = sinon.stub(spanMock, 'setStatus');
      const endStub = sinon.stub(spanMock, 'end');

      const responseHook = sinon.spy();

      Utils.onResponse(
        spanMock,
        { meta: { connection: { url: 'http://localhost' } } },
        responseHook
      );

      sinon.assert.calledOnce(setAttributesStub);
      sinon.assert.calledOnce(setStatusStub);
      sinon.assert.calledOnce(endStub);
      sinon.assert.calledWith(setStatusStub, { code: SpanStatusCode.OK });

      assert.strictEqual(responseHook.called, true);

      setAttributesStub.restore();
      setStatusStub.restore();
      endStub.restore();
    });
  });

  context('getNetAttributes', () => {
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

  context('getPort', () => {
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

  context('normalizeArguments', () => {
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

  context('getIndexName', () => {
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

  context('startSpan', () => {
    const tracerMock = {
      startSpan: (name, options?, context?): any => {},
      startActiveSpan: () => {},
    };
    it('should start span with client kind', () => {
      const startSpanStub = sinon.stub(tracerMock, 'startSpan');

      Utils.startSpan({
        tracer: tracerMock,
        attributes: { testAttribute: 'testValue' },
      });

      sinon.assert.calledOnce(startSpanStub);

      const [operation, options] = startSpanStub.getCall(0).args;

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
