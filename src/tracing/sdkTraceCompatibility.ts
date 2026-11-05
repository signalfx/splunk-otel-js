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

import { diag } from '@opentelemetry/api';
import { getNumberFromEnv, getStringFromEnv, merge } from '@opentelemetry/core';
import {
  AlwaysOffSampler,
  AlwaysOnSampler,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
  type BatchSpanProcessorOptions,
  type Sampler,
  type SpanExporter,
  type TracerProviderOptions,
} from '@opentelemetry/sdk-trace';
import type { NodeTracerConfig } from './types';

// Preserve the environment defaults supplied by sdk-trace-base@2.11 while
// using sdk-trace directly. sdk-trace itself does not read OTEL_* variables.
export function buildSamplerFromEnv(): Sampler {
  const sampler =
    getStringFromEnv('OTEL_TRACES_SAMPLER') ?? 'parentbased_always_on';
  switch (sampler) {
    case 'always_on':
      return new AlwaysOnSampler();
    case 'always_off':
      return new AlwaysOffSampler();
    case 'parentbased_always_off':
      return new ParentBasedSampler({ root: new AlwaysOffSampler() });
    case 'parentbased_always_on':
      return new ParentBasedSampler({ root: new AlwaysOnSampler() });
    case 'traceidratio':
      return new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv());
    case 'parentbased_traceidratio':
      return new ParentBasedSampler({
        root: new TraceIdRatioBasedSampler(getSamplerProbabilityFromEnv()),
      });
    default:
      diag.error(
        `OTEL_TRACES_SAMPLER value "${sampler}" invalid, defaulting to "parentbased_always_on".`
      );
      return new ParentBasedSampler({ root: new AlwaysOnSampler() });
  }
}

function getSamplerProbabilityFromEnv(): number {
  const probability = getNumberFromEnv('OTEL_TRACES_SAMPLER_ARG');
  if (probability == null) {
    diag.error('OTEL_TRACES_SAMPLER_ARG is blank, defaulting to 1.');
    return 1;
  }
  if (probability < 0 || probability > 1) {
    diag.error(
      `OTEL_TRACES_SAMPLER_ARG=${probability} was given, but it is out of range ([0..1]), defaulting to 1.`
    );
    return 1;
  }
  return probability;
}

export function toTracerProviderOptions(
  config: NodeTracerConfig
): TracerProviderOptions {
  const spanLimits = {
    ...config.spanLimits,
    attributeCountLimit:
      config.spanLimits?.attributeCountLimit ??
      config.generalLimits?.attributeCountLimit ??
      getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT') ??
      128,
    attributeValueLengthLimit:
      config.spanLimits?.attributeValueLengthLimit ??
      config.generalLimits?.attributeValueLengthLimit ??
      getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
      getNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
      Infinity,
  };

  const merged = merge(
    {},
    {
      sampler: buildSamplerFromEnv(),
      forceFlushTimeoutMillis: 30000,
      generalLimits: {
        attributeCountLimit:
          getNumberFromEnv('OTEL_ATTRIBUTE_COUNT_LIMIT') ?? 128,
        attributeValueLengthLimit:
          getNumberFromEnv('OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT') ?? Infinity,
      },
      spanLimits: {
        attributeCountLimit:
          getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT') ?? 128,
        attributeValueLengthLimit:
          getNumberFromEnv('OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT') ??
          Infinity,
        linkCountLimit: getNumberFromEnv('OTEL_SPAN_LINK_COUNT_LIMIT') ?? 128,
        eventCountLimit: getNumberFromEnv('OTEL_SPAN_EVENT_COUNT_LIMIT') ?? 128,
        attributePerEventCountLimit:
          getNumberFromEnv('OTEL_EVENT_ATTRIBUTE_COUNT_LIMIT') ?? 128,
        attributePerLinkCountLimit:
          getNumberFromEnv('OTEL_LINK_ATTRIBUTE_COUNT_LIMIT') ?? 128,
      },
    },
    { ...config, spanLimits }
  );

  delete merged.generalLimits;
  return merged;
}

export type LegacyBatchSpanProcessorConfig = Omit<
  BatchSpanProcessorOptions,
  'exporter'
>;

export function toBatchSpanProcessorOptions(
  exporter: SpanExporter,
  config: LegacyBatchSpanProcessorConfig = {}
): BatchSpanProcessorOptions {
  const fallbacks: [
    keyof Pick<
      LegacyBatchSpanProcessorConfig,
      | 'maxExportBatchSize'
      | 'maxQueueSize'
      | 'scheduledDelayMillis'
      | 'exportTimeoutMillis'
    >,
    string,
  ][] = [
    ['maxExportBatchSize', 'OTEL_BSP_MAX_EXPORT_BATCH_SIZE'],
    ['maxQueueSize', 'OTEL_BSP_MAX_QUEUE_SIZE'],
    ['scheduledDelayMillis', 'OTEL_BSP_SCHEDULE_DELAY'],
    ['exportTimeoutMillis', 'OTEL_BSP_EXPORT_TIMEOUT'],
  ];
  for (const [option, envVar] of fallbacks) {
    if (config[option] === undefined) {
      const value = getNumberFromEnv(envVar);
      if (value !== undefined) {
        config[option] = value;
      }
    }
  }
  return { exporter, ...config };
}
