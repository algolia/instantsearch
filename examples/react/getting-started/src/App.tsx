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
  useRefinementList,
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
                <Panel header="brand">
                  <RefinementList attribute="brand" />
                </Panel>
              )}
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
              <CustomBrandRefinementList />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
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

function CustomBrandRefinementList() {
  const { items } = useRefinementList({ attribute: 'brand' });
  const selectedItems = items
    .filter((item) => item.isRefined)
    .map((item) => item.label);

  return (
    <div
      style={{
        border: '1px solid gray',
        padding: '1rem',
        marginBottom: '1rem',
      }}
    >
      <pre>{`useRefinementList({ attribute: 'brand' })`}</pre>
      <small>
        <strong>Selected brands: </strong>{' '}
        {selectedItems.length ? selectedItems.join(', ') : 'none'}
      </small>
    </div>
  );
}
