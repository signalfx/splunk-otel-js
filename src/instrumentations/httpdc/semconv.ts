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
export const HTTP_ERROR_NAME = 'http.error_name' as const;
export const HTTP_ERROR_MESSAGE = 'http.error_message' as const;
export const HTTP_STATUS_TEXT = 'http.status_text' as const;

export const ATTR_USER_AGENT_SYNTHETIC_TYPE =
  'user_agent.synthetic.type' as const;

/**
 * Enum value "bot" for attribute {@link ATTR_USER_AGENT_SYNTHETIC_TYPE}.
 */
export const USER_AGENT_SYNTHETIC_TYPE_VALUE_BOT = 'bot' as const;

/**
 * Enum value "test" for attribute {@link ATTR_USER_AGENT_SYNTHETIC_TYPE}.
 */
export const USER_AGENT_SYNTHETIC_TYPE_VALUE_TEST = 'test' as const;

// export const ATTR_HTTP_FLAVOR = 'http.flavor' as const;

// export const ATTR_HTTP_METHOD = 'http.method' as const;

// export const ATTR_HTTP_SCHEME = 'http.scheme' as const;

// export const ATTR_HTTP_STATUS_CODE = 'http.status_code' as const;

// export const ATTR_HTTP_URL = 'http.url' as const;

// export const ATTR_NET_HOST_NAME = 'net.host.name' as const;

// export const ATTR_NET_HOST_PORT = 'net.host.port' as const;

// export const ATTR_NET_PEER_NAME = 'net.peer.name' as const;

// export const ATTR_NET_PEER_PORT = 'net.peer.port' as const;
