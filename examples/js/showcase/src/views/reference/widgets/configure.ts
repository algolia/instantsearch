import { configure } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

/**
 * configure takes search parameters directly and renders nothing, so it drops
 * the container. Its effect shows up in the test interface on the right.
 */
function fn({
  container: _container,
  ...searchParameters
}: Record<string, any>) {
  return configure(searchParameters);
}

export const configureWidget = defineWidget({
  name: 'configure',
  fn,
  slot: 'standalone',
  replaces: ['configure'],
  defaults: [],
  toggles: [
    {
      key: 'hitsPerPage',
      label: '3',
      value: { hitsPerPage: 3 },
    },
    {
      key: 'filters',
      label: "'brand:Apple'",
      value: { filters: 'brand:Apple' },
    },
    {
      key: 'analytics',
      label: 'false',
      value: { analytics: false },
    },
  ],
});
