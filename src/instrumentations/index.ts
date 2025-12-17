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
import { assertNoExtraneousProperties } from '../utils';
import { configureGraphQlInstrumentation } from './graphql';
import { getConfigBoolean } from '../configuration';
import {
  configureHttpInstrumentation,
  configureHttpDcInstrumentation,
} from './http';
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
import { FastifyOtelInstrumentation } from '@fastify/otel';
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
import { Neo4jInstrumentation } from './external/neo4j';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';
import { OpenAIInstrumentation } from '@opentelemetry/instrumentation-openai';
import { OracleInstrumentation } from '@opentelemetry/instrumentation-oracledb';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { RedisInstrumentation } from '@opentelemetry/instrumentation-redis';
import { RestifyInstrumentation } from '@opentelemetry/instrumentation-restify';
import { RouterInstrumentation } from '@opentelemetry/instrumentation-router';
import { SocketIoInstrumentation } from '@opentelemetry/instrumentation-socket.io';
import { TediousInstrumentation } from '@opentelemetry/instrumentation-tedious';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { ElasticsearchInstrumentation } from './external/elasticsearch';
import { SequelizeInstrumentation } from './external/sequelize';
import { TypeormInstrumentation } from '@opentelemetry/instrumentation-typeorm';
import { UndiciInstrumentation } from '@opentelemetry/instrumentation-undici';
import { NoCodeInstrumentation } from './external/nocode';
import { HttpDcInstrumentation } from './httpdc/httpdc';

type InstrumentationInfo = {
  shortName: string;
  fullName: string;
  create: () => Instrumentation;
  disabledByDefault?: boolean;
};

interface Options {
  tracing: TracingOptions;
  logging: StartLoggingOptions;
}

