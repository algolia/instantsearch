import { clearRefinements } from 'instantsearch.js/es/widgets';

export const clearFilters = clearRefinements({
  container: '[data-widget="clear-filters"]',
  excludedAttributes: ['topics', 'query'],
  templates: {
    resetLabel: 'Clear filters',
  },
});
