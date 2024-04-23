import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, hits, relatedProducts } from 'instantsearch.js/es/widgets';

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
    cssClasses: { item: 'ais-Hits-item--single' },
  }),
  relatedProducts({
    container: '#related-products',
    objectIDs: [pid],
    maxRecommendations: 4,
    templates: {
      item: (hit, { html }) => html`
        <article>
          <div>
            <img src="${hit.image}" />
            <h2>${hit.name}</h2>
          </div>
          <a href="/products.html?pid=${hit.objectID}">See product</a>
        </article>
      `,
    },
  }),
  configure({
    hitsPerPage: 1,
    filters: `objectID:${pid}`,
  }),
]);

search.start();
