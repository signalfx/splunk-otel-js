/*
 * Copyright Splunk Inc., The OpenTelemetry Authors
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
  Attributes,
  SpanStatusCode,
  Span,
  context,
  DiagLogger,
  AttributeValue,
} from '@opentelemetry/api';
import {
  ATTR_CLIENT_ADDRESS,
  ATTR_ERROR_TYPE,
  ATTR_HTTP_REQUEST_METHOD,
  ATTR_HTTP_REQUEST_METHOD_ORIGINAL,
  ATTR_HTTP_RESPONSE_STATUS_CODE,
  ATTR_HTTP_ROUTE,
  ATTR_NETWORK_PEER_ADDRESS,
  ATTR_NETWORK_PEER_PORT,
  ATTR_NETWORK_PROTOCOL_VERSION,
  ATTR_SERVER_ADDRESS,
  ATTR_SERVER_PORT,
  ATTR_URL_FULL,
  ATTR_URL_PATH,
  ATTR_URL_SCHEME,
  ATTR_USER_AGENT_ORIGINAL,
  NETTRANSPORTVALUES_IP_TCP,
  NETTRANSPORTVALUES_IP_UDP,
  SEMATTRS_HTTP_CLIENT_IP,
  SEMATTRS_HTTP_FLAVOR,
  SEMATTRS_HTTP_HOST,
  SEMATTRS_HTTP_METHOD,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH,
  SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED,
  SEMATTRS_HTTP_ROUTE,
  SEMATTRS_HTTP_SCHEME,
  SEMATTRS_HTTP_SERVER_NAME,
  SEMATTRS_HTTP_STATUS_CODE,
  SEMATTRS_HTTP_TARGET,
  SEMATTRS_HTTP_URL,
  SEMATTRS_HTTP_USER_AGENT,
  SEMATTRS_NET_HOST_IP,
  SEMATTRS_NET_HOST_NAME,
  SEMATTRS_NET_HOST_PORT,
  SEMATTRS_NET_PEER_IP,
  SEMATTRS_NET_PEER_PORT,
  SEMATTRS_NET_PEER_NAME,
  SEMATTRS_NET_TRANSPORT,
} from '@opentelemetry/semantic-conventions';
import {
  ClientRequest,
  IncomingHttpHeaders,
  IncomingMessage,
  OutgoingHttpHeader,
  OutgoingHttpHeaders,
  ServerResponse,
} from 'http';
import { getRPCMetadata, RPCType } from '@opentelemetry/core';
import {
  DEFAULT_QUERY_STRINGS_TO_REDACT,
  Err,
  STR_REDACTED,
  SYNTHETIC_BOT_NAMES,
  SYNTHETIC_TEST_NAMES,
} from './internal-types';
import forwardedParse = require('forwarded-parse');
import {
  HTTP_STATUS_TEXT,
  HTTP_ERROR_NAME,
  HTTP_ERROR_MESSAGE,
  ATTR_HTTP_SCHEME,
  ATTR_HTTP_METHOD,
  ATTR_NET_HOST_NAME,
  ATTR_HTTP_FLAVOR,
  ATTR_HTTP_STATUS_CODE,
  ATTR_NET_HOST_PORT,
  ATTR_USER_AGENT_SYNTHETIC_TYPE,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST,
  USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT,
  ATTR_NET_PEER_NAME,
  ATTR_NET_PEER_PORT,
} from './semconv';
import { SemconvStability } from '@opentelemetry/instrumentation';

/**
 * Get an absolute url
 */
export function getAbsoluteUrl(
  req: ClientRequest,
  redactedQueryParams: string[] = Array.from(DEFAULT_QUERY_STRINGS_TO_REDACT)
): string {
  const port = req.socket?.remotePort;
  let path = req.path || '/';

  const isDefaultPort = port === 80 || port === 443;

  if (path.includes('?')) {
    const [pathname, query] = path.split('?', 2);
    const searchParams = new URLSearchParams(query);
    const sensitiveParamsToRedact: string[] = redactedQueryParams || [];
    for (const sensitiveParam of sensitiveParamsToRedact) {
      if (
        searchParams.has(sensitiveParam) &&
        searchParams.get(sensitiveParam) !== ''
      ) {
        searchParams.set(sensitiveParam, STR_REDACTED);
      }
    }
    const redactedQuery = searchParams.toString();
    path = `${pathname}?${redactedQuery}`;
  }
  const base = `${req.protocol}//${req.host}`;
  return isDefaultPort ? `${base}${path}` : `${base}:${port}${path}`;
}

