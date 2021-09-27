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
const isConfigVarEntry = key => {
  const lowercased = key.toLowerCase();
  return (
    lowercased.includes('splunk_') ||
    lowercased.includes('signal_') ||
    lowercased.includes('otel_')
  );
};

/*
  Has a side-effect of deleting environment variables in the running process.
  To be used in tests to make sure:
  1. that we don't depend on the actual environment in the tests.
  2. there are no leaking setup between tests;

  An alternative would be to sinon.stub all relevant options and restore them
  between runs.
*/
export const cleanEnvironment = () => {
  Object.keys(process.env)
    .filter(isConfigVarEntry)
    .forEach(key => {
      delete process.env[key];
    });
};
