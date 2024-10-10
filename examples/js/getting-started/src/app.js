import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  composition,
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'DIYPADIATS',
  'c96176e1b36590680fb3d36bc480d592',
  { authMode: 'WithinHeaders' }
);

const search = instantsearch({
  indexName: 'asos_FR',
  routing: true,
  searchClient,
  insights: true,
});

search.addWidgets([
  composition({ compositionId: 'asos_FR' }).addWidgets([
    searchBox({
      container: '#searchbox',
    }),
    hits({
      container: '#hits',
      templates: {
        item: (hit, { html }) => html`
          <article>
            <h1>
              <a href="/products.html?pid=${hit.objectID}">${hit.name}</a>
            </h1>
            <p>${hit.colour}</p>
            <p>€${hit.price}</p>
            <p>${hit.brand}</p>
          </article>
        `,
      },
    }),
    configure({
      hitsPerPage: 8,
    }),
    panel({
      templates: { header: () => 'brand' },
    })(refinementList)({
      container: '#brand-list',
      attribute: 'brand',
    }),
    pagination({
      container: '#pagination',
    }),
  ]),
]);

search.start();
