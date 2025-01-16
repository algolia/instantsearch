import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { carousel } from 'instantsearch.js/es/templates';
import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
  trendingItems,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

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
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components, sendEvent }) => html`
        <article
          onclick="${(event) => {
            event.stopPropagation();
            event.preventDefault();

            sendEvent('click', hit, 'some event');
          }}"
        >
          <h1>
            <a href="/products.html?pid=${hit.objectID}"
              >${components.Highlight({ hit, attribute: 'name' })}</a
            >
          </h1>
          <p>${components.Highlight({ hit, attribute: 'description' })}</p>
          <a href="/products.html?pid=${hit.objectID}">See product</a>
        </article>
      `,
    },
  }),
  configure({
    hitsPerPage: 8,
  }),
  panel({
    templates: { header: 'brand' },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
  trendingItems({
    container: '#trending',
    limit: 6,
    templates: {
      item: (item, { html, sendEvent }) => html`
        <div
          onclick="${(event) => {
            event.stopPropagation();
            event.preventDefault();

            sendEvent('click', item, 'some event');
          }}"
        >
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
]);

search.start();
