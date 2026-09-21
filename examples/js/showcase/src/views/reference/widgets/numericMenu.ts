import { numericMenu as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const numericMenu = defineWidget({
  name: 'numericMenu',
  fn,
  slot: 'facet',
  replaces: [],
  defaults: [
    {
      key: 'attribute',
      label: "'price'",
      value: { attribute: 'price' },
    },
    {
      key: 'items',
      label:
        "[\n    { label: 'All' },\n    { label: '<= 10$', end: 10 },\n    { label: '10$ - 100$', start: 10, end: 100 },\n    { label: '>= 500$', start: 500 },\n  ]",
      value: {
        items: [
          { label: 'All' },
          { label: '<= 10$', end: 10 },
          { label: '10$ - 100$', start: 10, end: 100 },
          { label: '>= 500$', start: 500 },
        ],
      },
    },
  ],
  toggles: [
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
  ],
});
