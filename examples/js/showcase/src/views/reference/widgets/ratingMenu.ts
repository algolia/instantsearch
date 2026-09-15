import { ratingMenu as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const ratingMenu = defineWidget({
  name: 'ratingMenu',
  fn,
  slot: 'facet',
  replaces: [],
  defaults: [
    {
      key: 'attribute',
      label: "'rating'",
      value: { attribute: 'rating' },
    },
  ],
  toggles: [
    {
      key: 'max',
      label: '3',
      value: { max: 3 },
    },
  ],
});
