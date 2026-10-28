import { clearRefinements as fn } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

export const clearRefinements = defineWidget({
  name: 'clearRefinements',
  fn,
  slot: 'meta',
  replaces: [],
  defaults: [],
  // Refine `brand` in the test interface to see this become enabled: by
  // default clearRefinements clears facet refinements but not the query.
  toggles: [
    {
      key: 'includedAttributes',
      // Throws if combined with the other attribute filter.
      group: 'attributeFilter',
      label: "['query']",
      value: { includedAttributes: ['query'] },
    },
    {
      key: 'excludedAttributes',
      // Throws if combined with the other attribute filter.
      group: 'attributeFilter',
      label: "['brand']",
      value: { excludedAttributes: ['brand'] },
    },
  ],
  // `transformItems` is omitted: it reshapes the list of attributes to clear,
  // and this widget renders a single button, so nothing is observable.
});
