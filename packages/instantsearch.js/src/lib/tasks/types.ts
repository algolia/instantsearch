import type { TaskPrepareRequest } from './buildTaskPayload';

/**
 * Custom transport for the Agent Studio `tasks` endpoint. Mirrors the shape of
 * the chat transport but targets `POST /agents/{id}/tasks` instead of
 * `/completions`.
 */
export type TaskTransport = {
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
  prepareSendMessagesRequest?: TaskPrepareRequest;
};

export type TaskCredentials = {
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

export type TaskEndpoint =
  | { transport: TaskTransport; credentials?: never }
  | { transport?: never; credentials: TaskCredentials };
