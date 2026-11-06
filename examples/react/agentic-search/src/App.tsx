import React from 'react';
import {
  CurrentRefinements,
  InstantSearch,
  useInstantSearch,
} from 'react-instantsearch';

import { useAgenticSearch } from './agent/useAgenticSearch';
import { PRESET } from './backend';
import { AgentPanel, describeAgentTurn } from './components/AgentPanel';
import { Facets } from './components/Facets';
import { LiveAnnouncer } from './components/LiveAnnouncer';
import { Results } from './components/Results';
import { SearchBar } from './components/SearchBar';
import { searchClient } from './searchClient';

import './App.css';

function Page() {
  const agent = useAgenticSearch();
  const { results, status } = useInstantSearch();

  const announcement = agent.isAgentic
    ? describeAgentTurn(agent)
    : status === 'idle'
      ? `${results?.nbHits ?? 0} ${results?.nbHits === 1 ? 'product' : 'products'}`
      : '';

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="./">
          <span className="brand-mark" aria-hidden="true">
            ◐
          </span>
          {PRESET.storeName}
        </a>
        <span className="poc-tag">{PRESET.tag}</span>
      </header>

      <SearchBar agent={agent} />

      <div className="layout">
        <Facets />
        <main className="main">
          <CurrentRefinements
            classNames={{
              root: 'refinements',
              noRefinementRoot: 'is-hidden',
            }}
          />
          {agent.isAgentic ? <AgentPanel agent={agent} /> : <Results />}
        </main>
      </div>

      <LiveAnnouncer message={announcement} />
    </div>
  );
}

export function App() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName={PRESET.indexName}
      insights={false}
      future={{ preserveSharedStateOnUnmount: true }}
    >
      <Page />
    </InstantSearch>
  );
}
