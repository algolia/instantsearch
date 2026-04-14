import { panel, refinementList } from 'instantsearch.js/es/widgets';

import { collapseButtonText } from '../templates/panel';

const typeRefinementList = panel<typeof refinementList>({
  templates: {
    header() {
      return 'Types';
    },
    collapseButtonText,
  },
  collapsed: () => false,
})(refinementList);

export const types = typeRefinementList({
  container: '[data-widget="types"]',
  attribute: 'type',
});
