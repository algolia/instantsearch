import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  brands,
  categories,
  clearFilters,
  clearFiltersEmptyState,
  configuration,
  freeShipping,
  products,
  hitsPerPage,
  pagination,
  priceSlider,
  ratings,
  clearFiltersMobile,
  resultsNumberMobile,
  saveFiltersMobile,
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
  clearFiltersEmptyState,
  resultsNumberMobile,
  brands,
  categories,
  priceSlider,
  freeShipping,
  ratings,
  sortBy,
  hitsPerPage,
  products,
  pagination,
  clearFiltersMobile,
  saveFiltersMobile,
]);

export default search;
