import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { layout } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '02022fd5de7c24bcde770bfab52ea473'
);

const search = instantsearch({
  indexName: 'products',
  searchClient,
  insights: true,
});

search.addWidgets([
  layout({
    container: '#layout',
  }),
]);

window.search = search;

search.start();
