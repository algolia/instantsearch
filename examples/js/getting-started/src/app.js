import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  hits,
  pagination,
  panel,
  refinementList,
  searchBox,
  trendingItems,
} from 'instantsearch.js/es/widgets';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  insights: true,
});

// eslint-disable-next-line valid-jsdoc
/**
 * @type {import('instantsearch.js').Middleware}
 */
const middleware = () => {
  let isReady = false;
  return {
    $$type: 'ais.configuration',
    $$behavior: 'blocking',
    isReady() {
      return isReady;
    },
    subscribe({ done }) {
      // Walk through widgets until "block()" to retrieve configuration
      // Send request to configuration API
      setTimeout(() => {
        // Inject initial configuration results to instantSearchInstance
        // Release from blocking
        isReady = true;
        done();
      }, 1000);
    },
  };
};

search.use(middleware);

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
    templates: { header: () => 'brand' },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'brand',
  }),
  pagination({
    container: '#pagination',
  }),
  trendingItems({
    container: '#trending',
    limit: 4,
    templates: {
      item: (item, { html }) => html`
        <article>
          <div>
            <img src="${item.image}" />
            <h2>${item.name}</h2>
          </div>
          <a href="/products.html?pid=${item.objectID}">See product</a>
        </article>
      `,
    },
  }),
]);

search.start();
