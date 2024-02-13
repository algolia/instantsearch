import { clearRefinements } from 'instantsearch.js/es/widgets';

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
