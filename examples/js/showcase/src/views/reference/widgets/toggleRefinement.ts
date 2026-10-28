import { toggleRefinement as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const toggleRefinement = defineWidget({
  name: 'toggleRefinement',
  fn,
  slot: 'facet',
  replaces: [],
  defaults: [
    {
      key: 'attribute',
      label: "'free_shipping'",
      value: { attribute: 'free_shipping' },
    },
  ],
  toggles: [
    {
      key: 'on',
      label: 'false',
      value: { on: false },
    },
    {
      key: 'off',
      label: 'true',
      value: { off: true },
    },
  ],
});
