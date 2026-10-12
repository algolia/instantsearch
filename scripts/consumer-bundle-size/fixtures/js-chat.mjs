import instantsearch from 'instantsearch.js';
import { chat, hits, searchBox } from 'instantsearch.js/es/widgets';

import { searchClient } from './search-client.mjs';

const search = instantsearch({
  indexName: 'example-index',
  searchClient,
});

search.addWidgets([
  searchBox({ container: '#searchbox' }),
  hits({ container: '#hits' }),
  chat({
    container: '#chat',
    agentId: 'example-agent',
  }),
]);

search.start();
