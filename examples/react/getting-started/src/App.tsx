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
  SearchBox,
  RefinementSuggestions,
  TrendingItems,
  Carousel,
  Chat,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  'f33fd36eb0c251c553e3cd7684a6ba33'
);

export function App() {
  return (
    <div>
      <header className="header">
        <h1 className="header-title">
          <a href="/">Getting started</a>
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
          insights={true}
        >
          <Configure hitsPerPage={8} facets={['brand', 'categories']} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />

              {/* Suggested refinements below search box */}
              <RefinementSuggestions
                agentId="b9f41bec-4acc-4996-a382-43877604c023"
                attributes={['brand', 'categories']}
                maxSuggestions={3}
              />

              <Hits hitComponent={HitComponent} />

              <div className="pagination">
                <Pagination />
              </div>
              <div>
                <TrendingItems
                  itemComponent={ItemComponent}
                  limit={6}
                  layoutComponent={Carousel}
                />
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