/**
 * Parse status code from HTTP response. [More details](https://github.com/open-telemetry/opentelemetry-specification/blob/master/specification/data-http.md#status)
 */
export function parseResponseStatus(
  upperBound: number,
  statusCode?: number
): SpanStatusCode {
  // 1xx, 2xx, 3xx are OK on client and server
  // 4xx is OK on server
  if (statusCode && statusCode >= 100 && statusCode < upperBound) {
    return SpanStatusCode.UNSET;
  }

  // All other codes are error
  return SpanStatusCode.ERROR;
}

/**
 * Sets the span with the error passed in params
 * @param {Span} span the span that need to be set
 * @param {Error} error error that will be set to span
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */
export const setSpanWithError = (
  span: Span,
  error: Err,
  semconvStability: SemconvStability
): void => {
  const message = error.message;

  if ((semconvStability & SemconvStability.OLD) === SemconvStability.OLD) {
    span.setAttribute(HTTP_ERROR_NAME, error.name);
    span.setAttribute(HTTP_ERROR_MESSAGE, message);
  }

  if (
    (semconvStability & SemconvStability.STABLE) ===
    SemconvStability.STABLE
  ) {
    span.setAttribute(ATTR_ERROR_TYPE, error.name);
  }

  span.setStatus({ code: SpanStatusCode.ERROR, message });
  span.recordException(error);
};

/**
 * Adds attributes for request content-length and content-encoding HTTP headers
 * @param { IncomingMessage } Request object whose headers will be analyzed
 * @param { Attributes } Attributes object to be modified
 */
export const setRequestContentLengthAttribute = (
  request: IncomingMessage,
  attributes: Attributes
): void => {
  const length = getContentLength(request.headers);
  if (length === null) return;

  if (isCompressed(request.headers)) {
    attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH] = length;
  } else {
    attributes[SEMATTRS_HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED] = length;
  }
};

function getContentLength(
  headers: OutgoingHttpHeaders | IncomingHttpHeaders
): number | null {
  const contentLengthHeader = headers['content-length'];
  if (contentLengthHeader === undefined) return null;

  const contentLength = parseInt(contentLengthHeader as string, 10);
  if (isNaN(contentLength)) return null;

  return contentLength;
}

export const isCompressed = (
  headers: OutgoingHttpHeaders | IncomingHttpHeaders
): boolean => {
  const encoding = headers['content-encoding'];

  return !!encoding && encoding !== 'identity';
};

/**
 * Returns attributes related to the kind of HTTP protocol used
 * @param {string} [kind] Kind of HTTP protocol used: "1.0", "1.1", "2", "SPDY" or "QUIC".
 */
export const setAttributesFromHttpKind = (
  kind: string | undefined,
  attributes: Attributes
): void => {
  if (kind) {
    attributes[SEMATTRS_HTTP_FLAVOR] = kind;
    if (kind.toUpperCase() !== 'QUIC') {
      attributes[SEMATTRS_NET_TRANSPORT] = NETTRANSPORTVALUES_IP_TCP;
    } else {
      attributes[SEMATTRS_NET_TRANSPORT] = NETTRANSPORTVALUES_IP_UDP;
    }
  }
};

