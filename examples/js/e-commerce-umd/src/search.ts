import { liteClient as algoliasearch } from 'algoliasearch/lite';

import getRouting from './routing';
import {
  brands,
  categories,
  clearFilters,
  clearFiltersEmptyResults,
  clearFiltersMobile,
  configuration,
  freeShipping,
  hitsPerPage,
  pagination,
  priceSlider,
  products,
  ratings,
  resultsNumberMobile,
  saveFiltersMobile,
  searchBox,
  sortBy,
} from './widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = window.instantsearch({
  searchClient,
  indexName: 'instant_search',
  routing: getRouting({ indexName: 'instant_search' }),
  insights: true,
});

search.addWidgets([
  brands,
  categories,
  clearFilters,
  clearFiltersEmptyResults,
  clearFiltersMobile,
  configuration,
  freeShipping,
  hitsPerPage,
  pagination,
  priceSlider,
  products,
  ratings,
  resultsNumberMobile,
  saveFiltersMobile,
  searchBox,
  sortBy,
]);

export default search;
