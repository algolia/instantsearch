import { Hit as AlgoliaHit } from '@algolia/client-search';
import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-hooks';

import {
  Configure,
  HierarchicalMenu,
  Hits,
  Pagination,
  Panel,
  RefinementList,
  SearchBox,
  SortBy,
} from './components';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
    price: number;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <>
      <span
        className="Hit-label"
        dangerouslySetInnerHTML={{
          __html: (hit._highlightResult as any).name.value,
        }}
      />
      <span className="Hit-price">${hit.price}</span>
    </>
  );
}

export function App() {
  return (
    <InstantSearch searchClient={searchClient} indexName="instant_search">
      <Configure hitsPerPage={15} />

      <div className="Container">
        <div>
          <Panel header="Brands">
            <RefinementList
              attribute="brand"
              searchable={true}
              searchablePlaceholder="Search brands"
              showMore={true}
            />
          </Panel>
          <Panel header="Hierarchy">
            <HierarchicalMenu
              attributes={[
                'hierarchicalCategories.lvl0',
                'hierarchicalCategories.lvl1',
                'hierarchicalCategories.lvl2',
              ]}
              showMore={true}
            />
          </Panel>
        </div>
        <div className="Search">
          <div className="Search-header">
            <SearchBox placeholder="Search" />
            <SortBy
              items={[
                { label: 'Relevance', value: 'instant_search' },
                { label: 'Price (asc)', value: 'instant_search_price_asc' },
                { label: 'Price (desc)', value: 'instant_search_price_desc' },
              ]}
            />
          </div>
          <Hits hitComponent={Hit} />
          <Pagination className="Pagination" />
        </div>
      </div>
    </InstantSearch>
  );
}
