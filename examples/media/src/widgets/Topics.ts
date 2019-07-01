import { refinementList } from 'instantsearch.js/es/widgets';

export const topics = refinementList({
  container: '[data-widget="topics"]',
  attribute: 'topics',
  limit: 5,
});
