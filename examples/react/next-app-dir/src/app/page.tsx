import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, searchBox } from 'instantsearch.js/es/widgets';
import React from 'react';

import { InstantSearchNextJsSSRProvider } from '@/ssr';
import { Hits, InstantSearch, SearchBox } from 'react-instantsearch';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  searchClient,
  indexName: 'instant_search',
  initialUiState: {
    instant_search: { query: 'foo' },
  },
});
const searchbox = searchBox({});
search.addWidgets([
  configure({ hitsPerPage: 1 }),
  searchbox,
  // hits({}),
]);

export default function Home() {
  return (
    <main>
      <h1>Hello world</h1>
      {/* <InstantSearchNextJsSSRProvider search={search}>
        <p>Children of NextJsSSRProvider</p>
      </InstantSearchNextJsSSRProvider> */}
    </main>
  );
}
