import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

import {
  articles,
  createCategories,
  createClearFilters,
  configuration,
  searchBox,
  createSelectedTopics,
  stats,
  topics,
  seeResults,
} from './widgets';

const searchClient = algoliasearch(
  '1QDAWL72TQ',
  '47700f55d95d23f5a57744b9a027ea83'
);

const search = instantsearch({
  searchClient,
  indexName: 'PROD_algolia_blog',
  routing: true,
});

const selectedTopicsDesktop = createSelectedTopics({
  container: '[data-widget="selected-topics-desktop"]',
});
const selectedTopicsMobile = createSelectedTopics({
  container: '[data-widget="selected-topics-mobile"]',
});
const clearFiltersDesktop = createClearFilters({
  container: '[data-widget="clear-filters-desktop"]',
});
const clearFiltersMobile = createClearFilters({
  container: '[data-widget="clear-filters-mobile"]',
});
const categoriesDesktop = createCategories({
  container: '[data-widget="categories-desktop"]',
});
const categoriesMobile = createCategories({
  container: '[data-widget="categories-mobile"]',
});

search.addWidgets([
  articles,
  categoriesDesktop,
  categoriesMobile,
  clearFiltersMobile,
  clearFiltersDesktop,
  configuration,
  searchBox,
  selectedTopicsMobile,
  selectedTopicsDesktop,
  stats,
  topics,
  seeResults,
]);

export default search;
