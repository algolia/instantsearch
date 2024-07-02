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

const searchClient = algoliasearch(
  'F4T6CUV2AH',
  '02022fd5de7c24bcde770bfab52ea473'
);

const search = instantsearch({
  indexName: 'fx_hackathon_24_bm_products',
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
              >${components.Highlight({ hit, attribute: 'title_model' })}</a
            >
          </h1>
          <img src="${hit.image1}" />
          <p>${hit.price}</p>
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
    attribute: 'brand_label',
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
