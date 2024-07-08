import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { page } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '02022fd5de7c24bcde770bfab52ea473'
);

const search = instantsearch({
  indexName: 'fx_hackathon_24_bm_products',
  searchClient,
  insights: true,
});

search.addWidgets([page({ container: '#page' })]);

search.start();