export const bundledInstrumentations: InstrumentationInfo[] = [
  {
    create: () => new AmqplibInstrumentation(),
    shortName: 'amqplib',
    fullName: '@opentelemetry/instrumentation-amqplib',
  },
  {
    create: () => new AwsInstrumentation(),
    shortName: 'aws_sdk',
    fullName: '@opentelemetry/instrumentation-aws-sdk',
  },
  {
    create: () => new BunyanInstrumentation(),
    shortName: 'bunyan',
    fullName: '@opentelemetry/instrumentation-bunyan',
  },
  {
    create: () => new CassandraDriverInstrumentation(),
    shortName: 'cassandra_driver',
    fullName: '@opentelemetry/instrumentation-cassandra-driver',
  },
  {
    create: () => new ConnectInstrumentation(),
    shortName: 'connect',
    fullName: '@opentelemetry/instrumentation-connect',
  },
  {
    create: () => new DataloaderInstrumentation(),
    shortName: 'dataloader',
    fullName: '@opentelemetry/instrumentation-dataloader',
  },
  {
    create: () => new DnsInstrumentation(),
    shortName: 'dns',
    fullName: '@opentelemetry/instrumentation-dns',
  },
  {
    create: () => new ExpressInstrumentation(),
    shortName: 'express',
    fullName: '@opentelemetry/instrumentation-express',
  },
  {
    create: () => new FastifyOtelInstrumentation(),
    shortName: 'fastify',
    fullName: '@fastify/otel',
  },
  {
    create: () => new GenericPoolInstrumentation(),
    shortName: 'generic_pool',
    fullName: '@opentelemetry/instrumentation-generic-pool',
  },
  {
    create: () => new GraphQLInstrumentation(),
    shortName: 'graphql',
    fullName: '@opentelemetry/instrumentation-graphql',
  },
  {
    create: () => new GrpcInstrumentation(),
    shortName: 'grpc',
    fullName: '@opentelemetry/instrumentation-grpc',
  },
  {
    create: () => new HapiInstrumentation(),
    shortName: 'hapi',
    fullName: '@opentelemetry/instrumentation-hapi',
  },
  {
    create: () => new HttpInstrumentation(),
    shortName: 'http',
    fullName: '@opentelemetry/instrumentation-http',
  },
  {
    create: () => new IORedisInstrumentation(),
    shortName: 'ioredis',
    fullName: '@opentelemetry/instrumentation-ioredis',
  },
  {
    create: () => new KafkaJsInstrumentation(),
    shortName: 'kafkajs',
    fullName: '@opentelemetry/instrumentation-kafkajs',
  },
  {
    create: () => new KnexInstrumentation(),
    shortName: 'knex',
    fullName: '@opentelemetry/instrumentation-knex',
  },
  {
    create: () => new KoaInstrumentation(),
    shortName: 'koa',
    fullName: '@opentelemetry/instrumentation-koa',
  },
  {
    create: () => new LruMemoizerInstrumentation(),
    shortName: 'lru_memoizer',
    fullName: '@opentelemetry/instrumentation-lru-memoizer',
  },
  {
    create: () => new MemcachedInstrumentation(),
    shortName: 'memcached',
    fullName: '@opentelemetry/instrumentation-memcached',
  },
  {
    create: () => new MongoDBInstrumentation(),
    shortName: 'mongodb',
    fullName: '@opentelemetry/instrumentation-mongodb',
  },
  {
    create: () => new MongooseInstrumentation(),
    shortName: 'mongoose',
    fullName: '@opentelemetry/instrumentation-mongoose',
  },
  {
    create: () => new MySQLInstrumentation(),
    shortName: 'mysql',
    fullName: '@opentelemetry/instrumentation-mysql',
  },
  {
    create: () => new MySQL2Instrumentation(),
    shortName: 'mysql2',
    fullName: '@opentelemetry/instrumentation-mysql2',
  },
  {
    create: () => new Neo4jInstrumentation(),
    shortName: 'neo4j',
    fullName: 'splunk-opentelemetry-instrumentation-neo4j',
  },
  {
    create: () => new NestInstrumentation(),
    shortName: 'nestjs_core',
    fullName: '@opentelemetry/nestjs-core',
  },
  {
    create: () => new NetInstrumentation(),
    shortName: 'net',
    fullName: '@opentelemetry/instrumentation-net',
  },
  {
    create: () => new NoCodeInstrumentation(),
    shortName: 'nocode',
    fullName: 'splunk-opentelemetry-instrumentation-nocode',
  },
  {
    create: () => new OpenAIInstrumentation(),
    shortName: 'openai',
    fullName: '@opentelemetry/instrumentation-openai',
  },
  {
    create: () => new OracleInstrumentation(),
    shortName: 'oracle',
    fullName: '@opentelemetry/instrumentation-oracle',
  },
  {
    create: () => new PgInstrumentation(),
    shortName: 'pg',
    fullName: '@opentelemetry/instrumentation-pg',
  },
  {
    create: () => new PinoInstrumentation(),
    shortName: 'pino',
    fullName: '@opentelemetry/instrumentation-pino',
  },
  {
    create: () => new RedisInstrumentation(),
    shortName: 'redis',
    fullName: '@opentelemetry/instrumentation-redis',
  },
  {
    create: () => new RestifyInstrumentation(),
    shortName: 'restify',
    fullName: '@opentelemetry/instrumentation-restify',
  },
  {
    create: () => new RouterInstrumentation(),
    shortName: 'router',
    fullName: '@opentelemetry/instrumentation-router',
  },
  {
    create: () => new SocketIoInstrumentation(),
    shortName: 'socketio',
    fullName: '@opentelemetry/instrumentation-socket.io',
  },
  {
    create: () => new TediousInstrumentation(),
    shortName: 'tedious',
    fullName: '@opentelemetry/instrumentation-tedious',
  },
  {
    create: () => new WinstonInstrumentation(),
    shortName: 'winston',
    fullName: '@opentelemetry/instrumentation-winston',
  },
  {
    create: () => new ElasticsearchInstrumentation(),
    shortName: 'elasticsearch',
    fullName: 'splunk-opentelemetry-instrumentation-elasticsearch',
  },
  {
    create: () => new SequelizeInstrumentation(),
    shortName: 'sequelize',
    fullName: '@opentelemetry/instrumentation-sequelize',
  },
  {
    create: () => new TypeormInstrumentation(),
    shortName: 'typeorm',
    fullName: '@opentelemetry/instrumentation-typeorm',
  },
  {
    create: () => new UndiciInstrumentation(),
    shortName: 'undici',
    fullName: '@opentelemetry/instrumentation-undici',
  },
  {
    create: () => new HttpDcInstrumentation(),
    shortName: 'httpdc',
    fullName: '@opentelemetry/instrumentation-httpdc',
    disabledByDefault: true,
  },
];

function envKey(info: InstrumentationInfo) {
  return `OTEL_INSTRUMENTATION_${info.shortName.toUpperCase()}_ENABLED` as EnvVarKey;
}

function getInstrumentationsToLoad() {
  const enabledByDefault = getConfigBoolean(
    'OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED',
    true
  );

  const instrumentations = bundledInstrumentations.filter((info) => {
    const defaultEnabled =
      info.disabledByDefault === undefined
        ? enabledByDefault
        : !info.disabledByDefault;
    return getConfigBoolean(envKey(info), defaultEnabled);
  });

  const httpInstrumentation = instrumentations.find(
    (i) => i.shortName === 'http'
  );
  const httpDcInstrumentation = instrumentations.find(
    (i) => i.shortName === 'httpdc'
  );

  if (
    httpInstrumentation !== undefined &&
    httpDcInstrumentation !== undefined
  ) {
    throw new Error(
      'Can not enable both HTTP and the experimental HTTPDC instrumentation.'
    );
  }

  return instrumentations;
}

export function getInstrumentations(): Instrumentation[] {
  const instrumentations: Instrumentation[] = [];

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
      case '@opentelemetry/instrumentation-httpdc':
        configureHttpDcInstrumentation(instr, options.tracing);
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

function signalStartOpt<T extends object>(options: T | boolean | undefined): T {
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
