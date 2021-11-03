import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

import {
  articles,
  createAuthors,
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
  routing: { stateMapping: singleIndex('PROD_algolia_blog') },
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
const authorsDesktop = createAuthors({
  container: '[data-widget="categories-desktop"]',
});
const authorsMobile = createAuthors({
  container: '[data-widget="categories-mobile"]',
});

search.addWidgets([
  articles,
  authorsDesktop,
  authorsMobile,
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
