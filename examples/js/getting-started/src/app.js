import { liteClient as algoliasearch } from 'algoliasearch/lite';
import 'instantsearch.css/devtools/inject';
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
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

const productItemTemplate = (item, { html }) => html`
  <article class="ais-Carousel-hit">
    <div class="ais-Carousel-hit-image">
      <img src="${item.image}" />
    </div>
    <h2 class="ais-Carousel-hit-title">
      <a
        href="/products.html?pid=${item.objectID}"
        class="ais-Carousel-hit-link"
      >
        ${item.name}
      </a>
    </h2>
  </article>
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
    agentId: '7c2f6816-bfdb-46e9-a51f-9cb8e5fc9628',
    templates: {
      item: productItemTemplate,
    },
  }),
]);

search.start();
