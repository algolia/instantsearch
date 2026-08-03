import { getAlgoliaAgent, getAppIdAndApiKey } from '../utils';

import { resolveEndpoint } from './endpoint';
import { TaskController } from './TaskController';

import type { InstantSearch } from '../../types';
import type { TaskTransport } from './endpoint';

export type CreateTaskControllerOptions = {
  /** The running InstantSearch instance — its search client is the credential source. */
  instantSearchInstance: InstantSearch;
  /** Agent Studio agent id. Ignored when `transport` is set. */
  agentId?: string;
  /** Custom transport. When set, `agentId` and client credentials are ignored. */
  transport?: TaskTransport;
  /** Task (a.k.a. configuration) id sent as the `task` field. */
  task: string;
  /** Whether to stream partial outputs. Default `true`. */
  stream?: boolean;
};

/**
 * Builds a {@link TaskController} from an InstantSearch instance, resolving the
 * endpoint/headers from a custom `transport` or from the search client's
 * `{ appId, apiKey }` + `agentId`. This is the one seam that couples a task
 * engine to InstantSearch; the controller it returns is otherwise standalone.
 */
export function createTaskController<TOutput = unknown>({
  instantSearchInstance,
  agentId,
  transport,
  task,
  stream = true,
}: CreateTaskControllerOptions): TaskController<TOutput> {
  if (transport) {
    const resolved = resolveEndpoint({ transport });
    return new TaskController<TOutput>({
      endpoint: resolved.endpoint,
      headers: resolved.headers,
      task,
      stream,
      prepareRequest: resolved.prepareSendMessagesRequest,
    });
  }

  const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

  if (!appId || !apiKey) {
    throw new Error(
      'Could not extract Algolia credentials from the search client.'
    );
  }

  const resolved = resolveEndpoint({
    appId,
    apiKey,
    agentId,
    algoliaAgent: getAlgoliaAgent(instantSearchInstance.client),
  });

  return new TaskController<TOutput>({
    endpoint: resolved.endpoint,
    headers: resolved.headers,
    task,
    stream,
  });
}
