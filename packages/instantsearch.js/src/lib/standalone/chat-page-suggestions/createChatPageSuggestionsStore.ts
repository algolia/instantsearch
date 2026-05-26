import { buildPayload } from './buildPayload';
import { parseSuggestions } from './parseSuggestions';
import { resolveEndpoint } from './resolveEndpoint';

import type { ChatPageSuggestionsTransport } from './types';

export type ChatPageSuggestionsStoreParams = {
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
   * Maximum number of suggestions to expose.
   * @default 4
   */
  maxSuggestions?: number;
  /**
   * Debounce delay (in ms) for `refresh()` calls. `refreshNow()` bypasses it.
   * @default 300
   */
  debounceMs?: number;
  /**
   * Suggestions to seed state with on construction (e.g. from a server
   * `prefetchChatPageSuggestions()` call).
   */
  initialSuggestions?: string[];
};

export type ChatPageSuggestionsFetchInput = {
  query?: string;
  hitsSample?: unknown[];
  context?: Record<string, unknown>;
};

export type ChatPageSuggestionsStoreState = {
  suggestions: string[];
  isLoading: boolean;
};

export type ChatPageSuggestionsStore = {
  getState: () => ChatPageSuggestionsStoreState;
  subscribe: (listener: () => void) => () => void;
  /** Debounced fetch. */
  refresh: (input: ChatPageSuggestionsFetchInput) => void;
  /** Fetch immediately, bypassing the debounce. Resolves when state updates. */
  refreshNow: (input: ChatPageSuggestionsFetchInput) => Promise<void>;
  dispose: () => void;
};

/**
 * Framework-agnostic reactive store powering the standalone chat-page
 * suggestions experience. Consumers drive refresh manually (or via a React
 * hook on top); the store handles fetching, parsing, debouncing, and
 * subscriber notification.
 */
export function createChatPageSuggestionsStore(
  params: ChatPageSuggestionsStoreParams
): ChatPageSuggestionsStore {
  const {
    maxSuggestions = 4,
    debounceMs = 300,
    initialSuggestions = [],
  } = params;

  const { endpoint, headers, prepareSendMessagesRequest } = resolveEndpoint({
    transport: params.transport,
    appId: params.appId,
    apiKey: params.apiKey,
    agentId: params.agentId,
  });

  let state: ChatPageSuggestionsStoreState = {
    suggestions: initialSuggestions,
    isLoading: false,
  };
  const listeners = new Set<() => void>();
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;
  let currentController: AbortController | undefined;
  let disposed = false;

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const setState = (next: Partial<ChatPageSuggestionsStoreState>) => {
    state = { ...state, ...next };
    notify();
  };

  const doFetch = async (input: ChatPageSuggestionsFetchInput) => {
    if (disposed) return;

    currentController?.abort();
    const controller =
      typeof AbortController !== 'undefined' ? new AbortController() : undefined;
    currentController = controller;

    setState({ isLoading: true });

    try {
      const payload = buildPayload(input, {
        maxSuggestions,
        prepareSendMessagesRequest,
      });
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller?.signal,
      });
      if (controller?.signal.aborted || disposed) return;
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      if (controller?.signal.aborted || disposed) return;
      setState({
        suggestions: parseSuggestions(data, maxSuggestions),
        isLoading: false,
      });
    } catch (_error) {
      if (controller?.signal.aborted || disposed) return;
      setState({ suggestions: [], isLoading: false });
    }
  };

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },

    refresh(input) {
      if (disposed) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        doFetch(input);
      }, debounceMs);
    },

    refreshNow(input) {
      if (disposed) return Promise.resolve();
      clearTimeout(debounceTimer);
      return doFetch(input);
    },

    dispose() {
      disposed = true;
      clearTimeout(debounceTimer);
      currentController?.abort();
      listeners.clear();
    },
  };
}
