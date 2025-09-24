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
//
import { describe, before, beforeEach, after, it } from 'node:test';
import {
  AggregationTemporality,
  DataPointType,
  MeterProvider,
} from '@opentelemetry/sdk-metrics';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_SCHEME,
} from '@opentelemetry/semantic-conventions';
import {
  ATTR_HTTP_FLAVOR,
  ATTR_HTTP_METHOD,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_STATUS_CODE,
  ATTR_NET_HOST_NAME,
  ATTR_NET_HOST_PORT,
  ATTR_NET_PEER_NAME,
  ATTR_NET_PEER_PORT,
} from '../../../src/instrumentations/httpdc/semconv';
import * as assert from 'assert';
import { HttpDcInstrumentation } from '../../../src/instrumentations/httpdc/httpdc';
import { httpRequest, isSupported } from './utils/utils';
import { TestMetricReader } from '../../utils';
import { context, ContextManager } from '@opentelemetry/api';
import { SemconvStability } from '@opentelemetry/instrumentation';
const instrumentation = new HttpDcInstrumentation();
instrumentation.enable();
instrumentation.disable();

import * as http from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';

let server: http.Server;
const serverPort = 22446;
const protocol = 'http';
const hostname = 'localhost';
const pathname = '/test';
const tracerProvider = new NodeTracerProvider();

const metricReader = new TestMetricReader(AggregationTemporality.DELTA);
const meterProvider = new MeterProvider({ readers: [metricReader] });

instrumentation.setTracerProvider(tracerProvider);
instrumentation.setMeterProvider(meterProvider);

