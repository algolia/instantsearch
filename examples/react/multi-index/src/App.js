import React from 'react';
import { InstantSearch, Hits, SearchBox, Index } from 'react-instantsearch/dom';

const App = () => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="airbnb"
  >
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
