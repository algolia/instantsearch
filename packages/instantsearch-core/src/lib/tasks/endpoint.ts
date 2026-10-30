import { resolveValue } from '../ai-lite/utils';

import { DefaultTaskTransport } from './transport';

import type {
  TaskPrepareSendMessagesRequest,
  TaskTransportOptions,
} from './transport';

export type TaskCredentials = {
  appId: string;
  apiKey: string;
  agentId: string;
};

export type TaskPrepareRequest = (body: Record<string, unknown>) => {
  body: Record<string, unknown>;
};

export type TaskTransport = {
  api: string;
  headers?: Record<string, string>;
  fetch?: typeof fetch;
  prepareSendMessagesRequest?: TaskPrepareRequest;
};

export type TaskEndpoint =
  | { transport: TaskTransport; credentials?: never }
  | { transport?: never; credentials: TaskCredentials };

export type ResolvedEndpoint = {
  endpoint: string;
  headers: Record<string, string>;
  fetch?: typeof fetch;
  prepareSendMessagesRequest?: TaskPrepareRequest;
};

function buildEndpoint({
  appId,
  agentId,
}: {
  appId: string;
  agentId: string;
}): string {
  return `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/tasks`;
}

export function resolveEndpoint(params: {
  transport?: TaskTransport;
  appId?: string;
  apiKey?: string;
  agentId?: string;
  algoliaAgent?: string;
}): ResolvedEndpoint {
  if (params.transport) {
    return {
      endpoint: params.transport.api,
      headers: params.transport.headers || {},
      fetch: params.transport.fetch,
      prepareSendMessagesRequest: params.transport.prepareSendMessagesRequest,
    };
  }

  if (!params.appId || !params.apiKey || !params.agentId) {
    throw new Error(
      '[tasks] Either `transport` or `{ appId, apiKey, agentId }` is required.'
    );
  }

  const headers: Record<string, string> = {
    'x-algolia-application-id': params.appId,
    'x-algolia-api-key': params.apiKey,
  };
  if (params.algoliaAgent) {
    headers['x-algolia-agent'] = `${params.algoliaAgent}; tasks`;
  }

  return {
    endpoint: buildEndpoint({ appId: params.appId, agentId: params.agentId }),
    headers,
  };
}

function isHeaders(headers: HeadersInit): headers is Headers {
  return (
    !Array.isArray(headers) &&
    'entries' in headers &&
    typeof headers.entries === 'function'
  );
}

function headersToRecord(headers: HeadersInit | undefined) {
  if (!headers) {
    return {};
  }
  if (isHeaders(headers)) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...headers };
}

function mergeProtectedHeaders(
  headers: HeadersInit | undefined,
  protectedHeaders: Record<string, string>
): Record<string, string> {
  const merged = headersToRecord(headers);
  Object.entries(protectedHeaders).forEach(([protectedName, value]) => {
    Object.keys(merged).forEach((name) => {
      if (name.toLowerCase() === protectedName.toLowerCase()) {
        delete merged[name];
      }
    });
    merged[protectedName] = value;
  });
  return merged;
}

/** @internal */
export function createTaskTransport({
  transport = {},
  appId,
  apiKey,
  agentId,
  algoliaAgent,
}: {
  transport?: TaskTransportOptions;
  appId?: string;
  apiKey?: string;
  agentId?: string;
  algoliaAgent?: string;
}): DefaultTaskTransport {
  if (!agentId) {
    return new DefaultTaskTransport(transport);
  }
  if (!appId || !apiKey) {
    throw new Error(
      '[tasks] `appId` and `apiKey` are required when `agentId` is provided.'
    );
  }

  const protectedHeaders: Record<string, string> = {
    'x-algolia-application-id': appId,
    'x-algolia-api-key': apiKey,
  };
  if (algoliaAgent) {
    protectedHeaders['x-algolia-agent'] = `${algoliaAgent}; tasks`;
  }

  const originalPrepare = transport.prepareSendMessagesRequest;
  const prepareSendMessagesRequest: TaskPrepareSendMessagesRequest | undefined =
    originalPrepare
      ? (request) =>
          Promise.resolve(originalPrepare(request)).then((prepared) => ({
            ...prepared,
            headers: prepared.headers
              ? mergeProtectedHeaders(prepared.headers, protectedHeaders)
              : undefined,
          }))
      : undefined;

  return new DefaultTaskTransport({
    ...transport,
    api: transport.api ?? buildEndpoint({ appId, agentId }),
    headers: () =>
      Promise.resolve(resolveValue(transport.headers)).then((headers) =>
        mergeProtectedHeaders(headers, protectedHeaders)
      ),
    prepareSendMessagesRequest,
  });
}
