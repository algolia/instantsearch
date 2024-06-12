import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { layout } from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

search.addWidgets([
  layout({
    containers: '[data-layout-id]',
  }),
]);
