import { sortBy as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const sortBy = defineWidget({
  name: 'sortBy',
  fn,
  slot: 'toolbar',
  replaces: [],
  defaults: [
    {
      key: 'items',
      label:
        "[\n    { value: 'instant_search', label: 'Relevance' },\n    { value: 'instant_search_price_asc', label: 'Price asc.' },\n    { value: 'instant_search_price_desc', label: 'Price desc.' },\n  ]",
      value: {
        items: [
          { value: 'instant_search', label: 'Relevance' },
          { value: 'instant_search_price_asc', label: 'Price asc.' },
          { value: 'instant_search_price_desc', label: 'Price desc.' },
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
