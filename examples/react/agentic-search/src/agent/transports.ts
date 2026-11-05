import { DefaultChatTransport } from 'instantsearch.js/es/lib/ai-lite';

import { ALGOLIA, IN_BROWSER } from '../backend';
import { inlineFetch } from '../fake/inlineBackend';

import { AgentStudioTransport } from './agentStudioTransport';
import { getQueries } from './chat';

import type { AgentMessage } from './chat';
import type { AgenticConfig } from './trigger';
import type { Filters } from '../types';
import type { ChatTransport } from 'instantsearch.js/es/lib/ai-lite';

/**
 * The transport the trigger asks for:
 *
 * - `agentId`: an Agent Studio agent, called from the browser, its stream
 *   translated into the agent protocol;
 * - `stream`: an endpoint that already speaks the protocol (the fake backend):
 *   `POST { queries, filters, exclude? }`.
 *
 * `exclude` comes from `sendMessage(…, { body })` on an "Ask for more" turn.
 */
export function createAgentTransport(
  config: AgenticConfig,
  getFilters: () => Filters
): ChatTransport<AgentMessage> {
  if (config.kind === 'agent-studio') {
    return new AgentStudioTransport({
      appId: ALGOLIA.appId,
      apiKey: ALGOLIA.searchApiKey,
      indexName: ALGOLIA.indexName,
      agentId: config.agentId,
      getFilters,
    });
  }

  return new DefaultChatTransport<AgentMessage>({
    api: config.stream,
    ...(IN_BROWSER ? { fetch: inlineFetch } : {}),
    prepareSendMessagesRequest: ({ messages, body }) => ({
      body: {
        queries: getQueries(messages),
        filters: getFilters(),
        ...(Array.isArray(body?.exclude) ? { exclude: body.exclude } : {}),
      },
    }),
  });
}
