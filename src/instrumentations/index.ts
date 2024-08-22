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

import { getEnvBoolean, assertNoExtraneousProperties, pick } from '../utils';
import type { EnvVarKey } from '../types';
import {
  allowedTracingOptions,
  Options as TracingOptions,
  _setDefaultOptions as setDefaultTracingOptions,
} from '../tracing/options';

import type { StartLoggingOptions } from '../logging';
import {
  allowedLoggingOptions,
  _setDefaultOptions as setDefaultLoggingOptions,
} from '../logging';
import { allowedProfilingOptions } from '../profiling/types';
import { _setDefaultOptions as setDefaultProfilingOptions } from '../profiling';
import {
  allowedMetricsOptions,
  _setDefaultOptions as setDefaultMetricsOptions,
} from '../metrics';
import type { Options as StartOptions } from '../start';
import { configureGraphQlInstrumentation } from './graphql';
import { configureHttpInstrumentation } from './http';
import { configureLogInjection, disableLogSending } from './logging';
import { configureRedisInstrumentation } from './redis';
import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan';
import { CassandraDriverInstrumentation } from '@opentelemetry/instrumentation-cassandra-driver';
import { ConnectInstrumentation } from '@opentelemetry/instrumentation-connect';
import { DataloaderInstrumentation } from '@opentelemetry/instrumentation-dataloader';
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { GenericPoolInstrumentation } from '@opentelemetry/instrumentation-generic-pool';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { HapiInstrumentation } from '@opentelemetry/instrumentation-hapi';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { KafkaJsInstrumentation } from '@opentelemetry/instrumentation-kafkajs';
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex';
import { KoaInstrumentation } from '@opentelemetry/instrumentation-koa';
import { LruMemoizerInstrumentation } from '@opentelemetry/instrumentation-lru-memoizer';
import { MemcachedInstrumentation } from '@opentelemetry/instrumentation-memcached';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
import { MongooseInstrumentation } from '@opentelemetry/instrumentation-mongoose';
import { MySQLInstrumentation } from '@opentelemetry/instrumentation-mysql';
import { MySQL2Instrumentation } from '@opentelemetry/instrumentation-mysql2';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { RedisInstrumentation as Redis4Instrumentation } from '@opentelemetry/instrumentation-redis-4';
import { RestifyInstrumentation } from '@opentelemetry/instrumentation-restify';
import { RouterInstrumentation } from '@opentelemetry/instrumentation-router';
import { SocketIoInstrumentation } from '@opentelemetry/instrumentation-socket.io';
import { TediousInstrumentation } from '@opentelemetry/instrumentation-tedious';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { ElasticsearchInstrumentation } from './external/elasticsearch';
import { SequelizeInstrumentation } from './external/sequelize';
import { TypeormInstrumentation } from './external/typeorm';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import type { Instrumentation } from '@opentelemetry/instrumentation';

type InstrumentationInfo = {
  shortName: string;
  create: () => Instrumentation;
};

interface Options {
  tracing: TracingOptions;
  logging: StartLoggingOptions;
}

