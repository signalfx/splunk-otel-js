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

import { load } from './loader';
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

type InstrumentationInfo = {
  module: string;
  name: string;
  shortName: string;
};

interface Options {
  tracing: TracingOptions;
  logging: StartLoggingOptions;
}

export const bundledInstrumentations: InstrumentationInfo[] = [
  {
    module: '@opentelemetry/instrumentation-amqplib',
    name: 'AmqplibInstrumentation',
    shortName: 'amqplib',
  },
  {
    module: '@opentelemetry/instrumentation-aws-sdk',
    name: 'AwsInstrumentation',
    shortName: 'aws_sdk',
  },
  {
    module: '@opentelemetry/instrumentation-bunyan',
    name: 'BunyanInstrumentation',
    shortName: 'bunyan',
  },
  {
    module: '@opentelemetry/instrumentation-cassandra-driver',
    name: 'CassandraDriverInstrumentation',
    shortName: 'cassandra_driver',
  },
  {
    module: '@opentelemetry/instrumentation-connect',
    name: 'ConnectInstrumentation',
    shortName: 'connect',
  },
  {
    module: '@opentelemetry/instrumentation-dataloader',
    name: 'DataloaderInstrumentation',
    shortName: 'dataloader',
  },
  {
    module: '@opentelemetry/instrumentation-dns',
    name: 'DnsInstrumentation',
    shortName: 'dns',
  },
  {
    module: '@opentelemetry/instrumentation-express',
    name: 'ExpressInstrumentation',
    shortName: 'express',
  },
  {
    module: '@opentelemetry/instrumentation-fastify',
    name: 'FastifyInstrumentation',
    shortName: 'fastify',
  },
  {
    module: '@opentelemetry/instrumentation-generic-pool',
    name: 'GenericPoolInstrumentation',
    shortName: 'generic_pool',
  },
  {
    module: '@opentelemetry/instrumentation-graphql',
    name: 'GraphQLInstrumentation',
    shortName: 'graphql',
  },
  {
    module: '@opentelemetry/instrumentation-grpc',
    name: 'GrpcInstrumentation',
    shortName: 'grpc',
  },
  {
    module: '@opentelemetry/instrumentation-hapi',
    name: 'HapiInstrumentation',
    shortName: 'hapi',
  },
  {
    module: '@opentelemetry/instrumentation-http',
    name: 'HttpInstrumentation',
    shortName: 'http',
  },
  {
    module: '@opentelemetry/instrumentation-ioredis',
    name: 'IORedisInstrumentation',
    shortName: 'ioredis',
  },
  {
    module: '@opentelemetry/instrumentation-knex',
    name: 'KnexInstrumentation',
    shortName: 'knex',
  },
  {
    module: '@opentelemetry/instrumentation-koa',
    name: 'KoaInstrumentation',
    shortName: 'koa',
  },
  {
    module: '@opentelemetry/instrumentation-memcached',
    name: 'MemcachedInstrumentation',
    shortName: 'memcached',
  },
  {
    module: '@opentelemetry/instrumentation-mongodb',
    name: 'MongoDBInstrumentation',
    shortName: 'mongodb',
  },
  {
    module: '@opentelemetry/instrumentation-mongoose',
    name: 'MongooseInstrumentation',
    shortName: 'mongoose',
  },
  {
    module: '@opentelemetry/instrumentation-mysql',
    name: 'MySQLInstrumentation',
    shortName: 'mysql',
  },
  {
    module: '@opentelemetry/instrumentation-mysql2',
    name: 'MySQL2Instrumentation',
    shortName: 'mysql2',
  },
  {
    module: '@opentelemetry/instrumentation-nestjs-core',
    name: 'NestInstrumentation',
    shortName: 'nestjs_core',
  },
  {
    module: '@opentelemetry/instrumentation-net',
    name: 'NetInstrumentation',
    shortName: 'net',
  },
  {
    module: '@opentelemetry/instrumentation-pg',
    name: 'PgInstrumentation',
    shortName: 'pg',
  },
  {
    module: '@opentelemetry/instrumentation-pino',
    name: 'PinoInstrumentation',
    shortName: 'pino',
  },
  {
    module: '@opentelemetry/instrumentation-redis',
    name: 'RedisInstrumentation',
    shortName: 'redis',
  },
  {
    module: '@opentelemetry/instrumentation-redis-4',
    name: 'RedisInstrumentation',
    shortName: 'redis_4',
  },
  {
    module: '@opentelemetry/instrumentation-restify',
    name: 'RestifyInstrumentation',
    shortName: 'restify',
  },
  {
    module: '@opentelemetry/instrumentation-router',
    name: 'RouterInstrumentation',
    shortName: 'router',
  },
  {
    module: '@opentelemetry/instrumentation-tedious',
    name: 'TediousInstrumentation',
    shortName: 'tedious',
  },
  {
    module: '@opentelemetry/instrumentation-winston',
    name: 'WinstonInstrumentation',
    shortName: 'winston',
  },
  {
    module: './external/elasticsearch',
    name: 'ElasticsearchInstrumentation',
    shortName: 'elasticsearch',
  },
  {
    module: './external/kafkajs',
    name: 'KafkaJsInstrumentation',
    shortName: 'kafkajs',
  },
  {
    module: './external/sequelize',
    name: 'SequelizeInstrumentation',
    shortName: 'sequelize',
  },
  {
    module: './external/typeorm',
    name: 'TypeormInstrumentation',
    shortName: 'typeorm',
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
  const loaded = [];

  for (const desc of getInstrumentationsToLoad()) {
    const Instrumentation = load(desc.module, desc.name);
    if (typeof Instrumentation === 'function') {
      loaded.push(new (Instrumentation as typeof Instrumentation)());
    }
  }

  return loaded;
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
        disableLogSending(instr);
        configureLogInjection(instr);
        break;
      case '@opentelemetry/instrumentation-pino':
      case '@opentelemetry/instrumentation-winston':
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
