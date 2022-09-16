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

import type {
  RedisInstrumentation,
  RedisInstrumentationConfig,
} from '@opentelemetry/instrumentation-redis';
import { getEnvBoolean } from '../utils';
import { Options } from '../tracing/options';

export function configureRedisInstrumentation(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instrumentation: any,
  _options: Options
) {
  const redisInstrumentation = instrumentation as RedisInstrumentation;
  if (getEnvBoolean('SPLUNK_REDIS_INCLUDE_COMMAND_ARGS', false)) {
    const config =
      redisInstrumentation.getConfig() as RedisInstrumentationConfig;
    redisInstrumentation.setConfig({
      ...config,
      dbStatementSerializer: (cmd, args) => {
        if (args.length === 0) return cmd;

        const sanitizedArgs = args.map((arg) => {
          if (Buffer.isBuffer(arg)) {
            return `buffer(${arg.length})`;
          }

          return arg;
        });

        return `${cmd} ${sanitizedArgs.join(' ')}`;
      },
    });
  }
}
