import {
  InstantSearch,
  SearchBox,
  InfiniteHits,
} from 'react-instantsearch/dom';

import React from 'react';

export default function InfinitHitsSample() {
  return (
    <InstantSearch
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="airbnb"
    >
      <div>
        <SearchBox/>
        <InfiniteHits />
      </div>
    </InstantSearch>
  );
}
