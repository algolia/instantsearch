import instantsearch from 'instantsearch.js';
import { hits, searchBox } from 'instantsearch.js/es/widgets';

import { searchClient } from './search-client.mjs';

const search = instantsearch({
  indexName: 'example-index',
  searchClient,
});

search.addWidgets([
  searchBox({ container: '#searchbox' }),
  hits({ container: '#hits' }),
]);

search.start();
