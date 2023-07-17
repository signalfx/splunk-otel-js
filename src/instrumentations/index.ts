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

const bundledInstrumentations: [string, string][] = [
  ['@opentelemetry/instrumentation-amqplib', 'AmqplibInstrumentation'],
  ['@opentelemetry/instrumentation-aws-sdk', 'AwsInstrumentation'],
  ['@opentelemetry/instrumentation-bunyan', 'BunyanInstrumentation'],
  [
    '@opentelemetry/instrumentation-cassandra-driver',
    'CassandraDriverInstrumentation',
  ],
  ['@opentelemetry/instrumentation-connect', 'ConnectInstrumentation'],
  ['@opentelemetry/instrumentation-dataloader', 'DataloaderInstrumentation'],
  ['@opentelemetry/instrumentation-dns', 'DnsInstrumentation'],
  ['@opentelemetry/instrumentation-express', 'ExpressInstrumentation'],
  ['@opentelemetry/instrumentation-fastify', 'FastifyInstrumentation'],
  ['@opentelemetry/instrumentation-generic-pool', 'GenericPoolInstrumentation'],
  ['@opentelemetry/instrumentation-graphql', 'GraphQLInstrumentation'],
  ['@opentelemetry/instrumentation-grpc', 'GrpcInstrumentation'],
  ['@opentelemetry/instrumentation-hapi', 'HapiInstrumentation'],
  ['@opentelemetry/instrumentation-http', 'HttpInstrumentation'],
  ['@opentelemetry/instrumentation-ioredis', 'IORedisInstrumentation'],
  ['@opentelemetry/instrumentation-knex', 'KnexInstrumentation'],
  ['@opentelemetry/instrumentation-koa', 'KoaInstrumentation'],
  ['@opentelemetry/instrumentation-memcached', 'MemcachedInstrumentation'],
  ['@opentelemetry/instrumentation-mongodb', 'MongoDBInstrumentation'],
  ['@opentelemetry/instrumentation-mongoose', 'MongooseInstrumentation'],
  ['@opentelemetry/instrumentation-mysql', 'MySQLInstrumentation'],
  ['@opentelemetry/instrumentation-mysql2', 'MySQL2Instrumentation'],
  ['@opentelemetry/instrumentation-nestjs-core', 'NestInstrumentation'],
  ['@opentelemetry/instrumentation-net', 'NetInstrumentation'],
  ['@opentelemetry/instrumentation-pg', 'PgInstrumentation'],
  ['@opentelemetry/instrumentation-pino', 'PinoInstrumentation'],
  ['@opentelemetry/instrumentation-redis', 'RedisInstrumentation'],
  ['@opentelemetry/instrumentation-redis-4', 'RedisInstrumentation'],
  ['@opentelemetry/instrumentation-restify', 'RestifyInstrumentation'],
  ['@opentelemetry/instrumentation-router', 'RouterInstrumentation'],
  ['@opentelemetry/instrumentation-tedious', 'TediousInstrumentation'],
  ['@opentelemetry/instrumentation-winston', 'WinstonInstrumentation'],
  ['./external/elasticsearch', 'ElasticsearchInstrumentation'],
  ['./external/kafkajs', 'KafkaJsInstrumentation'],
  ['./external/sequelize', 'SequelizeInstrumentation'],
  ['./external/typeorm', 'TypeormInstrumentation'],
];

export function getInstrumentations() {
  const result = [];

  // Defensively load all supported instrumentations
  for (const i in bundledInstrumentations) {
    const [module, name] = bundledInstrumentations[i];
    const Instrumentation = load(module, name);
    if (typeof Instrumentation === 'function') {
      result.push(new (Instrumentation as typeof Instrumentation)());
    }
  }

  return result;
}
