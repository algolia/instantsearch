import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

import { search } from './search';
import { hitItem } from './templates';

search.addWidgets([
  configure({
    hitsPerPage: 8,
  }),
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    cssClasses: { list: 'grid gap-2 grid-cols-3' },
    templates: {
      item: (hit, { html, components }) => hitItem({ hit, html, components }),
    },
  }),
  panel({
    templates: { header: (_, { html }) => html`Brand` },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
