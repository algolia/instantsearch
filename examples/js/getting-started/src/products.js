import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { carousel } from 'instantsearch.js/es/templates';
import { configure, hits, relatedProducts } from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchParams = new URLSearchParams(document.location.search);

const pid = searchParams.get('pid');

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

search.addWidgets([
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
          <img src="${hit.image}" />
          <div>
            <h1>${components.Highlight({ hit, attribute: 'name' })}</h1>
            <p>${components.Highlight({ hit, attribute: 'description' })}</p>
          </div>
        </article>
      `,
    },
    cssClasses: { root: 'ais-Hits--single' },
  }),
  relatedProducts({
    container: '#related-products',
    objectIDs: [pid],
    limit: 6,
    templates: {
      item: (item, { html }) => html`
        <div>
          <article>
            <div>
              <img src="${item.image}" />
              <h2>${item.name}</h2>
            </div>
            <a href="/products.html?pid=${item.objectID}">See product</a>
          </article>
        </div>
      `,
      layout: carousel(),
    },
  }),
  configure({
    hitsPerPage: 1,
    filters: `objectID:${pid}`,
  }),
]);

search.start();
