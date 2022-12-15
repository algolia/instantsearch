import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js/es';
import { configure, hits, searchBox } from 'instantsearch.js/es/widgets';

import {  } from '../src';

const search = instantsearch({
  indexName: 'instant_search',
  searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
});

search.addWidgets([
  ({ container: '#example' }),

  searchBox({ container: '#search-box' }),
  configure({
    attributesToSnippet: ['description:10'],
    snippetEllipsisText: '[…]',
  }),
  hits({
    container: '#hits',
    templates: {
      item: `
      <p>
        
      </p>
      <small>
        
      </small>
    `,
    },
  }),
]);

search.start();
