import { hits as fn } from 'instantsearch.js/es/widgets';

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
      key: 'escapeHTML',
      label: 'false',
      value: { escapeHTML: false },
    },
    {
      key: 'transformItems',
      label: 'firstThreeOnly',
      value: { transformItems: firstThreeOnly },
    },
  ],
});
