import { history } from 'instantsearch.js/cjs/lib/routers';
import { simple } from 'instantsearch.js/cjs/lib/stateMappings';
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
} from 'react-instantsearch-hooks-web';
// because this is ran on node without type: "module" set in the package.json
// we need to use commonjs instead of esm.
// If you use ESM in Node, you can rely on these import statements instead:
// import { simple } from 'instantsearch.js/es/lib/stateMappings';
// import { history } from 'instantsearch.js/es/lib/routers';

import { searchClient } from './searchClient';

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
