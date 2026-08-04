import { createPromptSuggestionsComponent } from 'instantsearch-ui-components';
import { parseSuggestions } from 'instantsearch.js/es/connectors/prompt-suggestions/parseSuggestions';
import React, { createElement, Fragment, useEffect, useMemo } from 'react';
import { useTask } from 'react-instantsearch-core';

import type {
  PromptSuggestionsOwnProps,
  Pragma,
} from 'instantsearch-ui-components';
import type { TaskTransport } from 'instantsearch.js/es/lib/tasks';

const PromptSuggestionsUi = createPromptSuggestionsComponent({
  createElement: createElement as Pragma,
  Fragment,
});

// The UI props this component owns and drives from the task engine — callers
// supply everything else (`classNames`, `translations`, `headerComponent`, …).
type OwnedUiProps = 'suggestions' | 'isLoading' | 'onSuggestionClick';

/** Either explicit Algolia credentials, or a custom `transport`. */
type PromptSuggestionsStandaloneSource =
  | {
      /** Algolia application id. */
      appId: string;
      /** Algolia (search) API key. */
      apiKey: string;
      /** Agent Studio agent id. */
      agentId: string;
      transport?: never;
    }
  | {
      /** Custom transport. When set, credentials are ignored. */
      transport: TaskTransport;
      appId?: never;
      apiKey?: never;
      agentId?: never;
    };

export type PromptSuggestionsStandaloneProps = Omit<
  PromptSuggestionsOwnProps,
  OwnedUiProps
> &
  PromptSuggestionsStandaloneSource & {
    /**
     * Agent Studio configuration to invoke, sent as the task `task` field.
     * Identifies the prompt-suggestions configuration created in the dashboard.
     */
    configurationId: string;
    /**
     * Task input forwarded to the agent as context. Standalone has no search
     * state to derive this from, so it is supplied directly; the suggestions
     * are (re)fetched whenever it changes.
     */
    context?: Record<string, unknown>;
    /** Called with the prompt when a suggestion pill is clicked. */
    onSuggestionClick: (prompt: string) => void;
  };

/**
 * Prompt suggestions with **no `<InstantSearch>` provider** — the standalone
 * counterpart of {@link PromptSuggestions}.
 *
 * It bundles the task engine and the shared UI: `useTask` drives an
 * InstantSearch-free `TaskController` from the credentials you pass, its output
 * is parsed by the same `parseSuggestions` the connector uses, and the result
 * is rendered with the same `createPromptSuggestionsComponent` UI as the
 * connected widget. The only things a caller wires by hand are the credentials,
 * the `context` (there is no search state to derive it from), and
 * `onSuggestionClick` (there is no sibling chat widget to hand off to).
 *
 * Inside `<InstantSearch>`, use {@link PromptSuggestions} instead — it resolves
 * credentials from the search client and derives its context from the results.
 */
export function PromptSuggestionsStandalone({
  appId,
  apiKey,
  agentId,
  transport,
  configurationId,
  context,
  onSuggestionClick,
  classNames = {},
  ...uiProps
}: PromptSuggestionsStandaloneProps) {
  const { output, isLoading, submit } = useTask({
    appId,
    apiKey,
    agentId,
    transport,
    task: configurationId,
  });

  // `submit` is stable per controller (recreated only when credentials/task
  // change); re-submit whenever the caller-supplied context changes. `context`
  // is serialized into the key so a new object with equal contents doesn't
  // refetch on every render.
  const contextKey = JSON.stringify(context ?? {});
  useEffect(() => {
    submit(context ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submit, contextKey]);

  const suggestions = useMemo(() => parseSuggestions(output), [output]);

  return (
    <PromptSuggestionsUi
      {...uiProps}
      classNames={classNames}
      suggestions={suggestions}
      isLoading={isLoading}
      onSuggestionClick={onSuggestionClick}
    />
  );
}
