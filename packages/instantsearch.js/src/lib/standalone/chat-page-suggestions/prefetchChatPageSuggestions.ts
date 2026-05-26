import { buildPayload } from './buildPayload';
import { parseSuggestions } from './parseSuggestions';
import { resolveEndpoint } from './resolveEndpoint';

import type { ChatPageSuggestionsTransport } from './types';

export type PrefetchChatPageSuggestionsParams = {
  /**
   * Algolia application ID. Required unless `transport` is provided.
   */
  appId?: string;
  /**
   * Algolia API key. Required unless `transport` is provided.
   */
  apiKey?: string;
  /**
   * ID of the agent configured in the Algolia dashboard. Required unless
   * `transport` is provided.
   */
  agentId?: string;
  /**
   * Custom transport override (replaces the default agent-studio endpoint).
   */
  transport?: ChatPageSuggestionsTransport;
  /**
   * Maximum number of suggestions to return.
   * @default 4
   */
  maxSuggestions?: number;
  /**
   * The current search query, forwarded to the agent as context.
   */
  query?: string;
  /**
   * Hits sampled from the current search results, forwarded to the agent as
   * context. Trim to the size you want to send; the helper does not slice.
   */
  hitsSample?: unknown[];
  /**
   * Additional page-level context (e.g. product info on a PDP).
   */
  context?: Record<string, unknown>;
  /**
   * Maximum time (in ms) to wait for the agent response before aborting.
   * @default 1500
   */
  timeoutMs?: number;
  /**
   * Caller-supplied abort signal. Combined with the internal timeout signal.
   */
  signal?: AbortSignal;
};

/**
 * Server-safe, one-shot fetch of chat page suggestions. Use from a Next.js
 * Server Component, RSC loader, or any other server runtime to pre-fetch the
 * pills and hydrate the client component via `initialSuggestions`.
 *
 * @throws on transport / abort error. Wrap in `try/catch` (or `Promise.race`)
 * if you need to fail open.
 */
export async function prefetchChatPageSuggestions(
  params: PrefetchChatPageSuggestionsParams
): Promise<string[]> {
  const {
    maxSuggestions = 4,
    query,
    hitsSample,
    context,
    timeoutMs = 1500,
    signal: callerSignal,
  } = params;

  const { endpoint, headers, prepareSendMessagesRequest } = resolveEndpoint({
    transport: params.transport,
    appId: params.appId,
    apiKey: params.apiKey,
    agentId: params.agentId,
  });

  const payload = buildPayload(
    { query, hitsSample, context },
    { maxSuggestions, prepareSendMessagesRequest }
  );

  const controller =
    typeof AbortController !== 'undefined' ? new AbortController() : undefined;
  const timer = controller
    ? setTimeout(() => controller.abort(), timeoutMs)
    : undefined;

  // If the caller passes a signal, forward its abort to our controller so a
  // single fetch is governed by both timeouts.
  if (callerSignal && controller) {
    if (callerSignal.aborted) {
      controller.abort();
    } else {
      callerSignal.addEventListener('abort', () => controller.abort(), {
        once: true,
      });
    }
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller?.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return parseSuggestions(data, maxSuggestions);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}
