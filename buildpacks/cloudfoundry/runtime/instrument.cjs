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

const fs = require('node:fs');
const path = require('node:path');

const credentialAliases = new Map([
  ['realm', 'SPLUNK_REALM'],
  ['access_token', 'SPLUNK_ACCESS_TOKEN'],
  ['accessToken', 'SPLUNK_ACCESS_TOKEN'],
  ['token', 'SPLUNK_ACCESS_TOKEN'],
  ['otlp_endpoint', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
  ['otlpEndpoint', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
  ['endpoint', 'OTEL_EXPORTER_OTLP_ENDPOINT'],
]);

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function matchesServiceName(name) {
  return typeof name === 'string' && name.includes('splunk-o11y');
}

function isCredentialKey(key) {
  return /^(otel|splunk)\.[a-zA-Z0-9_.]+$/.test(key);
}

function readVcapServices(text) {
  const services = JSON.parse(text);
  if (!isRecord(services)) throw new Error('Invalid service bindings');
  return Object.values(services)
    .filter(Array.isArray)
    .flat()
    .filter(
      (service) =>
        isRecord(service) &&
        [service.name, service.instance_name, service.binding_name].some(
          matchesServiceName
        )
    )
    .map((service) => service.credentials);
}

function readOptionalFile(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

function readBindingDirectories(root) {
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    if (!entry.isDirectory() && !entry.isSymbolicLink()) return [];
    const directory = path.join(root, entry.name);
    const names = [
      entry.name,
      ...['name', 'instance-name', 'binding-name'].map((key) =>
        readOptionalFile(path.join(directory, key))
      ),
    ];
    if (!names.some(matchesServiceName)) return [];
    const credentials = Object.fromEntries(
      fs
        .readdirSync(directory)
        .filter((key) => isCredentialKey(key) || credentialAliases.has(key))
        .map((key) => [key, fs.readFileSync(path.join(directory, key), 'utf8')])
    );
    return [credentials];
  });
}

function readBindings() {
  if (process.env.VCAP_SERVICES) {
    return readVcapServices(process.env.VCAP_SERVICES);
  }
  if (process.env.VCAP_SERVICES_FILE_PATH) {
    return readVcapServices(
      fs.readFileSync(process.env.VCAP_SERVICES_FILE_PATH, 'utf8')
    );
  }
  if (process.env.SERVICE_BINDING_ROOT) {
    return readBindingDirectories(process.env.SERVICE_BINDING_ROOT);
  }
  return [];
}

function setCredential(envKey, value) {
  if (process.env[envKey] !== undefined) return;
  if (
    !['string', 'number', 'boolean'].includes(typeof value) ||
    (typeof value === 'number' && !Number.isFinite(value)) ||
    String(value).includes('\0')
  ) {
    return;
  }
  process.env[envKey] = String(value);
}

function configureFromBinding() {
  const bindings = readBindings();
  if (bindings.length > 1) {
    console.warn(
      'Splunk OpenTelemetry: Multiple splunk-o11y services are bound; skipping binding configuration. Bind a single matching service.'
    );
    return;
  }
  if (bindings.length === 0) return;
  const credentials = bindings[0];
  if (!isRecord(credentials)) throw new Error('Invalid service credentials');
  // Keep dotted credentials ahead of aliases, regardless of input key order.
  for (const [key, value] of Object.entries(credentials)) {
    if (!isCredentialKey(key)) continue;
    const envKey = key.replaceAll('.', '_').toUpperCase();
    setCredential(envKey, value);
  }
  for (const [key, envKey] of credentialAliases) {
    setCredential(envKey, credentials[key]);
  }
}

try {
  configureFromBinding();
} catch {
  // Do not include credential values, input JSON, or parser errors in logs.
  console.warn(
    'Splunk OpenTelemetry: Unable to read splunk-o11y service credentials; using explicit agent configuration.'
  );
}

if (process.env.SPLUNK_OTEL_NODEJS_ENABLED !== 'false') {
  require('../splunk-otel/instrument.js');
}
