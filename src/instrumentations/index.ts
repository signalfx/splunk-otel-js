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

const supportedInstrumentations: [string, string][] = [
  ['@opentelemetry/instrumentation-http', 'HttpInstrumentation'],
  ['@opentelemetry/instrumentation-dns', 'DnsInstrumentation'],
  ['@opentelemetry/instrumentation-graphql', 'GraphQLInstrumentation'],
  ['@opentelemetry/instrumentation-grpc', 'GrpcInstrumentation'],
  ['@opentelemetry/instrumentation-koa', 'KoaInstrumentation'],
  ['@opentelemetry/instrumentation-express', 'ExpressInstrumentation'],
  ['@opentelemetry/instrumentation-ioredis', 'IORedisInstrumentation'],
  ['@opentelemetry/instrumentation-mongodb', 'MongoDBInstrumentation'],
  ['@opentelemetry/instrumentation-mysql', 'MySQLInstrumentation'],
  ['@opentelemetry/instrumentation-net', 'NetInstrumentation'],
  ['@opentelemetry/instrumentation-pg', 'PgInstrumentation'],
  ['@opentelemetry/instrumentation-hapi', 'HapiInstrumentation'],
];

export function getInstrumentations(): InstrumentationOption[] {
  const result = [];

  // Defensively load all supported instrumentations
  for (const i in supportedInstrumentations) {
    const [module, name] = supportedInstrumentations[i];
    const Instrumentation = load(module, name);
    if (Instrumentation != null) {
      result.push(new Instrumentation());
    }
  }

  return result;
}
