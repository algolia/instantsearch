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
  experience,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '4ce25fa46f7de67117fc1b787742e0f3'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
  future: { enableExperience: { env: 'beta' } },
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
  }),
  // chat({
  //   container: '#chat',
  //   configId: '87d8f696-dc75-4421-a44a-255693f6b310',
  // }),
  experience({
    id: '87d8f696-dc75-4421-a44a-255693f6b310',
  }),
]);

search.start();
