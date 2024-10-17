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
import type * as httpModule from 'http';
import { pickPort } from '../common';

const PORT_RANGE = [8000, 8999];

export function setupServer(): Promise<[httpModule.Server, string]> {
  const http: typeof httpModule = require('http');
  const server = http.createServer((_req, res) => {
    res.end('ok');
  });

  let port = pickPort(PORT_RANGE);
  let attempts = 0;

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      attempts++;

      if (attempts < 10) {
        setImmediate(() => {
          port = pickPort(PORT_RANGE);
          server.listen(port);
        });
      } else {
        throw err;
      }

      return;
    }

    throw err;
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      resolve([server, `http://localhost:${port}`]);
    });
  });
}

export function doRequest(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const http: typeof httpModule = require('http');
    const req = http.get(url, async () => {
      resolve();
    });
    req.on('error', reject);
    req.end();
  });
}
