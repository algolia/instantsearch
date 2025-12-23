import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit } from 'instantsearch.js';
import React from 'react';
import {
  Configure,
  Highlight,
  Hits,
  InstantSearch,
  Pagination,
  RefinementList,
  EXPERIMENTAL_Autocomplete,
  Chat,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Query suggestions</a>
        </h1>
        <p className="header-subtitle">
          using{' '}
          <a href="https://github.com/algolia/instantsearch/tree/master/packages/react-instantsearch">
            React InstantSearch
          </a>
        </p>
      </header>

      <div className="container">
        <InstantSearch
          searchClient={searchClient}
          indexName="instant_search"
          routing={true}
          insights={true}
        >
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <EXPERIMENTAL_Autocomplete
                placeholder="Search for products"
                indices={[
                  {
                    indexName: 'instant_search',
                    headerComponent: () => (
                      <>
                        <span className="ais-AutocompleteIndexHeaderTitle">
                          Products
                        </span>
                        <span className="ais-AutocompleteIndexHeaderLine" />
                      </>
                    ),
                    itemComponent: ({ item, onSelect }) => (
                      <div onClick={onSelect}>{item.name}</div>
                    ),
                    getURL: (item) => `/products.html?pid=${item.objectID}`,
                  },
                ]}
                showRecent={{
                  headerComponent: () => (
                    <>
                      <span className="ais-AutocompleteIndexHeaderTitle">
                        Recent Searches
                      </span>
                      <span className="ais-AutocompleteIndexHeaderLine" />
                    </>
                  ),
                }}
                showSuggestions={{
                  indexName: 'instant_search_demo_query_suggestions',
                  headerComponent: () => (
                    <>
                      <span className="ais-AutocompleteIndexHeaderTitle">
                        Suggestions
                      </span>
                      <span className="ais-AutocompleteIndexHeaderLine" />
                    </>
                  ),
                }}
              />
              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
            </div>
          </div>

          <Chat
            agentId="7c2f6816-bfdb-46e9-a51f-9cb8e5fc9628"
            itemComponent={ItemComponent}
          />
        </InstantSearch>
      </div>
    </div>
  );
}

type HitType = Hit<{
  image: string;
  name: string;
  description: string;
}>;

function HitComponent({ hit }: { hit: HitType }) {
  return (
    <article>
      <h1>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h1>
      <p>
        <Highlight attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}

function ItemComponent({ item }: { item: Hit }) {
  return (
    <article className="ais-Carousel-hit">
      <div className="ais-Carousel-hit-image">
        <img src={item.image} />
      </div>
      <h2 className="ais-Carousel-hit-title">
        <a
          href={`/products.html?pid=${item.objectID}`}
          className="ais-Carousel-hit-link"
        >
          {item.name}
        </a>
      </h2>
    </article>
  );
}
