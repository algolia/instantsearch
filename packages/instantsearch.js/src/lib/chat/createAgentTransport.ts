import { DefaultChatTransport } from '../ai-lite';
import { getAlgoliaAgent, getAppIdAndApiKey } from '../utils';

import type { SearchClient, CompositionClient } from '../../types';
import type { UIMessage } from '../ai-lite';

export type CreateAgentTransportOptions = {
  /** The Algolia search client (for credentials extraction). */
  client: SearchClient | CompositionClient;
  /**
   * The Algolia agent identifier. When provided, the default Algolia
   * agent-studio endpoint is used.
   */
  agentId?: string;
  /**
   * A custom transport options bag. When provided, takes precedence over
   * `agentId` and is passed to `DefaultChatTransport`.
   */
  transport?: ConstructorParameters<typeof DefaultChatTransport>[0];
  /**
   * Optional algolia-agent suffix appended to the user agent (e.g. `'chat'`,
   * `'page-suggestions'`).
   */
  algoliaAgentSuffix?: string;
};

/**
 * Strips `data-*` UI message parts from outgoing messages. The backend
 * doesn't accept these — they exist only for client-side UI state.
 */
function filterDataParts<TUIMessage extends UIMessage>(
  messages: TUIMessage[]
): TUIMessage[] {
  return messages.map((message) => ({
    ...message,
    parts: message.parts?.filter(
      (part) => !('type' in part && part.type.startsWith('data-'))
    ),
  }));
}

/**
 * Builds a configured `DefaultChatTransport` for either a custom transport
 * or the Algolia agent-studio endpoint, applying the `filterDataParts` shim
 * to outgoing messages.
 */
export function createAgentTransport<TUIMessage extends UIMessage>({
  client,
  agentId,
  transport,
  algoliaAgentSuffix = 'chat',
}: CreateAgentTransportOptions): DefaultChatTransport<TUIMessage> {
  if (transport) {
    const originalPrepare = transport.prepareSendMessagesRequest;
    return new DefaultChatTransport<TUIMessage>({
      ...transport,
      prepareSendMessagesRequest: (params) => {
        // Call the original prepareSendMessagesRequest if it exists,
        // otherwise construct a minimal default body containing only the
        // request payload — without leaking transport metadata such as
        // resolved headers, api URL, credentials, or `requestMetadata`.
        const preparedOrPromise = originalPrepare
          ? originalPrepare(params)
          : {
              body: {
                id: params.id,
                messageId: params.messageId,
                trigger: params.trigger,
                messages: params.messages,
                ...params.body,
              },
            };

        const applyFilter = (prepared: { body: object }) => ({
          ...prepared,
          body: {
            ...prepared.body,
            messages: filterDataParts(
              (prepared.body as { messages: TUIMessage[] }).messages
            ),
          },
        });

        if (preparedOrPromise && 'then' in preparedOrPromise) {
          return preparedOrPromise.then(applyFilter);
        }
        return applyFilter(preparedOrPromise);
      },
    });
  }

  if (!agentId) {
    return undefined as unknown as DefaultChatTransport<TUIMessage>;
  }

  const [appId, apiKey] = getAppIdAndApiKey(client);
  if (!appId || !apiKey) {
    throw new Error(
      'Could not extract Algolia credentials from the search client.'
    );
  }

  const baseApi = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`;

  return new DefaultChatTransport<TUIMessage>({
    api: baseApi,
    headers: {
      'x-algolia-application-id': appId,
      'x-algolia-api-key': apiKey,
      'x-algolia-agent': `${getAlgoliaAgent(client)}; ${algoliaAgentSuffix}`,
    },
    prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => {
      return {
        // Bypass cache when regenerating to ensure fresh responses
        api:
          trigger === 'regenerate-message' ? `${baseApi}&cache=false` : baseApi,
        body: {
          id,
          messageId,
          messages: filterDataParts(messages),
        },
      };
    },
  });
}
