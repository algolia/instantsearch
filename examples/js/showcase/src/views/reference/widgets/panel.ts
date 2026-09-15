import { panel, refinementList } from 'instantsearch.js/es/widgets';

import { defineWidget, deriveNames } from '../types';

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
  })(refinementList)({ container, ...wrappedAttribute.value });
}

const wrappedAttribute = {
  key: 'attribute',
  label: "'categories'",
  value: { attribute: 'categories' },
};

export const panelWidget = defineWidget({
  name: 'panel',
  fn,
  // panel(options)(refinementList)({ attribute: 'categories' })
  wraps: {
    name: deriveNames('refinementList'),
    options: [wrappedAttribute],
  },
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
