import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  hits,
  searchBox,
  experience,
  configure,
  panel,
  refinementList,
  pagination,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '4ce25fa46f7de67117fc1b787742e0f3'
);

const search = instantsearch({
  indexName: 'spencer_and_williams',
  searchClient,
  insights: true,
  future: { enableExperience: { env: 'beta' } },
});

search.addWidgets([
  experience({
    id: 'agent-ui-7354b616-d29e-4f47-b339-205f3c8f0222',
  }),
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
]);

search.start();