function getOutgoingRequestAttributesOnResponseOldSemconv(
  request: ClientRequest,
  response: IncomingMessage,
  redactedQueryParams: string[] | undefined
): Attributes {
  const socket = response.socket;

  const attributes: Attributes = {
    [SEMATTRS_HTTP_URL]: getAbsoluteUrl(request, redactedQueryParams),
    [SEMATTRS_NET_PEER_IP]: socket.remoteAddress,
    [SEMATTRS_NET_PEER_PORT]: socket.remotePort,
    [SEMATTRS_HTTP_STATUS_CODE]: response.statusCode,
    [HTTP_STATUS_TEXT]: response.statusMessage || '',
    [SEMATTRS_HTTP_FLAVOR]: response.httpVersion,
    [SEMATTRS_NET_TRANSPORT]: NETTRANSPORTVALUES_IP_TCP,
  };

  const length = getContentLength(response.headers);

  if (length === null) {
    return attributes;
  }

  if (isCompressed(response.headers)) {
    attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH] = length;
  } else {
    attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED] = length;
  }

  return attributes;
}

function getOutgoingRequestAttributesOnResponseNewSemconv(
  request: ClientRequest,
  response: IncomingMessage,
  redactedQueryParams: string[] | undefined
): Attributes {
  const socket = response.socket;
  return {
    [ATTR_URL_FULL]: getAbsoluteUrl(request, redactedQueryParams),
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: response.statusCode,
    [ATTR_NETWORK_PEER_ADDRESS]: socket.remoteAddress,
    [ATTR_NETWORK_PEER_PORT]: socket.remotePort,
    [ATTR_NETWORK_PROTOCOL_VERSION]: response.httpVersion,
  };
}

/**
 * Returns outgoing request attributes scoped to the response data
 * @param {IncomingMessage} response the response object
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */
export const getOutgoingRequestAttributesOnResponse = (
  request: ClientRequest,
  response: IncomingMessage,
  semconvStability: SemconvStability,
  redactedQueryParams: string[] | undefined
): Attributes => {
  if (semconvStability === SemconvStability.OLD) {
    return getOutgoingRequestAttributesOnResponseOldSemconv(
      request,
      response,
      redactedQueryParams
    );
  }

  if (semconvStability === SemconvStability.STABLE) {
    return getOutgoingRequestAttributesOnResponseNewSemconv(
      request,
      response,
      redactedQueryParams
    );
  }

  const oldAttributes = getOutgoingRequestAttributesOnResponseOldSemconv(
    request,
    response,
    redactedQueryParams
  );
  const newAttributes = getOutgoingRequestAttributesOnResponseNewSemconv(
    request,
    response,
    redactedQueryParams
  );
  return Object.assign(oldAttributes, newAttributes);
};

function getOutgoingRequestAttributesOldSemconv(
  request: ClientRequest,
  redactedQueryParams: string[] | undefined
): Attributes {
  const userAgent = request.getHeader('user-agent');
  const hostHeader = request.getHeader('host');

  return {
    [SEMATTRS_HTTP_METHOD]: request.method,
    [SEMATTRS_HTTP_TARGET]: request.path || '/',
    [SEMATTRS_NET_PEER_NAME]: request.host,
    [SEMATTRS_HTTP_HOST]: hostHeader,
    [SEMATTRS_HTTP_USER_AGENT]: userAgent,
    [SEMATTRS_HTTP_URL]: getAbsoluteUrl(request, redactedQueryParams),
  };
}

