import { Hit as AlgoliaHit } from '@algolia/client-search';
import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch } from 'react-instantsearch-hooks';

import {
  Configure,
  Hits,
  Pagination,
  RefinementList,
  SearchBox,
} from './components';

import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

type HitProps = {
  hit: AlgoliaHit<{
    name: string;
  }>;
};

function Hit({ hit }: HitProps) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: (hit._highlightResult as any).name.value,
      }}
    />
  );
}

export function App() {
  return (
    <InstantSearch searchClient={searchClient} indexName="instant_search">
      <Configure hitsPerPage={15} />

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
            attribute="brand"
            searchable={true}
            searchablePlaceholder="Search brands"
            showMore={true}
          />
        </div>
        <div style={{ display: 'grid', gap: '.5rem' }}>
          <SearchBox placeholder="Search" />
          <Hits hitComponent={Hit} />
          <Pagination className="Pagination" />
        </div>
      </div>
    </InstantSearch>
  );
}
