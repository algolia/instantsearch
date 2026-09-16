import { currentRefinements as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const currentRefinements = defineWidget({
  name: 'currentRefinements',
  fn,
  slot: 'meta',
  defaults: [],
  // Refine `brand` in the test interface to give this something to list.
  toggles: [
    {
      key: 'includedAttributes',
      // Throws if combined with the other attribute filter.
      group: 'attributeFilter',
      label: "['brand']",
      value: { includedAttributes: ['brand'] },
    },
    {
      key: 'excludedAttributes',
      // Throws if combined with the other attribute filter.
      group: 'attributeFilter',
      label: "['brand']",
      value: { excludedAttributes: ['brand'] },
    },
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
  ],
});
