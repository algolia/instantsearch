import { rangeInput as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const rangeInput = defineWidget({
  name: 'rangeInput',
  fn,
  slot: 'facet',
  replaces: [],
  defaults: [
    {
      key: 'attribute',
      label: "'price'",
      value: { attribute: 'price' },
    },
  ],
  toggles: [
    {
      key: 'min',
      label: '50',
      value: { min: 50 },
    },
    {
      key: 'max',
      label: '500',
      value: { max: 500 },
    },
    {
      key: 'precision',
      label: '2',
      value: { precision: 2 },
    },
  ],
});
