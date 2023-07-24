import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import { InstantSearch, Hits, SearchBox, Index } from 'react-instantsearch-dom';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const App = () => (
  <InstantSearch searchClient={searchClient} indexName="airbnb">
    <SearchBox />
    <p>Results in first dataset</p>
    <Hits />
    <Index indexName="instant_search">
      <p>Results in second dataset</p>
      <Hits />
    </Index>
  </InstantSearch>
);

export default App;
