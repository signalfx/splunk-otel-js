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

import { context, diag } from '@opentelemetry/api';
import { Resource } from '@opentelemetry/resources';
import {
  assertNoExtraneousProperties,
  defaultServiceName,
  getEnvNumber,
} from '../utils';
import { serializeHeapProfile } from './utils';
import { detect as detectResource } from '../resource';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  HeapProfile,
  ProfilingExporter,
  ProfilingExtension,
  ProfilingOptions,
  ProfilingStartOptions,
  allowedProfilingOptions,
} from './types';
import { ProfilingContextManager } from './ProfilingContextManager';
import { OTLPProfilingExporter } from './OTLPProfilingExporter';
import { DebugExporter } from './DebugExporter';
//import * as fs from 'fs/promises';

export { ProfilingOptions };

/* The following are wrappers around native functions to give more context to profiling samples. */
function extStopProfiling(extension: ProfilingExtension) {
  diag.debug('profiling: Stopping');
  return extension.stop();
}

function extStartProfiling(
  extension: ProfilingExtension,
  opts: ProfilingStartOptions
) {
  diag.debug('profiling: Starting');
  extension.start(opts);
}

function extStartMemoryProfiling(extension: ProfilingExtension) {
  return extension.startMemoryProfiling();
}

function extCollectMemorySamples(extension: ProfilingExtension): HeapProfile {
  return extension.collectMemorySamples();
}

function extCollectSamples(extension: ProfilingExtension) {
  diag.debug('profiling: Collecting samples');
  return extension.collectRaw();
}

export function defaultExporterFactory(
  options: ProfilingOptions
): ProfilingExporter[] {
  const exporters: ProfilingExporter[] = [
    new OTLPProfilingExporter({
      endpoint: options.endpoint,
      callstackInterval: options.callstackInterval,
      resource: options.resource,
    }),
  ];

  if (options.debugExport) {
    exporters.push(new DebugExporter());
  }

  return exporters;
}


let buffers = [];

function allocateMuch() {
  let t = [];
  for (let i = 0; i < 1000; i++) {
    t.push(new Buffer(4096 * 2 + (Math.random() * 4096 * 16) | 0));
  }
  return t;
}

export function startProfiling(opts: Partial<ProfilingOptions> = {}) {
  assertNoExtraneousProperties(opts, allowedProfilingOptions);

  const options = _setDefaultOptions(opts);

  const extension = loadExtension();

  if (extension === undefined) {
    return {
      stop: () => {},
    };
  }


  const contextManager = new ProfilingContextManager();
  contextManager.enable();
  context.setGlobalContextManager(contextManager);

  const exporters = options.exporterFactory(options);

  const samplingIntervalMicroseconds = options.callstackInterval * 1_000;
  const startOptions = {
    samplingIntervalMicroseconds,
    maxSampleCutoffDelayMicroseconds: samplingIntervalMicroseconds / 2,
    recordDebugInfo: options.debugExport,
  };

  extStartProfiling(extension, startOptions);
  extStartMemoryProfiling(extension);

  const cpuSamplesCollectInterval = setInterval(() => {
    const profilingData = extCollectSamples(extension);

    if (profilingData) {
      for (const exporter of exporters) {
        exporter.send(profilingData);
      }
    }
  }, options.collectionDuration);

  buffers = allocateMuch();
  console.log(buffers.length);

  //let memExportIndex = 0;
  const memSamplesCollectInterval = setInterval(async () => {
    const beginTime = process.hrtime.bigint();
    const samples = extCollectMemorySamples(extension);
    const collectTime = process.hrtime.bigint();
    //console.dir(samples, { depth: null, maxArrayLength: null });
    const processed = serializeHeapProfile(samples);
    const serializeTime = process.hrtime.bigint();
    const collectDur = Number(collectTime - beginTime) / 1e6;
    const serializeDur = Number(serializeTime - collectTime) / 1e6;
    console.log(`collect: ${collectDur.toFixed(3)}ms serialize: ${serializeDur.toFixed(3)}ms ${processed != undefined}`);

    //await fs.writeFile(`mem-${memExportIndex}.json`, JSON.stringify(samples));

    for (const exporter of exporters) {
      exporter.sendHeapProfile(samples);
    }
    //memExportIndex++;
  }, 15_000);

  cpuSamplesCollectInterval.unref();
  memSamplesCollectInterval.unref();

  return {
    stop: () => {
      clearInterval(cpuSamplesCollectInterval);
      clearInterval(memSamplesCollectInterval);
      const profilingData = extStopProfiling(extension);

      if (profilingData) {
        for (const exporter of exporters) {
          exporter.send(profilingData);
        }
      }
    },
  };
}

export function loadExtension(): ProfilingExtension | undefined {
  try {
    diag.debug('profiling: Loading');
    return require('../native_ext').profiling;
  } catch (e) {
    diag.error(
      'profiling: Unable to load extension. Profiling data will not be reported',
      e
    );
  }

  return undefined;
}

export function _setDefaultOptions(
  options: Partial<ProfilingOptions> = {}
): ProfilingOptions {
  const endpoint =
    options.endpoint ||
    process.env.SPLUNK_PROFILER_LOGS_ENDPOINT ||
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
    'http://localhost:4317';

  const combinedResource = detectResource();

  const serviceName = String(
    options.serviceName ||
      process.env.OTEL_SERVICE_NAME ||
      combinedResource.attributes[SemanticResourceAttributes.SERVICE_NAME] ||
      defaultServiceName
  );

  let resource =
    options.resource === undefined
      ? combinedResource
      : combinedResource.merge(options.resource);

  resource = resource.merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]:
        serviceName || defaultServiceName,
    })
  );

  return {
    serviceName: serviceName,
    endpoint,
    callstackInterval:
      options.callstackInterval ||
      getEnvNumber('SPLUNK_PROFILER_CALL_STACK_INTERVAL', 1000),
    collectionDuration: options.collectionDuration || 30_000,
    resource,
    debugExport: options.debugExport ?? false,
    exporterFactory: options.exporterFactory ?? defaultExporterFactory,
  };
}
