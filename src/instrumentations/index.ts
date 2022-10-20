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

import { AmqplibInstrumentation } from '@opentelemetry/instrumentation-amqplib';
import { AwsLambdaInstrumentation } from '@opentelemetry/instrumentation-aws-lambda';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { BunyanInstrumentation } from '@opentelemetry/instrumentation-bunyan';
import { CassandraDriverInstrumentation } from '@opentelemetry/instrumentation-cassandra-driver';
import { ConnectInstrumentation } from '@opentelemetry/instrumentation-connect';
import { DataloaderInstrumentation } from '@opentelemetry/instrumentation-dataloader';
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';
import { FsInstrumentation } from '@opentelemetry/instrumentation-fs';
import { GenericPoolInstrumentation } from '@opentelemetry/instrumentation-generic-pool';
import { GraphQLInstrumentation } from '@opentelemetry/instrumentation-graphql';
import { GrpcInstrumentation } from '@opentelemetry/instrumentation-grpc';
import { HapiInstrumentation } from '@opentelemetry/instrumentation-hapi';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex';
import { KoaInstrumentation } from '@opentelemetry/instrumentation-koa';
import { MemcachedInstrumentation } from '@opentelemetry/instrumentation-memcached';
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
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
import { ElasticsearchInstrumentation } from 'opentelemetry-instrumentation-elasticsearch';
import { KafkaJsInstrumentation } from 'opentelemetry-instrumentation-kafkajs';
import { MongooseInstrumentation } from 'opentelemetry-instrumentation-mongoose';
import { SequelizeInstrumentation } from 'opentelemetry-instrumentation-sequelize';
import { TypeormInstrumentation } from 'opentelemetry-instrumentation-typeorm';

export function getInstrumentations() {
  return [
    new AmqplibInstrumentation(),
    new AwsLambdaInstrumentation(),
    new AwsInstrumentation(),
    new BunyanInstrumentation(),
    new CassandraDriverInstrumentation(),
    new ConnectInstrumentation(),
    new DataloaderInstrumentation(),
    new DnsInstrumentation(),
    new ExpressInstrumentation(),
    new FastifyInstrumentation(),
    new FsInstrumentation(),
    new GenericPoolInstrumentation(),
    new GraphQLInstrumentation(),
    new GrpcInstrumentation(),
    new HapiInstrumentation(),
    new HttpInstrumentation(),
    new IORedisInstrumentation(),
    new KnexInstrumentation(),
    new KoaInstrumentation(),
    new MemcachedInstrumentation(),
    new MongoDBInstrumentation(),
    new MySQLInstrumentation(),
    new MySQL2Instrumentation(),
    new NestInstrumentation(),
    new NetInstrumentation(),
    new PgInstrumentation(),
    new PinoInstrumentation(),
    new RedisInstrumentation(),
    new Redis4Instrumentation(),
    new RestifyInstrumentation(),
    new RouterInstrumentation(),
    new TediousInstrumentation(),
    new WinstonInstrumentation(),
    new ElasticsearchInstrumentation(),
    new KafkaJsInstrumentation(),
    new MongooseInstrumentation(),
    new SequelizeInstrumentation(),
    new TypeormInstrumentation(),
  ];
}
