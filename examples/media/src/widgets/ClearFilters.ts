import { clearRefinements } from 'instantsearch.js/es/widgets';

export const createClearFilters = ({ container }) =>
  clearRefinements({
    container,
    excludedAttributes: ['categories', 'query'],
    templates: {
      resetLabel: 'Clear filters',
    },
  });