function getOutgoingRequestAttributesNewSemconv(
  request: ClientRequest,
  enableSyntheticSourceDetection: boolean,
  redactedQueryParams: string[] | undefined
): Attributes {
  let port: number | undefined;
  const userAgent = request.getHeader('user-agent');
  const hostHeader = request.getHeader('host');
  if (typeof hostHeader === 'string') {
    const portString = hostHeader.substring(hostHeader.indexOf(':') + 1);
    port = Number(portString);
  }
  const method = request.method ?? 'GET';
  const normalizedMethod = normalizeMethod(method);
  const attributes: Attributes = {};
  Object.assign(attributes, {
    // Required attributes
    [ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
    [ATTR_SERVER_ADDRESS]: request.host,
    [ATTR_SERVER_PORT]: port,
    [ATTR_URL_FULL]: getAbsoluteUrl(request, redactedQueryParams),
    [ATTR_USER_AGENT_ORIGINAL]: userAgent,
    //[ATTR_URL_FULL]: `${request.protocol}//${request.host}${request.path}`,
    // leaving out protocol version, it is not yet negotiated
    // leaving out protocol name, it is only required when protocol version is set
    // retries and redirects not supported

    // Opt-in attributes left off for now
  });
  // conditionally required if request method required case normalization
  if (method !== normalizedMethod) {
    attributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
  }
  if (enableSyntheticSourceDetection && userAgent) {
    attributes[ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
  }
  return attributes;
}

export function getOutgoingRequestAttributes(
  request: ClientRequest,
  semconvStability: SemconvStability,
  redactedQueryParams: string[] | undefined,
  enableSyntheticSourceDetection: boolean
): Attributes {
  if (semconvStability === SemconvStability.OLD) {
    return getOutgoingRequestAttributesOldSemconv(request, redactedQueryParams);
  }

  if (semconvStability === SemconvStability.STABLE) {
    return getOutgoingRequestAttributesNewSemconv(
      request,
      enableSyntheticSourceDetection,
      redactedQueryParams
    );
  }

  return Object.assign(
    getOutgoingRequestAttributesOldSemconv(request, redactedQueryParams),
    getOutgoingRequestAttributesNewSemconv(
      request,
      enableSyntheticSourceDetection,
      redactedQueryParams
    )
  );
}

function parseHostHeader(
  hostHeader: string,
  proto?: string
): { host: string; port?: string } {
  const notIPv6 = !hostHeader.startsWith('[');

  if (notIPv6) {
    const firstColonIndex = hostHeader.indexOf(':');
    // no semicolon implies ipv4 dotted syntax or host name without port
    // x.x.x.x
    // example.com
    if (firstColonIndex === -1) {
      if (proto === 'http') {
        return { host: hostHeader, port: '80' };
      }

      if (proto === 'https') {
        return { host: hostHeader, port: '443' };
      }

      return { host: hostHeader };
    }

    const secondColonIndex = hostHeader.indexOf(':', firstColonIndex + 1);
    // single semicolon implies ipv4 dotted syntax or host name with port
    // x.x.x.x:yyyy
    // example.com:yyyy
    if (secondColonIndex === -1) {
      return {
        host: hostHeader.substring(0, firstColonIndex),
        port: hostHeader.substring(firstColonIndex + 1),
      };
    }

    // if nothing above matches just return the host header
    return { host: hostHeader };
  }

  // more than 2 parts implies ipv6 syntax with multiple colons
  // [x:x:x:x:x:x:x:x]
  // [x:x:x:x:x:x:x:x]:yyyy
  const parts = hostHeader.split(':');
  if (parts[parts.length - 1].endsWith(']')) {
    if (proto === 'http') {
      return { host: hostHeader, port: '80' };
    }

    if (proto === 'https') {
      return { host: hostHeader, port: '443' };
    }
  } else if (parts[parts.length - 2].endsWith(']')) {
    return {
      host: parts.slice(0, -1).join(':'),
      port: parts[parts.length - 1],
    };
  }

  return { host: hostHeader };
}

/**
 * Get server.address and port according to http semconv 1.27
 * https://github.com/open-telemetry/semantic-conventions/blob/bf0a2c1134f206f034408b201dbec37960ed60ec/docs/http/http-spans.md#setting-serveraddress-and-serverport-attributes
 */
function getServerAddress(
  request: IncomingMessage,
  component: 'http' | 'https'
): { host: string; port?: string } | null {
  const forwardedHeader = request.headers['forwarded'];
  if (forwardedHeader) {
    for (const entry of parseForwardedHeader(forwardedHeader)) {
      if (entry.host) {
        return parseHostHeader(entry.host, entry.proto);
      }
    }
  }

  const xForwardedHost = request.headers['x-forwarded-host'];
  if (typeof xForwardedHost === 'string') {
    if (typeof request.headers['x-forwarded-proto'] === 'string') {
      return parseHostHeader(
        xForwardedHost,
        request.headers['x-forwarded-proto']
      );
    }

    if (Array.isArray(request.headers['x-forwarded-proto'])) {
      return parseHostHeader(
        xForwardedHost,
        request.headers['x-forwarded-proto'][0]
      );
    }

    return parseHostHeader(xForwardedHost);
  } else if (
    Array.isArray(xForwardedHost) &&
    typeof xForwardedHost[0] === 'string' &&
    xForwardedHost[0].length > 0
  ) {
    if (typeof request.headers['x-forwarded-proto'] === 'string') {
      return parseHostHeader(
        xForwardedHost[0],
        request.headers['x-forwarded-proto']
      );
    }

    if (Array.isArray(request.headers['x-forwarded-proto'])) {
      return parseHostHeader(
        xForwardedHost[0],
        request.headers['x-forwarded-proto'][0]
      );
    }

    return parseHostHeader(xForwardedHost[0]);
  }

  const host = request.headers['host'];
  if (typeof host === 'string' && host.length > 0) {
    return parseHostHeader(host, component);
  }

  return null;
}

/**
 * Get server.address and port according to http semconv 1.27
 * https://github.com/open-telemetry/semantic-conventions/blob/bf0a2c1134f206f034408b201dbec37960ed60ec/docs/http/http-spans.md#setting-serveraddress-and-serverport-attributes
 */
export function getRemoteClientAddress(
  request: IncomingMessage
): string | null {
  const forwardedHeader = request.headers['forwarded'];
  if (forwardedHeader) {
    for (const entry of parseForwardedHeader(forwardedHeader)) {
      if (entry.for) {
        return entry.for;
      }
    }
  }

  const xForwardedFor = request.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor;
  } else if (Array.isArray(xForwardedFor)) {
    return xForwardedFor[0];
  }

  const remote = request.socket.remoteAddress;
  if (remote) {
    return remote;
  }

  return null;
}

function getInfoFromIncomingMessage(
  component: 'http' | 'https',
  request: IncomingMessage,
  logger: DiagLogger
): { pathname?: string; search?: string; toString: () => string } {
  try {
    const host = request.headers.host;
    if (host) {
      return new URL(request.url ?? '/', `${component}://${host}`);
    } else {
      const unsafeParsedUrl = new URL(
        request.url ?? '/',
        // using localhost as a workaround to still use the URL constructor for parsing
        `${component}://localhost`
      );
      // since we use localhost as a workaround, ensure we hide the rest of the properties to avoid
      // our workaround leaking though.
      return {
        pathname: unsafeParsedUrl.pathname,
        search: unsafeParsedUrl.search,
        toString: function () {
          // we cannot use the result of unsafeParsedUrl.toString as it's potentially wrong.
          return unsafeParsedUrl.pathname + unsafeParsedUrl.search;
        },
      };
    }
  } catch (e) {
    // something is wrong, use undefined - this *should* never happen, logging
    // for troubleshooting in case it does happen.
    logger.verbose('Unable to get URL from request', e);
    return {};
  }
}

/**
 * Returns incoming request attributes scoped to the request data
 * @param {IncomingMessage} request the request object
 * @param {{ component: string, serverName?: string, hookAttributes?: Attributes }} options used to pass data needed to create attributes
 * @param {SemconvStability} semconvStability determines which semconv version to use
 */
export const getIncomingRequestAttributes = (
  request: IncomingMessage,
  options: {
    serverName?: string;
    hookAttributes?: Attributes;
    semconvStability: SemconvStability;
    enableSyntheticSourceDetection: boolean;
  },
  logger: DiagLogger
): Attributes => {
  const headers = request.headers;
  const userAgent = headers['user-agent'];
  const ips = headers['x-forwarded-for'];
  const httpVersion = request.httpVersion;
  const host = headers.host || 'localhost';

  const hostnameEnd = host.lastIndexOf(':');
  const hostname = hostnameEnd >= 0 ? host.substring(0, hostnameEnd) : host;

  const method = request.method;
  const normalizedMethod = normalizeMethod(method);

  const scheme =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (request.socket as any)['encrypted'] === true ? 'https' : 'http';
  const serverAddress = getServerAddress(request, scheme);
  const serverName = options.serverName;

  const remoteClientAddress = getRemoteClientAddress(request);

  const newAttributes: Attributes = {
    [ATTR_HTTP_REQUEST_METHOD]: normalizedMethod,
    [ATTR_URL_SCHEME]: scheme,
    [ATTR_SERVER_ADDRESS]: serverAddress?.host,
    [ATTR_NETWORK_PEER_ADDRESS]: request.socket.remoteAddress,
    [ATTR_NETWORK_PEER_PORT]: request.socket.remotePort,
    [ATTR_NETWORK_PROTOCOL_VERSION]: request.httpVersion,
    [ATTR_USER_AGENT_ORIGINAL]: userAgent,
  };

  const parsedUrl = getInfoFromIncomingMessage(scheme, request, logger);

  if (parsedUrl?.pathname !== null) {
    newAttributes[ATTR_URL_PATH] = parsedUrl.pathname;
  }

  if (remoteClientAddress !== null) {
    newAttributes[ATTR_CLIENT_ADDRESS] = remoteClientAddress;
  }

  if (serverAddress && serverAddress.port !== null) {
    newAttributes[ATTR_SERVER_PORT] = Number(serverAddress.port);
  }

  // conditionally required if request method required case normalization
  if (method !== normalizedMethod) {
    newAttributes[ATTR_HTTP_REQUEST_METHOD_ORIGINAL] = method;
  }
  if (options.enableSyntheticSourceDetection && userAgent) {
    newAttributes[ATTR_USER_AGENT_SYNTHETIC_TYPE] = getSyntheticType(userAgent);
  }
  const oldAttributes: Attributes = {
    [SEMATTRS_HTTP_URL]: parsedUrl.toString(),
    [SEMATTRS_HTTP_HOST]: host,
    [SEMATTRS_NET_HOST_NAME]: hostname,
    [SEMATTRS_HTTP_METHOD]: method,
    [SEMATTRS_HTTP_SCHEME]: scheme,
  };

  if (typeof ips === 'string') {
    oldAttributes[SEMATTRS_HTTP_CLIENT_IP] = ips.split(',')[0];
  }

  if (typeof serverName === 'string') {
    oldAttributes[SEMATTRS_HTTP_SERVER_NAME] = serverName;
  }

  if (parsedUrl?.pathname) {
    oldAttributes[SEMATTRS_HTTP_TARGET] =
      parsedUrl?.pathname + parsedUrl?.search || '/';
  }

  if (userAgent !== undefined) {
    oldAttributes[SEMATTRS_HTTP_USER_AGENT] = userAgent;
  }
  setRequestContentLengthAttribute(request, oldAttributes);
  setAttributesFromHttpKind(httpVersion, oldAttributes);

  switch (options.semconvStability) {
    case SemconvStability.STABLE:
      return Object.assign(newAttributes, options.hookAttributes);
    case SemconvStability.OLD:
      return Object.assign(oldAttributes, options.hookAttributes);
  }

  return Object.assign(oldAttributes, newAttributes, options.hookAttributes);
};

/**
 * Returns incoming request attributes scoped to the response data
 * @param {(ServerResponse & { socket: Socket; })} response the response object
 */
export const getIncomingRequestAttributesOnResponse = (
  request: IncomingMessage,
  response: ServerResponse,
  semconvStability: SemconvStability
): Attributes => {
  // take socket from the request,
  // since it may be detached from the response object in keep-alive mode
  const { socket } = request;
  const { statusCode, statusMessage } = response;

  const newAttributes: Attributes = {
    [ATTR_HTTP_RESPONSE_STATUS_CODE]: statusCode,
  };

  const rpcMetadata = getRPCMetadata(context.active());
  const oldAttributes: Attributes = {};
  if (socket) {
    const { localAddress, localPort, remoteAddress, remotePort } = socket;
    oldAttributes[SEMATTRS_NET_HOST_IP] = localAddress;
    oldAttributes[SEMATTRS_NET_HOST_PORT] = localPort;
    oldAttributes[SEMATTRS_NET_PEER_IP] = remoteAddress;
    oldAttributes[SEMATTRS_NET_PEER_PORT] = remotePort;
  }
  oldAttributes[SEMATTRS_HTTP_STATUS_CODE] = statusCode;
  oldAttributes[HTTP_STATUS_TEXT] = (statusMessage || '').toUpperCase();

  if (rpcMetadata?.type === RPCType.HTTP && rpcMetadata.route !== undefined) {
    oldAttributes[SEMATTRS_HTTP_ROUTE] = rpcMetadata.route;
    newAttributes[ATTR_HTTP_ROUTE] = rpcMetadata.route;
  }

  switch (semconvStability) {
    case SemconvStability.STABLE:
      return newAttributes;
    case SemconvStability.OLD:
      return oldAttributes;
  }

  return Object.assign(oldAttributes, newAttributes);
};

/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 */
export const getIncomingStableRequestMetricAttributesOnResponse = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};
  if (spanAttributes[ATTR_HTTP_ROUTE] !== undefined) {
    metricAttributes[ATTR_HTTP_ROUTE] = spanAttributes[ATTR_HTTP_ROUTE];
  }

  // required if and only if one was sent, same as span requirement
  if (spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE]) {
    metricAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] =
      spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE];
  }
  return metricAttributes;
};

