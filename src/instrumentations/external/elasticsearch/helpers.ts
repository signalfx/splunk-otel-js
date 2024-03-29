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
export const ELASTICSEARCH_API_FILES = [
  { path: 'index.js', operationClassName: 'client' },
  { path: 'api/async_search.js', operationClassName: 'asyncSearch' },
  { path: 'api/autoscaling.js', operationClassName: 'autoscaling' },
  { path: 'api/cat.js', operationClassName: 'cat' },
  { path: 'api/ccr.js', operationClassName: 'ccr' },
  { path: 'api/cluster.js', operationClassName: 'cluster' },
  { path: 'api/dangling_indices.js', operationClassName: 'dangling_indices' },
  { path: 'api/enrich.js', operationClassName: 'enrich' },
  { path: 'api/eql.js', operationClassName: 'eql' },
  { path: 'api/graph.js', operationClassName: 'graph' },
  { path: 'api/ilm.js', operationClassName: 'ilm' },
  { path: 'api/indices.js', operationClassName: 'indices' },
  { path: 'api/ingest.js', operationClassName: 'ingest' },
  { path: 'api/license.js', operationClassName: 'license' },
  { path: 'api/logstash.js', operationClassName: 'logstash' },
  { path: 'api/migration.js', operationClassName: 'migration' },
  { path: 'api/ml.js', operationClassName: 'ml' },
  { path: 'api/monitoring.js', operationClassName: 'monitoring' },
  { path: 'api/nodes.js', operationClassName: 'nodes' },
  { path: 'api/rollup.js', operationClassName: 'rollup' },
  {
    path: 'api/searchable_snapshots.js',
    operationClassName: 'searchable_snapshots',
  },
  { path: 'api/security.js', operationClassName: 'security' },
  { path: 'api/slm.js', operationClassName: 'slm' },
  { path: 'api/snapshot.js', operationClassName: 'snapshot' },
  { path: 'api/sql.js', operationClassName: 'sql' },
  { path: 'api/ssl.js', operationClassName: 'ssl' },
  { path: 'api/tasks.js', operationClassName: 'tasks' },
  { path: 'api/text_structure.js', operationClassName: 'text_structure' },
  { path: 'api/transform.js', operationClassName: 'transform' },
  { path: 'api/watcher.js', operationClassName: 'watcher' },
  { path: 'api/xpack.js', operationClassName: 'xpack' },
];
