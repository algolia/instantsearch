import React from 'react';
import { createRoot } from 'react-dom/client';
import { Hits, InstantSearch, SearchBox } from 'react-instantsearch';

import { searchClient } from './search-client.mjs';

createRoot(document.getElementById('root')).render(
  React.createElement(
    InstantSearch,
    { indexName: 'example-index', searchClient },
    React.createElement(SearchBox),
    React.createElement(Hits)
  )
);