export function headerCapture(type: 'request' | 'response', headers: string[]) {
  const normalizedHeaders = new Map<string, string>();
  for (let i = 0, len = headers.length; i < len; i++) {
    const capturedHeader = headers[i].toLowerCase();
    normalizedHeaders.set(capturedHeader, capturedHeader.replace(/-/g, '_'));
  }

  return (
    span: Span,
    getHeader: (key: string) => undefined | string | string[] | number
  ) => {
    for (const capturedHeader of normalizedHeaders.keys()) {
      const value = getHeader(capturedHeader);

      if (value === undefined) {
        continue;
      }

      const normalizedHeader = normalizedHeaders.get(capturedHeader);
      const key = `http.${type}.header.${normalizedHeader}`;

      if (typeof value === 'string') {
        span.setAttribute(key, [value]);
      } else if (Array.isArray(value)) {
        span.setAttribute(key, value);
      } else {
        span.setAttribute(key, [value]);
      }
    }
  };
}

const KNOWN_METHODS = new Set([
  // methods from https://www.rfc-editor.org/rfc/rfc9110.html#name-methods
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'CONNECT',
  'OPTIONS',
  'TRACE',

  // PATCH from https://www.rfc-editor.org/rfc/rfc5789.html
  'PATCH',
]);

function normalizeMethod(method?: string | null) {
  if (!method) {
    return 'GET';
  }

  const upper = method.toUpperCase();
  if (KNOWN_METHODS.has(upper)) {
    return upper;
  }

  return '_OTHER';
}

