export type TaskPrepareRequest = (body: Record<string, unknown>) => {
  body: Record<string, unknown>;
};

export type TaskTransport = {
  api: string;
  headers?: Record<string, string>;
  prepareSendMessagesRequest?: TaskPrepareRequest;
};

export type TaskCredentials = {
  appId: string;
  apiKey: string;
  agentId: string;
};

export type TaskEndpoint =
  | { transport: TaskTransport; credentials?: never }
  | { transport?: never; credentials: TaskCredentials };

export type ResolvedEndpoint = {
  endpoint: string;
  headers: Record<string, string>;
  prepareSendMessagesRequest?: TaskTransport['prepareSendMessagesRequest'];
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
    headers['x-algolia-agent'] = params.algoliaAgent;
  }

  return {
    endpoint: buildEndpoint({ appId: params.appId, agentId: params.agentId }),
    headers,
  };
}
