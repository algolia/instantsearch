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
  TrendingItems,
  Carousel,
  Chat,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/satellite.css';

import './App.css';

const appId = 'F4T6CUV2AH';
const apiKey = 'f33fd36eb0c251c553e3cd7684a6ba33';
const agentId = '6711d1bb-32fb-46ee-9708-ffc7fd6425b5';

const searchClient = algoliasearch(appId, apiKey);

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
          <Configure hitsPerPage={8} />
          <div className="search-panel">
            <div className="search-panel__filters">
              <Panel header="brand">
                <RefinementList attribute="brand" />
              </Panel>
              <Panel header="category">
                <RefinementList attribute="categories" />
              </Panel>
              <Panel header="price range">
                <RefinementList attribute="price_range" />
              </Panel>
            </div>

            <div className="search-panel__results">
              <SearchBox placeholder="" className="searchbox" />
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
            itemComponent={ItemComponent}
            transport={{
              api: `http://localhost:8000/1/agents/${agentId}/completions?compatibilityMode=ai-sdk-5`,
              headers: {
                'x-algolia-application-id': appId,
                'x-algolia-api-Key': apiKey,
              },
            }}
            transformItems={{
              suggestedFilters: (items) =>
                items.map((item) => {
                  const attributeLabels: Record<string, string> = {
                    'hierarchicalCategories.lvl3': 'Category',
                    'vakgebied.lvl1': 'Field',
                    categories: 'Categories',
                  };
                  return {
                    ...item,
                    label: attributeLabels[item.attribute] || item.attribute,
                  };
                }),
            }}
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
