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

import {
  Context,
  trace,
  TextMapPropagator,
  TextMapGetter,
  TextMapSetter,
  propagation,
} from '@opentelemetry/api';
import {
  SamplingDecision,
  TraceIdRatioBasedSampler,
} from '@opentelemetry/sdk-trace-base';

export const VOLUME_BAGGAGE_KEY = 'splunk.trace.snapshot.volume' as const;

function withVolumeBaggage(context: Context, isSelected: boolean) {
  let baggage = propagation.getBaggage(context);

  const entry = { value: isSelected ? 'highest' : 'off' };
  if (baggage === undefined) {
    baggage = propagation.createBaggage({
      [VOLUME_BAGGAGE_KEY]: entry,
    });
  } else {
    baggage = baggage.setEntry(VOLUME_BAGGAGE_KEY, entry);
  }

  return propagation.setBaggage(context, baggage);
}

function normalizeRate(rate: number): number {
  return Math.min(1.0, Math.max(rate, 0.0));
}

export class SnapshotPropagator implements TextMapPropagator<unknown> {
  selectionRate: number;
  sampler: TraceIdRatioBasedSampler;

  constructor(selectionRate: number) {
    this.selectionRate = normalizeRate(selectionRate);
    this.sampler = new TraceIdRatioBasedSampler(this.selectionRate);
  }

  inject(
    _context: Context,
    _carrier: unknown,
    _setter: TextMapSetter<unknown>
  ): void {}

  extract(
    context: Context,
    _carrier: unknown,
    _getter: TextMapGetter<unknown>
  ): Context {
    const baggage = propagation.getBaggage(context);

    if (baggage === undefined) {
      return this.attachVolumeBaggage(context);
    }

    const volumeFromBaggage = baggage.getEntry(VOLUME_BAGGAGE_KEY)?.value;

    if (volumeFromBaggage === 'highest' || volumeFromBaggage === 'off') {
      return context;
    }

    return this.attachVolumeBaggage(context);
  }

  fields(): string[] {
    return [];
  }

  attachVolumeBaggage(context: Context): Context {
    const span = trace.getSpan(context);

    if (span === undefined) {
      // We have no trace ID, so we can't use TraceIdRatioBasedSampler.
      const isSelected = Math.random() < this.selectionRate;
      return withVolumeBaggage(context, isSelected);
    }

    const decision = this.sampler.shouldSample(
      context,
      span.spanContext().traceId
    ).decision;
    return withVolumeBaggage(
      context,
      decision === SamplingDecision.RECORD_AND_SAMPLED
    );
  }
}
