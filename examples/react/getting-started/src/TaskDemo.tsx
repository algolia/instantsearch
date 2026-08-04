import React, { useState } from 'react';
import { PromptSuggestionsStandalone, useTask } from 'react-instantsearch';

/**
 * Task APIs **outside** `<InstantSearch>`.
 *
 * There is no `<InstantSearch>` provider and no widget tree here — this section
 * is deliberately rendered above the search app. It shows the two standalone
 * surfaces so you can compare them against their in-InstantSearch counterparts
 * (the connected `<PromptSuggestions>` further down the page):
 *
 *   1. `PromptSuggestionsStandalone` — the ready-made domain widget: task engine
 *      + the same shared UI the connected widget renders, wired to props.
 *   2. `useTask` — the generic, domain-free engine hook. Raw
 *      `output`/`isLoading`/`error` + `submit`/`reset`; you own the markup.
 *
 * The connected counterparts live in the search app below: `<PromptSuggestions>`
 * (the connected domain widget) and `<SearchSummary>` (the generic
 * `createTaskConnector` template used directly via `useConnector`).
 */

// The public Algolia demo credentials (same app as the search example below).
const APP_ID = 'latency';
const API_KEY = '6be0576ff61c053d5f9a3225e2a90f76';

export function TaskDemo() {
  const [agentId, setAgentId] = useState(
    'eedef238-5468-470d-bc37-f99fa741bd25'
  );
  const [configurationId, setConfigurationId] = useState('');
  const [query, setQuery] = useState('shoes');

  return (
    <section
      style={{
        border: '2px dashed #5468ff',
        borderRadius: 8,
        padding: 16,
        margin: 16,
      }}
    >
      <h2 style={{ marginTop: 0 }}>
        Task APIs <small>(standalone — no InstantSearch)</small>
      </h2>

      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <label>
          Agent id
          <input
            value={agentId}
            onChange={(event) => setAgentId(event.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Configuration (task) id
          <input
            value={configurationId}
            placeholder="paste a prompt-suggestions configuration id"
            onChange={(event) => setConfigurationId(event.target.value)}
            style={{ width: '100%' }}
          />
        </label>
        <label>
          Query (sent as context / task variable)
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ width: '100%' }}
          />
        </label>
      </div>

      <h3>1. Standalone widget — {'<PromptSuggestionsStandalone>'}</h3>
      {configurationId ? (
        <PromptSuggestionsStandalone
          appId={APP_ID}
          apiKey={API_KEY}
          agentId={agentId}
          configurationId={configurationId}
          context={{ query }}
          // No sibling chat widget standalone — handle the click ourselves.
          onSuggestionClick={(prompt) => window.alert(prompt)}
        />
      ) : (
        <p style={{ color: '#666' }}>
          Paste a configuration id above to fetch suggestions.
        </p>
      )}

      <h3>2. Generic engine — useTask()</h3>
      <TaskEngineDemo
        agentId={agentId}
        configurationId={configurationId}
        query={query}
      />
    </section>
  );
}

/**
 * The generic, domain-free task engine. `useTask` builds an InstantSearch-free
 * controller from plain credentials and returns its raw state; you call
 * `submit(variables)` and render `output` however you like.
 */
function TaskEngineDemo({
  agentId,
  configurationId,
  query,
}: {
  agentId: string;
  configurationId: string;
  query: string;
}) {
  const { output, isLoading, error, submit, reset } = useTask({
    appId: APP_ID,
    apiKey: API_KEY,
    agentId,
    task: configurationId,
  });

  if (!configurationId) {
    return (
      <p style={{ color: '#666' }}>
        Paste a configuration id above to run the task.
      </p>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => submit({ query })}
        >
          {isLoading ? 'Running…' : 'Run task'}
        </button>
        <button type="button" onClick={() => reset()}>
          Reset
        </button>
      </div>
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
        {output ? JSON.stringify(output, null, 2) : '(no output yet)'}
      </pre>
    </div>
  );
}
