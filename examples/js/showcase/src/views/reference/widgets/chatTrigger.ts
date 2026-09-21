import { chatTrigger as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const chatTrigger = defineWidget({
  name: 'chatTrigger',
  fn,
  flavors: ['js', 'react'],
  // A small button, so it sits with the other metadata controls.
  slot: 'meta',
  replaces: [],
  // The trigger only opens a chat, so one has to be on the page with it.
  requiresWidgets: ['chat'],
  defaults: [
    {
      // The widget itself defaults to `true`, which pins the button to the
      // viewport corner — wrong for a reference panel.
      key: 'floating',
      label: 'false',
      value: { floating: false },
    },
  ],
  toggles: [
    {
      key: 'floating',
      label: 'true',
      value: { floating: true },
    },
  ],
});