function parseForwardedHeader(header: string): Record<string, string>[] {
  try {
    return forwardedParse(header);
  } catch {
    return [];
  }
}

/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 * @param {{ component: string }} options used to pass data needed to create attributes
 */
export const getIncomingRequestMetricAttributes = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};
  metricAttributes[ATTR_HTTP_SCHEME] = spanAttributes[ATTR_HTTP_SCHEME];
  metricAttributes[ATTR_HTTP_METHOD] = spanAttributes[ATTR_HTTP_METHOD];
  metricAttributes[ATTR_NET_HOST_NAME] = spanAttributes[ATTR_NET_HOST_NAME];
  metricAttributes[ATTR_HTTP_FLAVOR] = spanAttributes[ATTR_HTTP_FLAVOR];
  //TODO: http.target attribute, it should substitute any parameters to avoid high cardinality.
  return metricAttributes;
};

/**
 * Returns incoming request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 */
export const getIncomingRequestMetricAttributesOnResponse = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};
  metricAttributes[ATTR_HTTP_STATUS_CODE] =
    spanAttributes[ATTR_HTTP_STATUS_CODE];
  metricAttributes[ATTR_NET_HOST_PORT] = spanAttributes[ATTR_NET_HOST_PORT];
  if (spanAttributes[ATTR_HTTP_ROUTE] !== undefined) {
    metricAttributes[ATTR_HTTP_ROUTE] = spanAttributes[ATTR_HTTP_ROUTE];
  }
  return metricAttributes;
};

