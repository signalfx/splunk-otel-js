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

import type { EnvVarKey, ResourceFactory } from '../types';
import type { TracingOptions, StartTracingOptions } from '../tracing';
import type { LoggingOptions, StartLoggingOptions } from '../logging';
import type { MetricsOptions, StartMetricsOptions } from '../metrics';
import type { ProfilingOptions, StartProfilingOptions } from '../profiling';
import type { Options as StartOptions } from '../start';
import type { Instrumentation } from '@opentelemetry/instrumentation';

import { _setDefaultOptions as setDefaultTracingOptions } from '../tracing/options';
import { _setDefaultOptions as setDefaultLoggingOptions } from '../logging';
import { _setDefaultOptions as setDefaultProfilingOptions } from '../profiling';
import { _setDefaultOptions as setDefaultMetricsOptions } from '../metrics';
import { getEnvBoolean, assertNoExtraneousProperties } from '../utils';
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

type CommonOptions = Omit<
  Partial<StartOptions>,
  'tracing' | 'profiling' | 'metrics' | 'logging' | 'logLevel'
>;

function coalesceOptions<
  T extends {
    serviceName?: string;
    endpoint?: string;
    accessToken?: string;
    realm?: string;
    resourceFactory?: ResourceFactory;
  },
>(options: T, common: CommonOptions): T {
  options.serviceName = options.serviceName ?? common.serviceName;
  options.endpoint = options.endpoint ?? common.endpoint;
  options.accessToken = options.accessToken ?? common.accessToken;
  options.resourceFactory = options.resourceFactory ?? common.resource;
  options.realm = options.realm ?? common.realm;
  return options;
}

function setupTracingOptions(
  common: CommonOptions,
  tracing: StartTracingOptions
): TracingOptions {
  const opts = coalesceOptions(tracing, common);
  return setDefaultTracingOptions(opts);
}

function setupProfilingOptions(
  common: CommonOptions,
  profiling: StartProfilingOptions
): ProfilingOptions {
  const opts = coalesceOptions(profiling, common);
  return setDefaultProfilingOptions(opts);
}

function setupMetricsOptions(
  common: CommonOptions,
  metrics: StartMetricsOptions
): MetricsOptions {
  const opts = coalesceOptions(metrics, common);
  return setDefaultMetricsOptions(opts);
}

function setupLoggingOptions(
  common: CommonOptions,
  logging: StartLoggingOptions
): LoggingOptions {
  const opts = coalesceOptions(logging, common);
  return setDefaultLoggingOptions(opts);
}

function signalStartOpt<T extends {}>(options: T | boolean | undefined): T {
  if (typeof options === 'object') {
    return options;
  }

  return {} as T;
}

export function parseOptionsAndConfigureInstrumentations(
  options: Partial<StartOptions> = {}
) {
  const { metrics, profiling, tracing, logging, ...commonOptions } = options;

  assertNoExtraneousProperties(commonOptions, [
    'accessToken',
    'endpoint',
    'realm',
    'serviceName',
    'logLevel',
    'resource',
  ]);

  const tracingOptions = setupTracingOptions(
    commonOptions,
    signalStartOpt(tracing)
  );
  const metricsOptions = setupMetricsOptions(
    commonOptions,
    signalStartOpt(metrics)
  );
  const profilingOptions = setupProfilingOptions(
    commonOptions,
    signalStartOpt(profiling)
  );
  const loggingOptions = setupLoggingOptions(
    commonOptions,
    signalStartOpt(logging)
  );

  configureInstrumentations({
    tracing: tracingOptions,
    logging: loggingOptions,
  });

  return { tracingOptions, loggingOptions, profilingOptions, metricsOptions };
}
