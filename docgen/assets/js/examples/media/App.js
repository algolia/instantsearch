import React from 'react';

import {
  InstantSearch,
  SearchBox,
  Hits,
} from 'react-instantsearch';

export default function App() {
  return <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="movies"
  >
    <div>
      <SearchBox />
      <Hits />
    </div>
  </InstantSearch>;
}
