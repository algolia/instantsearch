import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { carousel } from 'instantsearch.js/es/templates';
import {
  breadcrumb,
  configure,
  hierarchicalMenu,
  hits,
  pagination,
  panel,
  searchBox,
  trendingItems,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'LOEC74WPH7',
  '3b38713a560044da51e7b1e56fac000f'
);

const search = instantsearch({
  indexName: 'pokedex-fr',
  searchClient,
  insights: true,
  collection: 'Gen 1 > Pokémon Souris',
});

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
          <div style="display: flex; align-items: center">
            <img
              src=${hit.sprites.regular}
              alt=${hit.name.fr}
              style="margin-right: 1rem"
              width="64"
            />
            <div>
              <h2>${components.Highlight({ hit, attribute: 'name.fr' })}</h2>
              <p>${components.Highlight({ hit, attribute: 'category' })}</p>
            </div>
          </div>
        </article>
      `,
    },
  }),
  configure({
    hitsPerPage: 8,
  }),
  panel({
    templates: { header: 'brand' },
  })(hierarchicalMenu)({
    container: '#brand-list',
  }),
  breadcrumb({
    container: '#breadcrumb',
  }),
  pagination({
    container: '#pagination',
  }),
  trendingItems({
    container: '#trending',
    limit: 6,
    templates: {
      item: (item, { html }) => html`
        <div>
          <article>
            <div>
              <img src="${item.sprites.regular}" />
              <h2>${item.name.fr}</h2>
            </div>
          </article>
        </div>
      `,
      layout: carousel(),
    },
  }),
]);

search.start();