/**
 * Returns the type of synthetic source based on the user agent
 * @param {OutgoingHttpHeader} userAgent the user agent string
 */
const getSyntheticType = (
  userAgent: OutgoingHttpHeader
): AttributeValue | undefined => {
  const userAgentString: string = String(userAgent).toLowerCase();
  for (const name of SYNTHETIC_TEST_NAMES) {
    if (userAgentString.includes(name)) {
      return USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST;
    }
  }
  for (const name of SYNTHETIC_BOT_NAMES) {
    if (userAgentString.includes(name)) {
      return USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT;
    }
  }
  return;
};

/**
 * Returns outgoing request Metric attributes scoped to the request data
 * @param {Attributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributes = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};
  metricAttributes[ATTR_HTTP_METHOD] = spanAttributes[ATTR_HTTP_METHOD];
  metricAttributes[ATTR_NET_PEER_NAME] = spanAttributes[ATTR_NET_PEER_NAME];
  //TODO: http.url attribute, it should substitute any parameters to avoid high cardinality.
  return metricAttributes;
};

/**
 * Returns outgoing request Metric attributes scoped to the response data
 * @param {Attributes} spanAttributes the span attributes
 */
export const getOutgoingRequestMetricAttributesOnResponse = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};
  metricAttributes[ATTR_NET_PEER_PORT] = spanAttributes[ATTR_NET_PEER_PORT];
  metricAttributes[ATTR_HTTP_STATUS_CODE] =
    spanAttributes[ATTR_HTTP_STATUS_CODE];
  metricAttributes[ATTR_HTTP_FLAVOR] = spanAttributes[ATTR_HTTP_FLAVOR];

  return metricAttributes;
};

