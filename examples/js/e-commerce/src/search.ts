import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { createInsightsMiddleware } from 'instantsearch.js/es/middlewares';
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
import getRouting from './routing';
import { customHits } from './widgets/CustomHits';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  searchClient,
  indexName: 'instant_search',
  routing: getRouting({ indexName: 'instant_search' }),
});

const insightsMiddleware = createInsightsMiddleware({
  insightsClient: (window as any).aa,
  insightsInitParams: {
    useCookie: true,
  },
});

search.use(insightsMiddleware);

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
  // customHits({ container: document.querySelector('[data-widget="hits"]') }),
]);

export default search;
