import algoliarecommend from '@algolia/recommend';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

const APPLICATION_ID = 'latency';
const SEARCH_API_KEY = '6be0576ff61c053d5f9a3225e2a90f76';

const searchClient = algoliasearch(APPLICATION_ID, SEARCH_API_KEY);
const recommendClient = algoliarecommend(APPLICATION_ID, SEARCH_API_KEY);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  recommendClient,
  insights: true,
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
          <h1>${components.Highlight({ hit, attribute: 'name' })}</h1>
          <p>${components.Highlight({ hit, attribute: 'description' })}</p>
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
