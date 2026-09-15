import { hitsPerPage as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const hitsPerPage = defineWidget({
  name: 'hitsPerPage',
  fn,
  slot: 'toolbar',
  replaces: ['configure'],
  defaults: [
    {
      key: 'items',
      label:
        "[\n    { label: '3 hits per page', value: 3 },\n    { label: '6 hits per page', value: 6 },\n    { label: '9 hits per page', value: 9, default: true },\n  ]",
      value: {
        items: [
          { label: '3 hits per page', value: 3 },
          { label: '6 hits per page', value: 6 },
          { label: '9 hits per page', value: 9, default: true },
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
