import type { ChatPageSuggestionsPrepareRequest } from './buildPayload';

export type ChatPageSuggestionsTransport = {
  /**
   * The custom API endpoint URL.
   */
  api: string;
  /**
   * Custom headers to send with the request.
   */
  headers?: Record<string, string>;
  /**
   * Function to prepare the request body before sending.
   */
  prepareSendMessagesRequest?: ChatPageSuggestionsPrepareRequest;
};

export type ChatPageSuggestionsCredentials = {
  /**
   * Algolia application ID.
   */
  appId: string;
  /**
   * Algolia API key with permissions for the agent.
   */
  apiKey: string;
  /**
   * ID of the agent configured in the Algolia dashboard.
   */
  agentId: string;
};

export type ChatPageSuggestionsEndpoint =
  | { transport: ChatPageSuggestionsTransport; credentials?: never }
  | { transport?: never; credentials: ChatPageSuggestionsCredentials };
