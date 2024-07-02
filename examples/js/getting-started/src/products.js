import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { configure, hits, relatedProducts } from 'instantsearch.js/es/widgets';

const searchParams = new URLSearchParams(document.location.search);

const pid = searchParams.get('pid');

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
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
          <img src="${hit.image1}" />
          <div>
            <h1>${components.Highlight({ hit, attribute: 'title_model' })}</h1>

            <p>${hit.price}</p>
          </div>
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
