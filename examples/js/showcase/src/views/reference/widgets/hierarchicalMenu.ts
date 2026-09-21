import { hierarchicalMenu as fn } from 'instantsearch.js/es/widgets';

import { uppercaseLabels } from '../transforms';
import { defineWidget } from '../types';

export const hierarchicalMenu = defineWidget({
  name: 'hierarchicalMenu',
  fn,
  slot: 'facet',
  replaces: [],
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
  // `separator` is deliberately absent: it has to match the separator baked
  // into the index' data (' > ' here), so changing it only breaks the display.
  toggles: [
    {
      key: 'showParentLevel',
      label: 'false',
      value: { showParentLevel: false },
    },
    {
      key: 'rootPath',
      label: "'Cameras & Camcorders'",
      requiresRestart: true,
      value: { rootPath: 'Cameras & Camcorders' },
    },
    {
      key: 'showMore',
      label: 'true',
      value: { showMore: true, limit: 3, showMoreLimit: 10 },
    },
    {
      key: 'sortBy',
      label: "['name:asc']",
      value: { sortBy: ['name:asc'] },
    },
    {
      key: 'transformItems',
      label: 'uppercaseLabels',
      value: { transformItems: uppercaseLabels },
    },
  ],
});
