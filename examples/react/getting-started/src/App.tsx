import algoliasearch from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  SearchBox,
  DynamicWidgets,
  CurrentRefinements,
} from 'react-instantsearch';

import { Panel } from './Panel';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export function App() {
  const [showFilters, setShowFilters] = React.useState(true);

  const queryParameters = new URLSearchParams(window.location.search);
  const disposeMode = queryParameters.get('disposeMode') || 'searchParameters';

  return (
    <div>
      <header className="header">
        <h1 className="header-title">Current dispose mode: {disposeMode}</h1>
        <p className="header-subtitle">
          <a
            href={`?disposeMode=${
              disposeMode === 'searchParameters'
                ? 'uiState'
                : 'searchParameters'
            }`}
          >
            Switch
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          insights={true}
          disposeMode={disposeMode}
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <button onClick={() => setShowFilters(!showFilters)}>
                Toggle filters
              </button>
              {showFilters && (
                <DynamicWidgets fallbackComponent={FallbackComponent} />
              )}
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <CurrentRefinements />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
            </div>
            <div className="search-panel__filters">
              <DynamicWidgets fallbackComponent={FallbackComponent} />
            </div>
          </div>
        </InstantSearch>
      </div>
    </div>
  );
}

type HitProps = {
  hit: Hit;
};

function HitComponent({ hit }: HitProps) {
  return (
    <article>
      <h1>
        <Highlight attribute="name" hit={hit} />
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
    </article>
  );
}

function FallbackComponent({ attribute }: any) {
  return (
    <Panel header={attribute}>
      <RefinementList attribute={attribute} />
    </Panel>
  );
}