export const getOutgoingStableRequestMetricAttributesOnResponse = (
  spanAttributes: Attributes
): Attributes => {
  const metricAttributes: Attributes = {};

  if (spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION]) {
    metricAttributes[ATTR_NETWORK_PROTOCOL_VERSION] =
      spanAttributes[ATTR_NETWORK_PROTOCOL_VERSION];
  }

  if (spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE]) {
    metricAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE] =
      spanAttributes[ATTR_HTTP_RESPONSE_STATUS_CODE];
  }
  return metricAttributes;
};

/**
 * Parses HTTP request arguments from http.request() or http.get() calls
 * Handles both signatures: (url[, options][, cb]) and (options[, cb])
 * @param args Arguments passed to http.request/get
 * @returns Parsed request information
 */
export function parseHttpRequestArgs(args: unknown[]): { 
  method: string; 
  hostname: string; 
  port?: number;
  path?: string;
  protocol?: string; 
} {
  let method = 'GET';
  let hostname = 'localhost';
  let port: number | undefined;
  let path = '/';
  let protocol = 'http:';

  const first = args[0] as any;

  if (typeof first === 'string' || first instanceof URL) {
    const urlObj = new URL(first.toString());
    hostname = urlObj.hostname;
    port = urlObj.port ? Number(urlObj.port) : undefined;
    path = urlObj.pathname + urlObj.search;
    protocol = urlObj.protocol;
    
    // Check second argument for options that might override method
    const second = args[1] as any;
    if (typeof second === 'object' && second !== null && second.method) {
      method = second.method.toUpperCase();
    }
  } else if (typeof first === 'object' && first !== null) {
    method = (first.method || 'GET').toUpperCase();
    hostname = first.hostname || first.host || hostname;
    if (first.port !== undefined) port = Number(first.port);
    path = first.path || path;
    protocol = first.protocol || protocol;
  }

  return { method, hostname, port, path, protocol };
}
