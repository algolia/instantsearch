import { menuSelect as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const menuSelect = defineWidget({
  name: 'menuSelect',
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
      key: 'limit',
      label: '5',
      value: { limit: 5 },
    },
    {
      key: 'sortBy',
      label: "['name:asc']",
      value: { sortBy: ['name:asc'] },
    },
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
  ],
  // `showMore`/`showMoreLimit` come from connectMenu but a <select> has no
  // show-more affordance, so they'd do nothing here.
});