export const bundledInstrumentations: InstrumentationInfo[] = [
  {
    create: () => new AmqplibInstrumentation(),
    shortName: 'amqplib',
  },
  {
    create: () => new AwsInstrumentation(),
    shortName: 'aws_sdk',
  },
  {
    create: () => new BunyanInstrumentation(),
    shortName: 'bunyan',
  },
  {
    create: () => new CassandraDriverInstrumentation(),
    shortName: 'cassandra_driver',
  },
  {
    create: () => new ConnectInstrumentation(),
    shortName: 'connect',
  },
  {
    create: () => new DataloaderInstrumentation(),
    shortName: 'dataloader',
  },
  {
    create: () => new DnsInstrumentation(),
    shortName: 'dns',
  },
  {
    create: () => new ExpressInstrumentation(),
    shortName: 'express',
  },
  {
    create: () => new FastifyInstrumentation(),
    shortName: 'fastify',
  },
  {
    create: () => new GenericPoolInstrumentation(),
    shortName: 'generic_pool',
  },
  {
    create: () => new GraphQLInstrumentation(),
    shortName: 'graphql',
  },
  {
    create: () => new GrpcInstrumentation(),
    shortName: 'grpc',
  },
  {
    create: () => new HapiInstrumentation(),
    shortName: 'hapi',
  },
  {
    create: () => new HttpInstrumentation(),
    shortName: 'http',
  },
  {
    create: () => new IORedisInstrumentation(),
    shortName: 'ioredis',
  },
  {
    create: () => new KafkaJsInstrumentation(),
    shortName: 'kafkajs',
  },
  {
    create: () => new KnexInstrumentation(),
    shortName: 'knex',
  },
  {
    create: () => new KoaInstrumentation(),
    shortName: 'koa',
  },
  {
    create: () => new LruMemoizerInstrumentation(),
    shortName: 'lru_memoizer',
  },
  {
    create: () => new MemcachedInstrumentation(),
    shortName: 'memcached',
  },
  {
    create: () => new MongoDBInstrumentation(),
    shortName: 'mongodb',
  },
  {
    create: () => new MongooseInstrumentation(),
    shortName: 'mongoose',
  },
  {
    create: () => new MySQLInstrumentation(),
    shortName: 'mysql',
  },
  {
    create: () => new MySQL2Instrumentation(),
    shortName: 'mysql2',
  },
  {
    create: () => new NestInstrumentation(),
    shortName: 'nestjs_core',
  },
  {
    create: () => new NetInstrumentation(),
    shortName: 'net',
  },
  {
    create: () => new PgInstrumentation(),
    shortName: 'pg',
  },
  {
    create: () => new PinoInstrumentation(),
    shortName: 'pino',
  },
  {
    create: () => new RedisInstrumentation(),
    shortName: 'redis',
  },
  {
    create: () => new Redis4Instrumentation(),
    shortName: 'redis_4',
  },
  {
    create: () => new RestifyInstrumentation(),
    shortName: 'restify',
  },
  {
    create: () => new RouterInstrumentation(),
    shortName: 'router',
  },
  {
    create: () => new SocketIoInstrumentation(),
    shortName: 'socketio',
  },
  {
    create: () => new TediousInstrumentation(),
    shortName: 'tedious',
  },
  {
    create: () => new WinstonInstrumentation(),
    shortName: 'winston',
  },
  {
    create: () => new ElasticsearchInstrumentation(),
    shortName: 'elasticsearch',
  },
  {
    create: () => new SequelizeInstrumentation(),
    shortName: 'sequelize',
  },
  {
    create: () => new TypeormInstrumentation(),
    shortName: 'typeorm',
  },
  {
    create: () => new UndiciInstrumentation(),
    shortName: 'undici',
  },
];

function envKey(info: InstrumentationInfo) {
  return `OTEL_INSTRUMENTATION_${info.shortName.toUpperCase()}_ENABLED` as EnvVarKey;
}

function getInstrumentationsToLoad() {
  const enabledByDefault = getEnvBoolean(
    'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED',
    true
  );
  return bundledInstrumentations.filter((info) =>
    getEnvBoolean(envKey(info), enabledByDefault)
  );
}

export function getInstrumentations() {
  const instrumentations = [];

  for (const desc of getInstrumentationsToLoad()) {
    instrumentations.push(desc.create());
  }

  return instrumentations;
}

export function configureInstrumentations(options: Options) {
  const instrumentations = options.tracing.instrumentations || [];
  for (const instrumentation of instrumentations) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instr = instrumentation as any;

    switch (instr['instrumentationName']) {
      case '@opentelemetry/instrumentation-graphql':
        configureGraphQlInstrumentation(instr, options.tracing);
        break;
      case '@opentelemetry/instrumentation-http':
        configureHttpInstrumentation(instr, options.tracing);
        break;
      case '@opentelemetry/instrumentation-redis':
        configureRedisInstrumentation(instr, options.tracing);
        break;
      case '@opentelemetry/instrumentation-bunyan':
      case '@opentelemetry/instrumentation-pino':
      case '@opentelemetry/instrumentation-winston':
        disableLogSending(instr);
        configureLogInjection(instr);
        break;
    }
  }
}

export function parseOptionsAndConfigureInstrumentations(
  options: Partial<StartOptions> = {}
) {
  const { metrics, profiling, tracing, logging, ...restOptions } = options;

  assertNoExtraneousProperties(restOptions, [
    'accessToken',
    'endpoint',
    'serviceName',
    'logLevel',
  ]);

  const startProfilingOptions = Object.assign(
    pick(restOptions, allowedProfilingOptions),
    profiling
  );

  assertNoExtraneousProperties(startProfilingOptions, allowedProfilingOptions);
  const profilingOptions = setDefaultProfilingOptions(startProfilingOptions);

  const startLoggingOptions = Object.assign(
    pick(restOptions, allowedLoggingOptions),
    logging
  );

  const loggingOptions = setDefaultLoggingOptions(startLoggingOptions);

  const startTracingOptions = Object.assign(
    pick(restOptions, allowedTracingOptions),
    tracing
  ) as Partial<TracingOptions>;

  assertNoExtraneousProperties(startTracingOptions, allowedTracingOptions);
  const tracingOptions = setDefaultTracingOptions(startTracingOptions);

  const startMetricsOptions = Object.assign(
    pick(restOptions, allowedMetricsOptions),
    metrics
  );

  assertNoExtraneousProperties(startMetricsOptions, allowedMetricsOptions);
  const metricsOptions = setDefaultMetricsOptions(startMetricsOptions);

  configureInstrumentations({
    tracing: tracingOptions,
    logging: loggingOptions,
  });

  return { tracingOptions, loggingOptions, profilingOptions, metricsOptions };
}
