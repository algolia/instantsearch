import { searchBox as searchBoxWidget } from 'instantsearch.js';
export const searchBox = searchBoxWidget({
  container: '[data-widget="searchbox"]',
  placeholder: 'Articles, categories or authors',
  showSubmit: false,
});
