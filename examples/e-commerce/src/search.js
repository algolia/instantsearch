import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  brands,
  categories,
  clearFilters,
  configuration,
  freeShipping,
  products,
  hitsPerPage,
  pagination,
  priceSlider,
  ratings,
  searchBox,
  sortBy,
} from './widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  searchClient,
  indexName: 'instant_search',
  routing: true,
});

search.addWidgets([
  configuration,
  searchBox,
  clearFilters,
  brands,
  categories,
  priceSlider,
  freeShipping,
  ratings,
  sortBy,
  hitsPerPage,
  products,
  pagination,
]);

export default search;
