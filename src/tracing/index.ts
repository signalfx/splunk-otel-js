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

import {
  context,
  diag,
  propagation,
  ProxyTracerProvider,
  trace,
  TracerProvider,
} from '@opentelemetry/api';
import {
  NodeTracerConfig,
  NodeTracerProvider,
} from '@opentelemetry/sdk-trace-node';
import {
  Instrumentation,
  registerInstrumentations,
} from '@opentelemetry/instrumentation';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import type { StartTracingOptions, TracingOptions } from './types';
import { isProfilingContextManagerSet } from '../profiling';
import {
  isSnapshotProfilingEnabled,
  snapshotSpanProcessor,
} from './snapshots/Snapshots';
import { SnapshotPropagator } from './snapshots';
import { CompositePropagator } from '@opentelemetry/core';
import { getConfigNumber } from '../configuration';

export type { StartTracingOptions, TracingOptions };

/**
 * We disallow calling `startTracing` twice because:
 * 1. This is very rarely the user intention;
 * 2. Causes unexpected applied configuration to OTel libs;
 * 3. There's no way to reliably clean up before applying new configuration.
 */
let isStarted = false;
let tracingContextManagerEnabled = false;
let _instrumentations: Instrumentation[] = [];

let unregisterInstrumentations: (() => void) | null = null;

export function isTracingContextManagerEnabled(): boolean {
  return tracingContextManagerEnabled;
}

export function getLoadedInstrumentations() {
  return _instrumentations;
}

function setLoadedInstrumentations(
  instrumentations: (Instrumentation | Instrumentation[])[]
) {
  _instrumentations = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function storeInstrumentation(instrumentation: any) {
    if (typeof instrumentation['setMeterProvider'] === 'function') {
      _instrumentations.push(instrumentation);
    }
  }

  for (const option of instrumentations) {
    if (Array.isArray(option)) {
      for (const instrumentation of option) {
        storeInstrumentation(instrumentation);
      }
    } else {
      storeInstrumentation(option);
    }
  }
}

export function startTracing(options: TracingOptions): boolean {
  assert(!isStarted, 'Splunk APM already started');
  isStarted = true;

  let propagator = options.propagatorFactory(options);

  if (isSnapshotProfilingEnabled()) {
    propagator = new CompositePropagator({
      propagators: [
        propagator,
        new SnapshotPropagator(
          getConfigNumber(
            [
              'SPLUNK_SNAPSHOT_SELECTION_PROBABILITY',
              'SPLUNK_SNAPSHOT_SELECTION_RATE',
            ],
            0.01
          )
        ),
      ],
    });
  }
  propagation.setGlobalPropagator(propagator);

  // OpenTelemetry would log an error diagnostic when attempting to overwrite a global.
  // Once profiling has set its context manager, we should not attempt to overwrite it.
  if (!isProfilingContextManagerSet()) {
    const contextManager = new AsyncLocalStorageContextManager();
    contextManager.enable();
    context.setGlobalContextManager(contextManager);
    tracingContextManagerEnabled = true;
  }

  // Workaround for https://github.com/open-telemetry/opentelemetry-js/issues/3422
  const envTracesExporter = process.env.OTEL_TRACES_EXPORTER;
  if (envTracesExporter !== undefined) {
    process.env.OTEL_TRACES_EXPORTER = '';
  }

  let spanProcessors = options.spanProcessorFactory(options);
  if (!Array.isArray(spanProcessors)) {
    spanProcessors = [spanProcessors];
  }

  if (isSnapshotProfilingEnabled()) {
    const processor = snapshotSpanProcessor();
    if (processor !== undefined) {
      spanProcessors.push(processor);
    }
  }

  const tracerConfig: NodeTracerConfig = {
    spanProcessors,
    ...options.tracerConfig,
  };

  const provider = new NodeTracerProvider(tracerConfig);
  if (envTracesExporter !== undefined) {
    process.env.OTEL_TRACES_EXPORTER = envTracesExporter;
  }

  // instrumentations
  unregisterInstrumentations = registerInstrumentations({
    tracerProvider: provider,
    instrumentations: options.instrumentations,
  });

  setLoadedInstrumentations(options.instrumentations);

  // register global provider
  trace.setGlobalTracerProvider(provider);

  return true;
}

export async function stopTracing() {
  // in reality unregistering is not reliable because of the function pointers
  // floating around everywhere in the user code already and will lead to
  // unexpected consequences should it be done more than once. We enable it
  // mostly for tests.
  unregisterInstrumentations?.();
  unregisterInstrumentations = null;

  const shutdownPromise = shutdownGlobalTracerProvider();

  propagation.disable();
  if (tracingContextManagerEnabled) {
    context.disable();
    tracingContextManagerEnabled = false;
  }
  trace.disable();

  return shutdownPromise;
}

interface ShutDownableTracerProvider extends TracerProvider {
  shutdown: () => Promise<void>;
}

function isShutDownable(
  tracerProvider: TracerProvider
): tracerProvider is ShutDownableTracerProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof (tracerProvider as any).shutdown === 'function';
}

async function shutdownGlobalTracerProvider() {
  // `shutdown` is not in the interface of TracerProvider - not always implemented
  // Global TracerProvider isn't actually the set TracerProvider, but a proxy
  const globalProvider = trace.getTracerProvider();
  let reportedConstructor = globalProvider?.constructor;

  if (globalProvider instanceof ProxyTracerProvider) {
    const delegate = globalProvider.getDelegate();
    reportedConstructor = delegate?.constructor;

    if (isShutDownable(delegate)) {
      return delegate.shutdown().catch((e) => {
        diag.warn('OpenTelemetry: error shutting down tracer provider', e);
      });
    }
  }
  diag.warn(
    `Enabled TracerProvider(${
      reportedConstructor?.name ?? reportedConstructor
    }) does not implement shutdown()`
  );
}
