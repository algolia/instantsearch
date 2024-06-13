import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { page } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '02022fd5de7c24bcde770bfab52ea473'
);

const search = instantsearch({
  indexName: 'devcon22_bm_products',
  searchClient,
  insights: true,
});

search.addWidgets([
  page({
    container: '#page',
  }),
  page({
    container: document.createElement('div'),
    id: '5173cac0-e9cd-4f30-bea4-a298968fae0c',
  }),
  page({
    container: document.createElement('div'),
    path: 'stuff/puff',
  }),
]);

window.search = search;

search.start();
