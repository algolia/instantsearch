import { menu as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const menu = defineWidget({
  name: 'menu',
  fn,
  slot: 'facet',
  replaces: [],
  defaults: [
    {
      key: 'attribute',
      label: "'categories'",
      value: { attribute: 'categories' },
    },
  ],
  toggles: [
    {
      key: 'showMore',
      label: 'true',
      value: { showMore: true, limit: 3, showMoreLimit: 10 },
    },
    {
      key: 'sortBy',
      label: "['isRefined', 'name:asc']",
      value: { sortBy: ['isRefined', 'name:asc'] },
    },
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
  ],
});
