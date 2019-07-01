import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';

import {
  articles,
  categories,
  clearFilters,
  configuration,
  dates,
  locations,
  searchBox,
  selectedTopics,
  stats,
  sortBy,
  topics,
} from './widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  searchClient,
  indexName: 'instant_search_media',
  routing: true,
});

search.addWidgets([
  articles,
  categories,
  clearFilters,
  configuration,
  dates,
  locations,
  searchBox,
  selectedTopics,
  sortBy,
  stats,
  topics,
]);

export default search;
