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
  SEMATTRS_DB_NAME,
  SEMATTRS_DB_USER,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAttributesFromNeo4jSession(session: any) {
  const connectionHolder =
    (session._mode === 'WRITE'
      ? session._writeConnectionHolder
      : session._readConnectionHolder) ??
    session._connectionHolder ??
    {};
  const connectionProvider = connectionHolder._connectionProvider ?? {};

  // seedRouter is used when connecting to a url that starts with "neo4j", usually aura
  const address = connectionProvider._address ?? connectionProvider._seedRouter;
  const auth = connectionProvider._authToken;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attributes: Record<string, any> = {
    [SEMATTRS_NET_TRANSPORT]: 'IP.TCP',
    // "neo4j" is the default database name. When used, "session._database" is an empty string
    [SEMATTRS_DB_NAME]: session._database ? session._database : 'neo4j',
  };
  if (address) {
    attributes[SEMATTRS_NET_PEER_NAME] = address._host;
    attributes[SEMATTRS_NET_PEER_PORT] = address._port;
  }
  if (auth?.principal) {
    attributes[SEMATTRS_DB_USER] = auth.principal;
  }
  return attributes;
}
