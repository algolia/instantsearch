import { breadcrumb as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const breadcrumb = defineWidget({
  name: 'breadcrumb',
  fn,
  slot: 'meta',
  replaces: [],
  // A breadcrumb has no trail until a hierarchical refinement exists.
  requiresWidgets: ['hierarchicalMenu'],
  sharedOptions: ['rootPath'],
  defaults: [
    {
      key: 'attributes',
      label:
        "[\n    'hierarchicalCategories.lvl0',\n    'hierarchicalCategories.lvl1',\n    'hierarchicalCategories.lvl2',\n  ]",
      value: {
        attributes: [
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ],
      },
    },
  ],
  // `separator` is omitted: it must match the separator in the index' data.
  toggles: [
    {
      key: 'rootPath',
      label: "'Cameras & Camcorders'",
      requiresRestart: true,
      value: { rootPath: 'Cameras & Camcorders' },
    },
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
  ],
});
