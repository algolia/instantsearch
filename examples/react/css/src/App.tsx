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
  HierarchicalMenu,
  RangeInput,
  ToggleRefinement,
  CurrentRefinements,
  ClearRefinements,
  HitsPerPage,
  Breadcrumb,
  Snippet,
} from 'react-instantsearch';

import { Panel } from './Panel';

import 'instantsearch.css/themes/algolia.css';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export function App() {
  return (
    <InstantSearch
      searchClient={searchClient}
      indexName="instant_search"
      insights={true}
    >
      <Configure hitsPerPage={8} snippetEllipsisText="…" />
      <div className="container two-columns">
        <div>
          <Panel header="categories">
            <HierarchicalMenu
              attributes={[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]}
            />
          </Panel>
          <Panel header="brand">
            <RefinementList attribute="brand" />
          </Panel>
          <Panel header="price">
            <RangeInput attribute="price" />
          </Panel>
          <Panel header="Shipping">
            <ToggleRefinement
              attribute="free_shipping"
              label="Free shipping?"
            />
          </Panel>
        </div>
        <main>
          <SearchBox placeholder="Search for products…" />
          <Breadcrumb
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
          <CurrentRefinements />
          <ClearRefinements />
          <HitsPerPage
            items={[
              {
                label: '16 hits per page',
                value: 16,
                default: true,
              },
              {
                label: '32 hits per page',
                value: 32,
              },
              {
                label: '64 hits per page',
                value: 64,
              },
            ]}
          />
          <Hits hitComponent={HitComponent} />
          <Pagination />
          <TrendingItems
            itemComponent={ItemComponent}
            limit={6}
            layoutComponent={Carousel}
          />
        </main>
      </div>
    </InstantSearch>
  );
}

function HitComponent({ hit }: { hit: Hit }) {
  return Item({ hit });
}

function ItemComponent({ item }: { item: Hit }) {
  return Item({ hit: item });
}

function Item({ hit }: { hit: Hit }) {
  return (
    <article>
      <img src={hit.image} />
      <h2>
        <a href={`/products.html?pid=${hit.objectID}`}>
          <Highlight attribute="name" hit={hit} />
        </a>
      </h2>
      <p>
        <Snippet attribute="description" hit={hit} />
      </p>
      <a href={`/products.html?pid=${hit.objectID}`}>See product</a>
    </article>
  );
}
