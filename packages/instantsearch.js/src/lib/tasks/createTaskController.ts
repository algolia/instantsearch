import { resolveEndpoint } from './endpoint';
import { TaskController } from './TaskController';

import type { TaskTransport } from './endpoint';

export type CreateTaskControllerOptions = {
  /** Algolia application id. Ignored when `transport` is set. */
  appId?: string;
  /** Algolia API key. Ignored when `transport` is set. */
  apiKey?: string;
  /** Agent Studio agent id. Ignored when `transport` is set. */
  agentId?: string;
  /** Value for the `x-algolia-agent` header. Ignored when `transport` is set. */
  algoliaAgent?: string;
  /** Custom transport. When set, `appId`/`apiKey`/`agentId` are ignored. */
  transport?: TaskTransport;
  /** Task (a.k.a. configuration) id sent as the `task` field. */
  task: string;
  /** Whether to stream partial outputs. Default `true`. */
  stream?: boolean;
};

/**
 * Builds a {@link TaskController} from a custom `transport` or from plain
 * Algolia credentials (`{ appId, apiKey, agentId }`). This helper has **no
 * InstantSearch coupling** — callers inside InstantSearch resolve the
 * credentials from their search client and pass them in, but the task stack
 * can also be driven standalone by supplying them directly.
 */
export function createTaskController<TOutput = unknown>({
  appId,
  apiKey,
  agentId,
  algoliaAgent,
  transport,
  task,
  stream = true,
}: CreateTaskControllerOptions): TaskController<TOutput> {
  const resolved = resolveEndpoint({
    transport,
    appId,
    apiKey,
    agentId,
    algoliaAgent,
  });

  return new TaskController<TOutput>({
    endpoint: resolved.endpoint,
    headers: resolved.headers,
    task,
    stream,
    prepareRequest: resolved.prepareSendMessagesRequest,
  });
}
