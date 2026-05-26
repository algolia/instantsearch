import {
  createChatPageSuggestionsStore,
  dispatchSuggestionClick,
} from 'instantsearch.js/es/lib/standalone/chat-page-suggestions';
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'react';

import type {
  ChatPageSuggestionsStore,
  ChatPageSuggestionsStoreParams,
} from 'instantsearch.js/es/lib/standalone/chat-page-suggestions';

export type UseChatPageSuggestionsStandaloneProps =
  ChatPageSuggestionsStoreParams & {
    /**
     * Current search query. Changes trigger an auto-refetch (debounced inside
     * the store).
     */
    query?: string;
    /**
     * Hits sampled from the current search results. Changes trigger an
     * auto-refetch.
     */
    hitsSample?: unknown[];
    /**
     * Additional page-level context. Changes trigger an auto-refetch.
     */
    context?: Record<string, unknown>;
    /**
     * Set to `false` to disable the auto-refetch on prop changes. Use
     * `refresh()` to drive fetches manually.
     * @default true
     */
    autoRefresh?: boolean;
    /**
     * Optional tag forwarded to the click `CustomEvent` detail (`event.detail.source`).
     * Useful when multiple pill instances live on the same page.
     */
    source?: string;
  };

export type UseChatPageSuggestionsStandaloneReturn = {
  suggestions: string[];
  isLoading: boolean;
  /** Click handler — dispatches the suggestion click `CustomEvent` on `window`. */
  onSuggestionClick: (prompt: string) => void;
  /** Trigger a manual refetch with the current `query`/`hitsSample`/`context`. */
  refresh: () => void;
};

function stableStringify(value: unknown): string {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

/**
 * Drop-in React hook for the standalone (no-`<InstantSearch>`) prompt-pills
 * experience. Powers `ChatPageSuggestionsStandalone` or any custom UI.
 *
 * The caller provides whatever search context they want (`query`,
 * `hitsSample`, `context`). On change, the hook auto-refetches (debounced).
 * Clicking a pill dispatches a `CustomEvent` on `window` that any chat
 * implementation can listen for — see [dispatchSuggestionClick].
 */
export function useChatPageSuggestionsStandalone(
  props: UseChatPageSuggestionsStandaloneProps
): UseChatPageSuggestionsStandaloneReturn {
  const {
    query,
    hitsSample,
    context,
    autoRefresh = true,
    source,
    // Store-stable params:
    transport,
    appId,
    apiKey,
    agentId,
    maxSuggestions,
    debounceMs,
    initialSuggestions,
  } = props;

  // The store's identity is keyed on the params that affect its endpoint
  // wiring. Changing them creates a fresh store; everything else just drives
  // refresh().
  const storeKey = useMemo(
    () =>
      stableStringify({
        api: transport?.api,
        appId,
        apiKey,
        agentId,
        maxSuggestions,
        debounceMs,
      }),
    [transport?.api, appId, apiKey, agentId, maxSuggestions, debounceMs]
  );

  const storeRef = useRef<ChatPageSuggestionsStore | null>(null);
  const storeKeyRef = useRef<string | null>(null);

  if (storeRef.current === null || storeKeyRef.current !== storeKey) {
    storeRef.current?.dispose();
    storeRef.current = createChatPageSuggestionsStore({
      transport,
      appId,
      apiKey,
      agentId,
      maxSuggestions,
      debounceMs,
      initialSuggestions,
    });
    storeKeyRef.current = storeKey;
  }

  const store = storeRef.current;

  useEffect(() => {
    return () => {
      store.dispose();
      storeRef.current = null;
    };
    // Disposal is keyed off the store identity — same store stays alive
    // across re-renders, gets disposed on unmount or store-key change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );

  // Auto-refetch on input change. The store's internal debounce coalesces
  // rapid successive calls.
  const hitsKey = stableStringify(hitsSample);
  const contextKey = stableStringify(context);
  useEffect(() => {
    if (!autoRefresh) return;
    store.refresh({ query, hitsSample, context });
    // hitsSample / context compared by stable stringify to avoid identity
    // churn re-firing the effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, autoRefresh, query, hitsKey, contextKey]);

  const onSuggestionClick = (prompt: string) => {
    dispatchSuggestionClick(prompt, source);
  };

  const refresh = () => {
    store.refresh({ query, hitsSample, context });
  };

  return {
    suggestions: state.suggestions,
    isLoading: state.isLoading,
    onSuggestionClick,
    refresh,
  };
}
