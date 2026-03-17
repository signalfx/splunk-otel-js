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

import { SpanKind } from '@opentelemetry/api';
import { Sampler } from '@opentelemetry/sdk-trace-base';
import {
  createComposableAlwaysOffSampler,
  createComposableAlwaysOnSampler,
  createComposableParentThresholdSampler,
  createComposableRuleBasedSampler,
  createCompositeSampler,
  type ComposableSampler,
} from '@opentelemetry/sampler-composite';
import { ATTR_URL_PATH } from '@opentelemetry/semantic-conventions';
import { SamplingPredicate } from '@opentelemetry/sampler-composite/build/src/types';

/**
 * Deprecated but some instrumentations still default to old semantic conventions
 */
const ATTR_HTTP_TARGET = 'http.target';

function selectComposableSampler(type: string): ComposableSampler {
  switch (type) {
    case 'always_on':
      return createComposableAlwaysOnSampler();
    case 'always_off':
      return createComposableAlwaysOffSampler();
    case 'parentbased_always_on':
      return createComposableParentThresholdSampler(
        createComposableAlwaysOnSampler()
      );
    case 'parentbased_always_off':
      return createComposableParentThresholdSampler(
        createComposableAlwaysOffSampler()
      );
    default:
      throw new Error('Unsupported fallback sampler ' + type);
  }
}

/**
 * Parses OTEL_TRACES_SAMPLER_ARG for the `rules` sampler and returns a
 * composite sampler ready for use.
 *
 * Format: semicolon-separated list of key=value rules:
 *   drop=/healthcheck;fallback=parentbased_always_on
 *
 * Supported rules:
 *   drop=<value>    - drop SERVER spans whose url.path/http.target contains <value>
 *   fallback=<name> - fallback sampler; supported: always_on, parentbased_always_on
 *
 * If arg is not set, defaults to no drop rules and parentbased_always_on fallback.
 */
export function createRuleBasedSampler(
  arg: string | undefined
): Sampler {
  const dropValues: string[] = [];
  let fallback: ComposableSampler | undefined = undefined;

  if (arg && arg.trim().length > 0) {
    for (const rule of arg.split(';')) {
      const eqIndex = rule.indexOf('=');
      if (eqIndex === -1) {
        continue;
      }
      const key = rule.substring(0, eqIndex).trim();
      const value = rule.substring(eqIndex + 1).trim();

      if (key === 'drop' && value.length > 0) {
        dropValues.push(value);
      } else if (key === 'fallback') {
        fallback = selectComposableSampler(value);
      }
    }
  }

  const matchesDrops: SamplingPredicate = (_ctx, _traceId, _name, spanKind, attributes) => {
    if (spanKind !== SpanKind.SERVER) {
      return false;
    }

    const target =
      (attributes[ATTR_URL_PATH] as string | undefined) ??
      (attributes[ATTR_HTTP_TARGET] as string | undefined);
    if (typeof target !== 'string') {
      return false;
    }
    return dropValues.some((v) => target.includes(v));
  }

  return createCompositeSampler(
    createComposableRuleBasedSampler([
      [matchesDrops, createComposableAlwaysOffSampler()],
      [() => true, fallback ?? createComposableAlwaysOnSampler()],
    ])
  );
}
