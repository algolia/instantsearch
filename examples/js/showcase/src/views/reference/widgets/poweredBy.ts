import { poweredBy as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const poweredBy = defineWidget({
  name: 'poweredBy',
  fn,
  slot: 'toolbar',
  replaces: [],
  defaults: [],
  toggles: [
    {
      key: 'theme',
      label: "'dark'",
      value: { theme: 'dark' },
    },
    {
      key: 'url',
      label: "'https://www.algolia.com'",
      value: { url: 'https://www.algolia.com' },
    },
  ],
});
