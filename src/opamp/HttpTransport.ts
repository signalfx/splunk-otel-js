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

import * as http from 'http';
import * as https from 'https';
import { context, diag } from '@opentelemetry/api';
import { suppressTracing } from '@opentelemetry/core';

export interface TransportResponse {
  statusCode: number;
  body: Uint8Array;
}

export interface Transport {
  send(data: Uint8Array): Promise<TransportResponse>;
}

export class HttpTransport implements Transport {
  private readonly _url: URL;
  private readonly _httpModule: typeof http | typeof https;
  private readonly _accessToken?: string;

  constructor(endpoint: string, accessToken?: string) {
    this._url = new URL(endpoint);
    this._httpModule = this._url.protocol === 'https:' ? https : http;
    this._accessToken = accessToken;
  }

  send(data: Uint8Array): Promise<TransportResponse> {
    return context.with(
      suppressTracing(context.active()),
      () =>
        new Promise<TransportResponse>((resolve, reject) => {
          const headers: http.OutgoingHttpHeaders = {
            'Content-Type': 'application/x-protobuf',
            'Content-Length': data.length,
          };

          if (this._accessToken) {
            headers['Authorization'] = `Bearer ${this._accessToken}`;
          }

          const req = this._httpModule.request(
            {
              hostname: this._url.hostname,
              port: this._url.port,
              path: this._url.pathname,
              method: 'POST',
              headers,
              timeout: 30_000,
            },
            (res) => {
              const chunks: Uint8Array[] = [];

              res.on('data', (chunk: Uint8Array) => {
                chunks.push(chunk);
              });

              res.on('end', () => {
                const body = Buffer.concat(chunks);
                resolve({
                  statusCode: res.statusCode ?? 0,
                  body: new Uint8Array(body),
                });
              });
            }
          );

          req.on('error', (error) => {
            diag.debug('opamp: HTTP request error', error);
            reject(error);
          });

          req.on('timeout', () => {
            req.destroy(new Error('OpAMP HTTP request timeout'));
          });

          req.write(data);
          req.end();
        })
    );
  }
}
