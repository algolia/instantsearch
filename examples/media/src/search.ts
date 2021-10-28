import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

import {
  articles,
  createCategories,
  createClearFilters,
  configuration,
  createDates,
  createLocations,
  searchBox,
  createSelectedTopics,
  stats,
  sortByMobile,
  sortByDesktop,
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

const datesDesktop = createDates({
  container: '[data-widget="dates-desktop"]',
  header: 'Date',
});
const datesMobile = createDates({
  container: '[data-widget="dates-mobile"]',
  header: 'Upload Time',
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
const locationsDesktop = createLocations({
  container: '[data-widget="locations-desktop"]',
});
const locationsMobile = createLocations({
  container: '[data-widget="locations-mobile"]',
});

search.addWidgets([
  articles,
  categoriesDesktop,
  categoriesMobile,
  clearFiltersMobile,
  clearFiltersDesktop,
  configuration,
  // datesDesktop,
  // datesMobile,
  // locationsDesktop,
  // locationsMobile,
  searchBox,
  selectedTopicsMobile,
  selectedTopicsDesktop,
  // sortByMobile,
  // sortByDesktop,
  stats,
  topics,
  seeResults,
]);

export default search;
