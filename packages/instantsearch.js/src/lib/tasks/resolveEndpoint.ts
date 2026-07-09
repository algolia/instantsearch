import { buildEndpoint } from './buildEndpoint';

import type { TaskTransport } from './types';

export type ResolvedEndpoint = {
  endpoint: string;
  headers: Record<string, string>;
  prepareSendMessagesRequest?: TaskTransport['prepareSendMessagesRequest'];
};

export function resolveEndpoint(params: {
  transport?: TaskTransport;
  appId?: string;
  apiKey?: string;
  agentId?: string;
  /**
   * Optional `x-algolia-agent` identity header. Passed by the in-IS connector
   * (derived from the search client).
   */
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
