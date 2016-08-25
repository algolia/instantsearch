import React from 'react';
import instantsearch from '../src/core/instantsearchV2';

const search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  urlSync: true,
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#searchbox',
  })
);

search.addWidget(
  instantsearch.widgets.customSearchBox({
    container: '#custom-searchbox',
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    itemComponent: hit => <div>{JSON.stringify(hit)}</div>,
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
  })
);
