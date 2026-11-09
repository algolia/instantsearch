import { hits as fn } from 'instantsearch.js';

import { renderProductCard } from '../../../components/widgets/ProductCard';
import { defineWidget } from '../types';

function firstThreeOnly<TItem>(items: TItem[]): TItem[] {
  return items.slice(0, 3);
}

export const hits = defineWidget({
  name: 'hits',
  fn,
  slot: 'results',
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
      key: 'transformItems',
      label: 'firstThreeOnly',
      value: { transformItems: firstThreeOnly },
    },
  ],
});
