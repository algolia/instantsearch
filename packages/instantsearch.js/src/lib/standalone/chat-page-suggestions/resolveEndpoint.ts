import { buildEndpoint } from './buildEndpoint';

import type { ChatPageSuggestionsTransport } from './types';

export type ResolvedEndpoint = {
  endpoint: string;
  headers: Record<string, string>;
  prepareSendMessagesRequest?: ChatPageSuggestionsTransport['prepareSendMessagesRequest'];
};

export function resolveEndpoint(params: {
  transport?: ChatPageSuggestionsTransport;
  appId?: string;
  apiKey?: string;
  agentId?: string;
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
      '[chat-page-suggestions] Either `transport` or `{ appId, apiKey, agentId }` is required.'
    );
  }

  return {
    endpoint: buildEndpoint({ appId: params.appId, agentId: params.agentId }),
    headers: {
      'x-algolia-application-id': params.appId,
      'x-algolia-api-key': params.apiKey,
    },
  };
}
