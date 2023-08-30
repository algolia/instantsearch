'use client';

import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, hits, searchBox } from 'instantsearch.js/es/widgets';
import React from 'react';
import { Hits, SearchBox } from 'react-instantsearch';

import {
  InstantSearchNextJsSSRProvider,
  getServerStateFromSearch,
} from '@/ssr';

export const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export const search = instantsearch({
  searchClient,
  indexName: 'instant_search',
  initialUiState: {
    instant_search: { query: 'iphone' },
  },
});
// @ts-expect-error
search.addWidgets([configure({ hitsPerPage: 1 }), searchBox(), hits()]);
search.start();

export default async function Home() {
  const initialResults = await getServerStateFromSearch(search);

  return (
    <main>
      <h1>React InstantSearch</h1>
      <InstantSearchNextJsSSRProvider
        // SSR Provider Props
        search={search}
        initialResults={initialResults}
        // InstantSearch Props
        searchClient={searchClient}
        indexName="instant_search"
      >
        <SearchBox />
        <Hits />
      </InstantSearchNextJsSSRProvider>
    </main>
  );
}
