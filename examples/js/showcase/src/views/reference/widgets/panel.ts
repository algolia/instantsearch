import { panel, refinementList } from 'instantsearch.js/es/widgets';

import { defineWidget } from '../types';

/**
 * panel is a higher-order widget — `panel(options)(widgetFactory)` — so it
 * can't take the plain `fn({ container, ...options })` shape. The wrapped
 * widget is fixed here; the panel's own options are what vary.
 */
function fn({ container, ...panelOptions }: Record<string, any>) {
  return panel({
    templates: {
      header: () => 'Categories',
      collapseButtonText: ({ collapsed }) => (collapsed ? 'Show' : 'Hide'),
    },
    ...panelOptions,
  })(refinementList)({ container, attribute: 'categories' });
}

export const panelWidget = defineWidget({
  name: 'panel',
  fn,
  slot: 'facet',
  replaces: [],
  defaults: [],
  toggles: [
    {
      key: 'collapsed',
      label: '() => true',
      value: { collapsed: () => true },
    },
    {
      key: 'hidden',
      label: '({ results }) => results.nbHits === 0',
      value: {
        hidden: ({ results }: { results: { nbHits: number } | null }) =>
          results?.nbHits === 0,
      },
    },
  ],
});
