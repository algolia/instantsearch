import { createInfiniteHitsSessionStorageCache } from 'instantsearch.js/es/lib/infiniteHitsCache';
import { infiniteHits as fn } from 'instantsearch.js/es/widgets';

import { renderProductCard } from '../../../components/widgets/ProductCard';
import { defineWidget } from '../types';

export const infiniteHits = defineWidget({
  name: 'infiniteHits',
  fn,
  slot: 'results',
  replaces: ['hits'],
  defaults: [
    {
      key: 'templates',
      flavors: ['js'],
      label: '{ item: renderProductCard }',
      value: { templates: { item: renderProductCard } },
    },
  ],
  toggles: [
    {
      key: 'showPrevious',
      label: 'true',
      value: { showPrevious: true },
    },
    {
      key: 'cache',
      label: 'sessionStorageCache',
      value: { cache: createInfiniteHitsSessionStorageCache() },
    },
    {
      key: 'escapeHTML',
      label: 'false',
      value: { escapeHTML: false },
    },
  ],
});
