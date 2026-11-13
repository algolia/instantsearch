import { clearRefinements } from 'instantsearch.js';
export const createClearFilters = ({ container }: { container: string }) =>
  clearRefinements({
    container,
    excludedAttributes: ['categories', 'query'],
    templates: {
      resetLabel() {
        return 'Clear filters';
      },
    },
  });
