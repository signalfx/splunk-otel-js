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

import { strict as assert } from 'assert';
import { after, test } from 'node:test';
import { ROOT_CONTEXT, SpanKind } from '@opentelemetry/api';
import {
  InMemorySpanExporter,
  Sampler,
  SamplingDecision,
  SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { parseOptionsAndConfigureInstrumentations } from '../../src/instrumentations';
import { createRuleBasedSampler } from '../../src/tracing/RuleBasedSampler';
import { startTracing, stopTracing } from '../../src/tracing';
import { defaultSpanProcessorFactory } from '../../src/tracing/options';
import { doRequest, setupServer } from '../uri_parameter_capture/common';

const TRACE_ID = '00000000000000000000000000000001';

function sample(sampler: Sampler, kind: SpanKind, urlPath?: string) {
  const attributes = urlPath ? { 'url.path': urlPath } : {};
  return sampler.shouldSample(ROOT_CONTEXT, TRACE_ID, 'test-span', kind, attributes, []);
}

test('RuleBasedSampler: drops SERVER span when url.path matches drop rule', () => {
  const sampler = createRuleBasedSampler('drop=/healthcheck;fallback=always_on');

  const result = sample(sampler, SpanKind.SERVER, '/healthcheck');
  assert.equal(result.decision, SamplingDecision.NOT_RECORD);

  const result2 = sample(sampler, SpanKind.SERVER, '/api/users');
  assert.equal(result2.decision, SamplingDecision.RECORD_AND_SAMPLED);
});

test('RuleBasedSampler: drops SERVER span when url.path contains drop substring', () => {
  const sampler = createRuleBasedSampler('drop=/health;fallback=always_on');

  const result = sample(sampler, SpanKind.SERVER, '/healthcheck');
  assert.equal(result.decision, SamplingDecision.NOT_RECORD);
});

test('RuleBasedSampler: does not drop non-SERVER spans even if url.path matches', () => {
  const sampler = createRuleBasedSampler('drop=/healthcheck;fallback=always_on');

  for (const kind of [SpanKind.CLIENT, SpanKind.INTERNAL, SpanKind.PRODUCER, SpanKind.CONSUMER]) {
    const result = sample(sampler, kind, '/healthcheck');
    assert.equal(
      result.decision,
      SamplingDecision.RECORD_AND_SAMPLED,
      `SpanKind ${kind} should not be dropped`
    );
  }
});

test('RuleBasedSampler: delegates to fallback when no url.path attribute present', () => {
  const sampler = createRuleBasedSampler('drop=/healthcheck;fallback=always_on');

  const result = sample(sampler, SpanKind.SERVER);
  assert.equal(result.decision, SamplingDecision.RECORD_AND_SAMPLED);
});

test('RuleBasedSampler: supports multiple drop rules', () => {
  const sampler = createRuleBasedSampler('drop=/healthcheck;drop=/metrics;drop=/ready;fallback=always_on');

  assert.equal(sample(sampler, SpanKind.SERVER, '/healthcheck').decision, SamplingDecision.NOT_RECORD);
  assert.equal(sample(sampler, SpanKind.SERVER, '/metrics').decision, SamplingDecision.NOT_RECORD);
  assert.equal(sample(sampler, SpanKind.SERVER, '/ready').decision, SamplingDecision.NOT_RECORD);
  assert.equal(sample(sampler, SpanKind.SERVER, '/foo').decision, SamplingDecision.RECORD_AND_SAMPLED);
});

test('RuleBasedSampler: defaults to always_on when arg is undefined', () => {
  const sampler = createRuleBasedSampler(undefined);

  assert.equal(sample(sampler, SpanKind.SERVER, '/foo').decision, SamplingDecision.RECORD_AND_SAMPLED);
});

test('Tracing: OTEL_TRACES_SAMPLER=rules uses composite sampler', async () => {
  process.env.OTEL_TRACES_SAMPLER = 'rules';
  process.env.OTEL_TRACES_SAMPLER_ARG =
    'drop=/healthcheck;drop=/ready;fallback=parentbased_always_on';

  const exporter = new InMemorySpanExporter();
  let spanProcessor: SpanProcessor;
  const [server, url] = await setupServer();

  after(async () => {
    server.close();
    await stopTracing();

    delete process.env.OTEL_TRACES_SAMPLER;
    delete process.env.OTEL_TRACES_SAMPLER_ARG;
  });

  const { tracingOptions } = parseOptionsAndConfigureInstrumentations({
    tracing: {
      spanExporterFactory: () => exporter,
      spanProcessorFactory: (options) => {
        return ([spanProcessor] = defaultSpanProcessorFactory(options));
      },
    },
  });

  startTracing(tracingOptions);

  await Promise.all([
    doRequest(`${url}/healthcheck`),
    doRequest(`${url}/foo`),
    doRequest(`${url}/ready`),
  ]);

  await spanProcessor!.forceFlush();
  const spans = exporter.getFinishedSpans();

  assert.equal(spans.length, 1);
  assert.equal(spans[0].attributes['http.target'], '/foo');
});
