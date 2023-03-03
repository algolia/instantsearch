import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  clearRefinements,
  hits,
  pagination,
  refinementList,
  searchBox,
} from 'instantsearch.js/es/widgets';

const search = instantsearch({
  indexName: 'instant_search',
  searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
});

search.addWidgets([
  searchBox({
    container: '#searchbox',
  }),
  clearRefinements({
    container: '#clear-refinements',
  }),
  refinementList({
    container: '#brand-list',
    attribute: 'brand',
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <div>
          <img src=${hit.image} align="left" alt=${hit.name} />
          <div class="hit-name">
            ${components.Highlight({ hit, attribute: 'name' })}
          </div>
          <div class="hit-description">
            ${components.Highlight({ hit, attribute: 'description' })}
          </div>
          <div class="hit-price">$${hit.price}</div>
        </div>
      `,
    },
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
