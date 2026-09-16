import { rangeSlider as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const rangeSlider = defineWidget({
  name: 'rangeSlider',
  fn,
  flavors: ['js'],
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
      key: 'pips',
      label: 'false',
      value: { pips: false },
    },
    {
      key: 'tooltips',
      label: 'false',
      value: { tooltips: false },
    },
    {
      key: 'step',
      label: '100',
      value: { step: 100 },
    },
    {
      key: 'min',
      label: '0',
      value: { min: 0 },
    },
    {
      key: 'max',
      label: '500',
      value: { max: 500 },
    },
    {
      key: 'precision',
      label: '0',
      value: { precision: 0 },
    },
  ],
});