describe('metrics', { skip: !isSupported() }, () => {
  let contextManager: ContextManager;

  beforeEach(async () => {
    contextManager = new AsyncHooksContextManager().enable();
    context.setGlobalContextManager(contextManager);
    instrumentation['_updateMetricInstruments']();
  });

  before(() => {
    instrumentation.enable();
    server = http.createServer((request, response) => {
      const rpcData = getRPCMetadata(context.active());
      assert.ok(rpcData);
      assert.strictEqual(rpcData.type, RPCType.HTTP);
      assert.strictEqual(rpcData.route, undefined);
      rpcData.route = 'TheRoute';
      response.end('Test Server Response');
    });
    server.listen(serverPort);
  });

  after(() => {
    server.close();
    instrumentation.disable();
  });
  describe('with no stability set', () => {
    it('should add server/client duration metrics', async () => {
      const requestCount = 3;
      for (let i = 0; i < requestCount; i++) {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
      }

      const { resourceMetrics } = await metricReader.collect();
      const scopeMetrics = resourceMetrics.scopeMetrics;
      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      const metrics = scopeMetrics[0].metrics;
      assert.strictEqual(metrics.length, 2, 'metrics count');
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Measures the duration of inbound HTTP requests.'
      );
      assert.strictEqual(metrics[0].descriptor.name, 'http.server.duration');
      assert.strictEqual(metrics[0].descriptor.unit, 'ms');
      assert.strictEqual(metrics[0].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[0].dataPoints[0].value as any).count,
        requestCount
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_SCHEME],
        'http'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_METHOD],
        'GET'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_FLAVOR],
        '1.1'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_NET_HOST_NAME],
        'localhost'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_STATUS_CODE],
        200
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_NET_HOST_PORT],
        serverPort
      );

      assert.strictEqual(metrics[1].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[1].descriptor.description,
        'Measures the duration of outbound HTTP requests.'
      );
      assert.strictEqual(metrics[1].descriptor.name, 'http.client.duration');
      assert.strictEqual(metrics[1].descriptor.unit, 'ms');
      assert.strictEqual(metrics[1].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[1].dataPoints[0].value as any).count,
        requestCount
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_HTTP_METHOD],
        'GET'
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_NET_PEER_NAME],
        'localhost'
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_NET_PEER_PORT],
        serverPort
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_HTTP_STATUS_CODE],
        200
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_HTTP_FLAVOR],
        '1.1'
      );
    });
  });

  describe('with semconv stability set to stable', () => {
    before(() => {
      instrumentation.setConfig({ semconvStability: SemconvStability.STABLE });
    });

    it('should add server/client duration metrics', async () => {
      const requestCount = 3;
      for (let i = 0; i < requestCount; i++) {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
      }

      let { resourceMetrics } = await metricReader.collect();
      let scopeMetrics = resourceMetrics.scopeMetrics;
      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      let metrics = scopeMetrics[0].metrics;
      assert.strictEqual(metrics.length, 2, 'metrics count');
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Duration of HTTP server requests.'
      );
      assert.strictEqual(
        metrics[0].descriptor.name,
        'http.server.request.duration'
      );
      assert.strictEqual(metrics[0].descriptor.unit, 's');
      assert.strictEqual(metrics[0].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[0].dataPoints[0].value as any).count,
        requestCount
      );
      assert.deepStrictEqual(metrics[0].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_URL_SCHEME]: 'http',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_HTTP_ROUTE]: 'TheRoute',
      });

      assert.strictEqual(metrics[1].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[1].descriptor.description,
        'Duration of HTTP client requests.'
      );
      assert.strictEqual(
        metrics[1].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(metrics[1].descriptor.unit, 's');
      assert.strictEqual(metrics[1].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[1].dataPoints[0].value as any).count,
        requestCount
      );

      assert.deepStrictEqual(metrics[1].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_SERVER_ADDRESS]: 'localhost',
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
      });

      assert.throws(() =>
        http.request({
          hostname,
          port: serverPort,
          pathname,
          headers: { cookie: undefined },
        })
      );

      ({ resourceMetrics } = await metricReader.collect());
      scopeMetrics = resourceMetrics.scopeMetrics;
      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      metrics = scopeMetrics[0].metrics;
      assert.strictEqual(metrics.length, 1, 'metrics count');
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Duration of HTTP client requests.'
      );
      assert.strictEqual(
        metrics[0].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(metrics[0].descriptor.unit, 's');
      assert.strictEqual(metrics[0].dataPoints.length, 1);
      assert.strictEqual((metrics[0].dataPoints[0].value as any).count, 1);

      assert.deepStrictEqual(metrics[0].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_SERVER_ADDRESS]: 'localhost',
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_ERROR_TYPE]: 'TypeError',
      });
    });
  });

  describe('with semconv stability set to duplicate', () => {
    before(() => {
      instrumentation['_semconvStability'] = SemconvStability.DUPLICATE;
    });

    it('should add server/client duration metrics', async () => {
      const requestCount = 3;
      for (let i = 0; i < requestCount; i++) {
        await httpRequest.get(
          `${protocol}://${hostname}:${serverPort}${pathname}`
        );
      }

      let { resourceMetrics } = await metricReader.collect();
      let scopeMetrics = resourceMetrics.scopeMetrics;
      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      let metrics = scopeMetrics[0].metrics;
      assert.strictEqual(metrics.length, 4, 'metrics count');

      // old metrics
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Measures the duration of inbound HTTP requests.'
      );
      assert.strictEqual(metrics[0].descriptor.name, 'http.server.duration');
      assert.strictEqual(metrics[0].descriptor.unit, 'ms');
      assert.strictEqual(metrics[0].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[0].dataPoints[0].value as any).count,
        requestCount
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_SCHEME],
        'http'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_METHOD],
        'GET'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_FLAVOR],
        '1.1'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_NET_HOST_NAME],
        'localhost'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_STATUS_CODE],
        200
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_NET_HOST_PORT],
        serverPort
      );

      assert.strictEqual(metrics[1].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[1].descriptor.description,
        'Measures the duration of outbound HTTP requests.'
      );
      assert.strictEqual(metrics[1].descriptor.name, 'http.client.duration');
      assert.strictEqual(metrics[1].descriptor.unit, 'ms');
      assert.strictEqual(metrics[1].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[1].dataPoints[0].value as any).count,
        requestCount
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_HTTP_METHOD],
        'GET'
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_NET_PEER_NAME],
        'localhost'
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_NET_PEER_PORT],
        serverPort
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_HTTP_STATUS_CODE],
        200
      );
      assert.strictEqual(
        metrics[1].dataPoints[0].attributes[ATTR_HTTP_FLAVOR],
        '1.1'
      );

      // Stable metrics
      assert.strictEqual(metrics[2].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[2].descriptor.description,
        'Duration of HTTP server requests.'
      );
      assert.strictEqual(
        metrics[2].descriptor.name,
        'http.server.request.duration'
      );
      assert.strictEqual(metrics[2].descriptor.unit, 's');
      assert.strictEqual(metrics[2].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[2].dataPoints[0].value as any).count,
        requestCount
      );
      assert.deepStrictEqual(metrics[2].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_URL_SCHEME]: 'http',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_HTTP_ROUTE]: 'TheRoute',
      });

      assert.strictEqual(metrics[3].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[3].descriptor.description,
        'Duration of HTTP client requests.'
      );
      assert.strictEqual(
        metrics[3].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(metrics[3].descriptor.unit, 's');
      assert.strictEqual(metrics[3].dataPoints.length, 1);
      assert.strictEqual(
        (metrics[3].dataPoints[0].value as any).count,
        requestCount
      );

      assert.deepStrictEqual(metrics[3].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_SERVER_ADDRESS]: 'localhost',
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_NETWORK_PROTOCOL_VERSION]: '1.1',
        [ATTR_HTTP_RESPONSE_STATUS_CODE]: 200,
      });

      assert.throws(() =>
        http.request({
          hostname,
          port: serverPort,
          pathname,
          headers: { cookie: undefined },
        })
      );

      ({ resourceMetrics } = await metricReader.collect());
      scopeMetrics = resourceMetrics.scopeMetrics;
      assert.strictEqual(scopeMetrics.length, 1, 'scopeMetrics count');
      metrics = scopeMetrics[0].metrics;
      assert.strictEqual(metrics.length, 2, 'metrics count');

      // Old metrics
      assert.strictEqual(metrics[0].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[0].descriptor.description,
        'Measures the duration of outbound HTTP requests.'
      );
      assert.strictEqual(metrics[0].descriptor.name, 'http.client.duration');
      assert.strictEqual(metrics[0].descriptor.unit, 'ms');
      assert.strictEqual(metrics[0].dataPoints.length, 1);
      assert.strictEqual((metrics[0].dataPoints[0].value as any).count, 1);
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_HTTP_METHOD],
        'GET'
      );
      assert.strictEqual(
        metrics[0].dataPoints[0].attributes[ATTR_NET_PEER_NAME],
        'localhost'
      );

      // Stable metrics
      assert.strictEqual(metrics[1].dataPointType, DataPointType.HISTOGRAM);
      assert.strictEqual(
        metrics[1].descriptor.description,
        'Duration of HTTP client requests.'
      );
      assert.strictEqual(
        metrics[1].descriptor.name,
        'http.client.request.duration'
      );
      assert.strictEqual(metrics[1].descriptor.unit, 's');
      assert.strictEqual(metrics[1].dataPoints.length, 1);
      assert.strictEqual((metrics[1].dataPoints[0].value as any).count, 1);

      assert.deepStrictEqual(metrics[1].dataPoints[0].attributes, {
        [ATTR_HTTP_REQUEST_METHOD]: 'GET',
        [ATTR_SERVER_ADDRESS]: 'localhost',
        [ATTR_SERVER_PORT]: serverPort,
        [ATTR_ERROR_TYPE]: 'TypeError',
      });
    });
  });
});
