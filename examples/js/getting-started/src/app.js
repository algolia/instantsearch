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
  'F4T6CUV2AH',
  '4e9f457696362671d337c42a0220bbf4'
);

const search = instantsearch({
  indexName: 'products',
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
    templates: { header: 'author' },
  })(refinementList)({
    container: '#brand-list',
    attribute: 'author',
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
