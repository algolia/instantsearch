import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import ReactDOM from 'react-dom';
import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';

import {  } from '../src';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

ReactDOM.render(
  <React.StrictMode>
    <InstantSearch indexName="instant_search" searchClient={searchClient}>
      < />
      <SearchBox />
      <Hits />
    </InstantSearch>
  </React.StrictMode>,
  document.getElementById('root')
);
