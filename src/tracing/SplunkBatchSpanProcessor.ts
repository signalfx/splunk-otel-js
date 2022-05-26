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
import { context, Context, propagation } from '@opentelemetry/api';
import { Span } from '@opentelemetry/sdk-trace-base';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

export const SYNTHETIC_RUN_ID_FIELD = 'Synthetics-RunId';

export class SplunkBatchSpanProcessor extends BatchSpanProcessor {
  onStart(_span: Span, parentContext: Context = context.active()) {
    super.onStart(_span, parentContext);

    const syntheticsId = propagation
      .getBaggage(parentContext)
      ?.getEntry(SYNTHETIC_RUN_ID_FIELD)?.value;
    if ((syntheticsId?.length ?? 0) > 0) {
      _span.setAttribute(SYNTHETIC_RUN_ID_FIELD, syntheticsId);
    }
  }
}
