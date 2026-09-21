import { pagination as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const pagination = defineWidget({
  name: 'pagination',
  fn,
  slot: 'toolbar',
  replaces: [],
  defaults: [],
  toggles: [
    {
      key: 'padding',
      label: '1',
      value: { padding: 1 },
    },
    {
      key: 'totalPages',
      label: '5',
      value: { totalPages: 5 },
    },
    {
      key: 'showFirst',
      label: 'false',
      value: { showFirst: false },
    },
    {
      key: 'showLast',
      label: 'false',
      value: { showLast: false },
    },
    {
      key: 'showPrevious',
      label: 'false',
      value: { showPrevious: false },
    },
    {
      key: 'showNext',
      label: 'false',
      value: { showNext: false },
    },
    {
      key: 'scrollTo',
      flavors: ['js'],
      label: 'false',
      value: { scrollTo: false },
    },
  ],
});
