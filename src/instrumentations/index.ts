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

import { getEnvBoolean } from '../utils';
import type { EnvVarKey } from '../types';
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
import { TediousInstrumentation } from '@opentelemetry/instrumentation-tedious';
import { WinstonInstrumentation } from '@opentelemetry/instrumentation-winston';
import { ElasticsearchInstrumentation } from './external/elasticsearch';
import { SequelizeInstrumentation } from './external/sequelize';
import { TypeormInstrumentation } from './external/typeorm';
import type { Instrumentation } from '@opentelemetry/instrumentation';

type InstrumentationInfo = {
  shortName: string;
  create: () => Instrumentation;
};

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
