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

import { InstrumentationOption } from '@opentelemetry/instrumentation';

import { load } from './loader';

// please keep the list sorted alphabetically
// please update ../../README.md#default-instrumentation-packages when changing this list
// please check if ../../MIGRATING.md#known-limitations needs to be updated when changing this list
const supportedInstrumentations: [string, string][] = [
  ['@opentelemetry/instrumentation-bunyan', 'BunyanInstrumentation'],
  [
    '@opentelemetry/instrumentation-cassandra-driver',
    'CassandraDriverInstrumentation',
  ],
  ['@opentelemetry/instrumentation-dns', 'DnsInstrumentation'],
  ['@opentelemetry/instrumentation-express', 'ExpressInstrumentation'],
  ['@opentelemetry/instrumentation-graphql', 'GraphQLInstrumentation'],
  ['@opentelemetry/instrumentation-grpc', 'GrpcInstrumentation'],
  ['@opentelemetry/instrumentation-hapi', 'HapiInstrumentation'],
  ['@opentelemetry/instrumentation-http', 'HttpInstrumentation'],
  ['@opentelemetry/instrumentation-ioredis', 'IORedisInstrumentation'],
  ['@opentelemetry/instrumentation-knex', 'KnexInstrumentation'],
  ['@opentelemetry/instrumentation-koa', 'KoaInstrumentation'],
  ['@opentelemetry/instrumentation-memcached', 'MemcachedInstrumentation'],
  ['@opentelemetry/instrumentation-mongodb', 'MongoDBInstrumentation'],
  ['@opentelemetry/instrumentation-mysql', 'MySQLInstrumentation'],
  ['@opentelemetry/instrumentation-mysql2', 'MySQL2Instrumentation'],
  ['@opentelemetry/instrumentation-net', 'NetInstrumentation'],
  ['@opentelemetry/instrumentation-pg', 'PgInstrumentation'],
  ['@opentelemetry/instrumentation-pino', 'PinoInstrumentation'],
  ['@opentelemetry/instrumentation-redis', 'RedisInstrumentation'],
  ['@opentelemetry/instrumentation-restify', 'RestifyInstrumentation'],
  ['@opentelemetry/instrumentation-winston', 'WinstonInstrumentation'],
  ['opentelemetry-instrumentation-amqplib', 'AmqplibInstrumentation'],
  ['opentelemetry-instrumentation-aws-sdk', 'AwsInstrumentation'],
  [
    'opentelemetry-instrumentation-elasticsearch',
    'ElasticsearchInstrumentation',
  ],
  ['opentelemetry-instrumentation-kafkajs', 'KafkaJsInstrumentation'],
  ['opentelemetry-instrumentation-mongoose', 'MongooseInstrumentation'],
  ['opentelemetry-instrumentation-sequelize', 'SequelizeInstrumentation'],
  ['opentelemetry-instrumentation-typeorm', 'TypeormInstrumentation'],
];

export function getInstrumentations(): InstrumentationOption[] {
  const result = [];

  // Defensively load all supported instrumentations
  for (const i in supportedInstrumentations) {
    const [module, name] = supportedInstrumentations[i];
    const Instrumentation = load(module, name);
    if (typeof Instrumentation === 'function') {
      result.push(new (Instrumentation as typeof Instrumentation)());
    }
  }

  return result;
}
