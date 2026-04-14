import { panel, refinementList } from 'instantsearch.js/es/widgets';

import { collapseButtonText } from '../templates/panel';

const labelRefinementList = panel<typeof refinementList>({
  templates: {
    header() {
      return 'Labels';
    },
    collapseButtonText,
  },
  collapsed: () => false,
})(refinementList);

export const labels = labelRefinementList({
  container: '[data-widget="labels"]',
  attribute: 'label',
});
