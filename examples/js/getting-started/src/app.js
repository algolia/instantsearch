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
  chat,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'latency',
  '312a11382a63bdfc06e3183492fc469f'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

const productItemTemplate = (item, { html }) => html`
  <div>
    <article>
      <div>
        <img src="${item.image}" />
        <h2>${item.name}</h2>
      </div>
      <a href="/products.html?pid=${item.objectID}">See product</a>
    </article>
  </div>
`;

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
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
      item: productItemTemplate,
      layout: carousel(),
    },
  }),
  chat({
    container: '#chat',
    agentId: '8f80fec3-f86a-1c8-86bb-426cb067cbbd',
    templates: {
      item: productItemTemplate,
    },
  }),
]);

search.start();
