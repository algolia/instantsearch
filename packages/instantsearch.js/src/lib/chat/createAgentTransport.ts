import { DefaultChatTransport } from '../ai-lite';
import { getAlgoliaAgent, getAppIdAndApiKey } from '../utils';

import type { SearchClient, CompositionClient } from '../../types';
import type { UIMessage } from '../ai-lite';

/**
 * Request options applied to built-in Algolia agent-studio requests (ignored
 * when a custom `transport` is provided).
 */
export type AgentRequestOptions = {
  /**
   * Query parameters merged into the completion request URL.
   */
  queryParameters?: Record<string, string | number | boolean>;
  /**
   * Headers merged into the completion request. The Algolia identity headers
   * and the `x-algolia-agent` marker always win over same-named keys here.
   */
  headers?: Record<string, string> | Headers;
};

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
   * `'prompt-suggestions'`).
   */
  algoliaAgentSuffix?: string;
  /**
   * Persistent query parameters and headers applied to built-in agent-studio
   * requests (ignored when `transport` is provided).
   */
  requestOptions?: AgentRequestOptions;
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
  requestOptions,
}: CreateAgentTransportOptions): DefaultChatTransport<TUIMessage> | undefined {
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
    return undefined;
  }

  const [appId, apiKey] = getAppIdAndApiKey(client);
  if (!appId || !apiKey) {
    throw new Error(
      'Could not extract Algolia credentials from the search client.'
    );
  }

  const createApi = (bypassCache = false) => {
    const api = new URL(
      `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/completions`
    );
    const queryParameters: Record<string, string | number | boolean> = {
      ...requestOptions?.queryParameters,
      compatibilityMode: 'ai-sdk-5',
      ...(bypassCache ? { cache: false } : {}),
    };

    api.search = new URLSearchParams(
      queryParameters as Record<string, string>
    ).toString();
    return api.toString();
  };
  const baseApi = createApi();

  return new DefaultChatTransport<TUIMessage>({
    api: baseApi,
    headers: {
      ...(requestOptions?.headers instanceof Headers
        ? Object.fromEntries(requestOptions.headers.entries())
        : requestOptions?.headers),
      // Preserve the required Algolia identity headers and agent marker, even
      // when requestOptions.headers contains the same keys.
      'x-algolia-application-id': appId,
      'x-algolia-api-key': apiKey,
      'x-algolia-agent': `${getAlgoliaAgent(client)}; ${algoliaAgentSuffix}`,
    },
    prepareSendMessagesRequest: ({ id, messages, trigger, messageId }) => {
      return {
        // Bypass cache when regenerating to ensure fresh responses
        api: trigger === 'regenerate-message' ? createApi(true) : baseApi,
        body: {
          id,
          messageId,
          messages: filterDataParts(messages),
        },
      };
    },
  });
}
