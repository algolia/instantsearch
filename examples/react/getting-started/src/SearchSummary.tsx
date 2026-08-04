import { createTaskConnector } from 'instantsearch.js/es/connectors/tasks/createTaskConnector';
import React from 'react';
import { useConnector } from 'react-instantsearch';

/**
 * Using the **generic task connector template** (`createTaskConnector`) directly.
 *
 * This is the connected, in-`<InstantSearch>` counterpart to the standalone
 * `useTask` hook — and the intended extension path for new task-backed widgets.
 * `connectPromptSuggestions` is itself just a call to this template; here we
 * build a throwaway "search summary" connector the same way to show the full
 * util → connector → `useConnector` → component path.
 *
 * What the template gives you for free (you supply only the domain half below):
 *   - resolves `appId`/`apiKey` from the search client at `init`
 *   - drives a headless, render-state-less `connectTasks` widget off the search
 *     cycle, so the task auto-refetches (debounced) whenever `getInput` changes
 *   - repaints only this widget's subtree on each streamed delta
 *   - exposes `isLoading` / `error` / `refresh` and disposes the controller
 */

type SearchSummaryParams = {
  agentId: string;
  /** Task (configuration) id sent as the `task` field. */
  task: string;
};

type SearchSummaryRenderState = {
  /** Latest raw (unwrapped) task output, or `undefined` before the first resolve. */
  output: Record<string, unknown> | undefined;
  isLoading: boolean;
  error: Error | undefined;
  /** Imperative refetch that bypasses the debounce. */
  refresh: () => void;
};

type SearchSummaryWidgetDescription = {
  $$type: 'example.searchSummary';
  renderState: SearchSummaryRenderState;
  indexRenderState: {
    searchSummary: SearchSummaryRenderState & {
      widgetParams: SearchSummaryParams;
    };
  };
};

// The domain half — everything specific to *this* task widget. The template
// owns the controller lifecycle, the search-drive, and the repaint.
const connectSearchSummary = createTaskConnector<
  SearchSummaryWidgetDescription,
  SearchSummaryParams,
  Record<string, unknown>
>({
  connectorName: 'searchSummary',
  $$type: 'example.searchSummary',
  renderStateKey: 'searchSummary',
  // Auto-refetch is debounced so it doesn't fire on every keystroke.
  debounce: 400,
  getControllerOptions(widgetParams) {
    return { agentId: widgetParams.agentId, task: widgetParams.task };
  },
  // Map the live search state → task input. Returning `null` clears the output
  // without firing a request (here: when there's no query to summarize).
  getInput() {
    return (renderOptions) => {
      const query = renderOptions.state.query;
      return query ? { query } : null;
    };
  },
  // Project the generic engine state into this widget's render state.
  getWidgetRenderState({ output, isLoading, error, refresh }) {
    return { output, isLoading, error, refresh };
  },
});

function useSearchSummary(props: SearchSummaryParams) {
  return useConnector<SearchSummaryParams, SearchSummaryWidgetDescription>(
    connectSearchSummary,
    props,
    { $$widgetType: 'example.searchSummary' }
  );
}

export function SearchSummary({ agentId, task }: SearchSummaryParams) {
  const { output, isLoading, error, refresh } = useSearchSummary({
    agentId,
    task,
  });

  return (
    <div>
      <button type="button" disabled={isLoading} onClick={() => refresh()}>
        {isLoading ? 'Summarizing…' : 'Refresh summary'}
      </button>
      {error && <p style={{ color: '#c00' }}>Error: {error.message}</p>}
      <pre
        style={{
          background: '#f5f5f7',
          padding: 8,
          borderRadius: 4,
          overflow: 'auto',
          maxHeight: 200,
        }}
      >
        {output
          ? JSON.stringify(output, null, 2)
          : '(type in the search box to summarize)'}
      </pre>
    </div>
  );
}
