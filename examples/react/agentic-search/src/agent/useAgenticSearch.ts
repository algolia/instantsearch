import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useConfigure,
  useInstantSearch,
  useSearchBox,
} from 'react-instantsearch';

import { AgentChat, getQueries, useChatSnapshot } from './chat';
import { createAgentTransport } from './transports';
import { getAgenticConfig, getAgenticKey } from './trigger';

import type { Filters } from '../types';

/**
 * - `auto`: the response decides (agentic for natural-language queries);
 * - `search`: always regular search;
 * - `agent`: always hand the query to the agent.
 */
export type SearchMode = 'auto' | 'search' | 'agent';

/** The follow-up "Ask for more" sends, shown in the conversation trail. */
export const MORE_QUERY = 'show me more options';

/**
 * Each mode is a rule context: the query rules in `server/rules.mjs` add the
 * agentic trigger for natural-language queries (auto) or for every query
 * (agent), and nothing fires without a context (search). The client keeps
 * obeying the response either way.
 */
const MODE_RULE_CONTEXTS: Record<SearchMode, string[]> = {
  auto: ['agentic-search-poc-auto'],
  search: [],
  agent: ['agentic-search-poc-agent'],
};

/** The active refinements as a plain `{ attribute: values[] }` snapshot. */
function useFiltersSnapshot(): Filters {
  const { indexUiState } = useInstantSearch();
  const refinementList = indexUiState.refinementList;
  const key = JSON.stringify(refinementList ?? {});

  return useMemo(() => {
    const filters: Filters = {};
    Object.entries(refinementList ?? {}).forEach(([attribute, values]) => {
      if (values.length > 0) filters[attribute] = [...values];
    });
    return filters;
    // `indexUiState` is a new object on every render; key on its content.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/**
 * Agentic mode, kept in React state (never in the helper or the URL, never
 * sent to Algolia):
 *
 * - a regular response with the agentic trigger starts a conversation;
 * - submitting the search box while agentic sends a follow-up instead of a
 *   regular search;
 * - changing a filter re-asks the agent with the same queries;
 * - a response without the trigger (for example after forcing regular
 *   search) ends it;
 * - `reset` goes back to regular search.
 */
export function useAgenticSearch() {
  const { results } = useInstantSearch();
  const { query, refine } = useSearchBox();
  const filters = useFiltersSnapshot();

  const [mode, setMode] = useState<SearchMode>('auto');
  useConfigure({ ruleContexts: MODE_RULE_CONTEXTS[mode] });

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const [chat, setChat] = useState<AgentChat | null>(null);
  const chatRef = useRef<AgentChat | null>(null);
  const snapshot = useChatSnapshot(chat);

  const replaceChat = (next: AgentChat | null) => {
    chatRef.current?.stop();
    chatRef.current = next;
    setChat(next);
  };

  // The regular response decides the mode: it starts or ends agentic mode.
  useEffect(() => {
    const agentic = getAgenticConfig(results);
    if (!agentic || !results.query) {
      if (chatRef.current) replaceChat(null);
      return;
    }
    // Facet changes re-run the regular search with the same query: that's the
    // same conversation, not a new one.
    const key = getAgenticKey(agentic);
    if (
      chatRef.current?.originalQuery === results.query &&
      chatRef.current.key === key
    ) {
      return;
    }

    const next = new AgentChat({
      transport: createAgentTransport(agentic, () => filtersRef.current),
      originalQuery: results.query,
      key,
    });
    replaceChat(next);
    next.sendMessage({ text: results.query });
  }, [results]);

  // A filter change re-asks the agent with the same queries.
  const filtersKey = JSON.stringify(filters);
  const lastFiltersKey = useRef(filtersKey);
  useEffect(() => {
    if (lastFiltersKey.current === filtersKey) return;
    lastFiltersKey.current = filtersKey;
    const current = chatRef.current;
    if (!current) return;
    current.stop();
    current.regenerate();
  }, [filtersKey]);

  // Abort any stream when the page goes away.
  useEffect(
    () => () => {
      chatRef.current?.stop();
    },
    []
  );

  const submit = (text: string) => {
    const trimmed = text.trim();
    const current = chatRef.current;
    if (!current) {
      refine(trimmed);
      return;
    }
    if (!trimmed) return;
    // A follow-up is a new request; it aborts the one still streaming.
    current.stop();
    current.sendMessage({ text: trimmed });
  };

  /**
   * A follow-up turn for more products. The server is stateless, so it's told
   * which products are already on screen.
   */
  const askForMore = (exclude: string[]) => {
    const current = chatRef.current;
    if (!current) return;
    current.stop();
    current.sendMessage({ text: MORE_QUERY }, { body: { exclude } });
  };

  return {
    isAgentic: chat !== null,
    askForMore,
    mode,
    setMode,
    query,
    queries: getQueries(snapshot.messages),
    snapshot,
    filters,
    submit,
    stop: () => chatRef.current?.stop(),
    retry: () => chatRef.current?.regenerate(),
    reset: () => {
      replaceChat(null);
      refine('');
    },
  };
}

export type AgenticSearch = ReturnType<typeof useAgenticSearch>;
