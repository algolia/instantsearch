import React from 'react';
import {
  InstantSearch,
  InstantSearchSSRProvider,
  Index,
} from 'react-instantsearch-hooks';
import { simple } from 'instantsearch.js/es/lib/stateMappings';
import { history } from 'instantsearch.js/es/lib/routers';

import { searchClient } from './searchClient';

import {
  Configure,
  Highlight,
  Hits,
  Pagination,
  RefinementList,
  SearchBox,
} from './components';

function Hit({ hit }) {
  return <Highlight hit={hit} attribute="name" />;
}

function App({ serverState, location }) {
  return (
    <InstantSearchSSRProvider {...serverState}>
      <InstantSearch
        indexName="instant_search"
        searchClient={searchClient}
        routing={{
          stateMapping: simple(),
          router: history({
            getLocation() {
              if (typeof window === 'undefined') {
                return location;
              }

              return window.location;
            },
          }),
        }}
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
