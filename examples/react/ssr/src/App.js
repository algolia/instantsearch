import {
  historyRouter as history,
  simpleStateMapping as simple,
} from 'instantsearch-core';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  Index,
  InstantSearch,
  InstantSearchSSRProvider,
  Pagination,
  RefinementList,
  SearchBox,
} from 'react-instantsearch';

import { searchClient } from './searchClient';

function Hit({ hit }) {
  return <Highlight hit={hit} attribute="name" />;
}

function App({ serverState, currentURL }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        indexName="instant_search"
        searchClient={searchClient}
        routing={{
          stateMapping: simple(),
          router: history({
            getCurrentURL() {
              if (typeof window === 'undefined') {
                return currentURL;
              }

              return new URL(window.location.href);
            },
          }),
        }}
        insights={true}
      >
        <Configure hitsPerPage={10} />

        <div
          style={{
            display: 'grid',
            alignItems: 'flex-start',
            gridTemplateColumns: '200px 1fr',
            gap: '0.5rem',
            maxWidth: 1000,
            margin: 'auto',
          }}
        >
          <div>
            <RefinementList
              attribute="brand"
              searchable={true}
              searchablePlaceholder="Search brands"
              showMore={true}
            />
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <SearchBox placeholder="Search" />
            <Hits hitComponent={Hit} />

            <Index indexName="instant_search_price_asc">
              <div
                style={{
                  display: 'grid',
                  alignItems: 'flex-start',
                  gridTemplateColumns: '200px 1fr',
                  gap: '0.5rem',
                }}
              >
                <div>
                  <RefinementList
                    attribute="categories"
                    searchable={true}
                    searchablePlaceholder="Search categories"
                    showMore={true}
                  />
                </div>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  <Hits hitComponent={Hit} />
                </div>
              </div>
            </Index>

            <Pagination />
          </div>
        </div>
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
}

export default App;
