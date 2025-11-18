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
  MeterProvider,
  propagation,
  TextMapPropagator,
  TracerProvider,
} from '@opentelemetry/api';
import { LoggerProvider } from '@opentelemetry/api-logs';
import { Resource } from '@opentelemetry/resources';

export class SDK {
  public tracerProvider?: TracerProvider;
  public meterProvider?: MeterProvider;
  public loggerProvider?: LoggerProvider;
  public propagator?: TextMapPropagator;
  public resource?: Resource;

  protected disableCallbacks: (() => void)[] = [];

  public registerGlobals() {
    if (this.propagator) {
      propagation.setGlobalPropagator(this.propagator);
      this.disableCallbacks.push(() => propagation.disable());
    }
  }

  public disable() {
    this.disableCallbacks.forEach((cb) => cb());
    this.disableCallbacks.splice(0, Infinity);
  }
}
