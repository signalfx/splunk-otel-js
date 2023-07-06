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
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import {
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Instrumentation } from '@opentelemetry/instrumentation';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const exporter = new InMemorySpanExporter();
const provider: NodeTracerProvider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'instrumentations-test',
  }),
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

let instrumentation: Instrumentation | undefined = undefined;

export function getTestSpans() {
  return exporter.getFinishedSpans();
}

export function setInstrumentation(instr: Instrumentation) {
  instr.setTracerProvider(provider);
  instrumentation = instr;
}

export const mochaHooks = {
  beforeAll(done: Function) {
    provider.register();
    done();
  },
  beforeEach(done: Function) {
    exporter.reset();
    instrumentation?.setConfig({});
    done();
  },
};
