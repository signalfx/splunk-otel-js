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
import { Span } from '@opentelemetry/api';
import { InstrumentationConfig } from '@opentelemetry/instrumentation';

export type DbStatementSerializer = (
  operation?: string,
  params?: object,
  options?: object
) => string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ResponseHook = (span: Span, response: any) => void;

export interface ElasticsearchInstrumentationConfig
  extends InstrumentationConfig {
  /**
   * Elasticsearch operation use http/https under the hood.
   * If Elasticsearch instrumentation is enabled, an http/https operation will also create.
   * Setting the `suppressInternalInstrumentation` config value to `true` will
   * cause the instrumentation to suppress instrumentation of underlying operations,
   * effectively causing http/https spans to be non-recordable.
   */
  suppressInternalInstrumentation?: boolean;

  /** Custom serializer function for the db.statement tag */
  dbStatementSerializer?: DbStatementSerializer;

  /** hook for adding custom attributes using the response payload */
  responseHook?: ResponseHook;

  /**
   * If passed, a span attribute will be added to all spans with key of the provided "moduleVersionAttributeName"
   * and value of the module version.
   */
  moduleVersionAttributeName?: string;
}
