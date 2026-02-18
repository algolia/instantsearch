import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  chat,
  clearRefinements,
  configure,
  EXPERIMENTAL_autocomplete,
  hits,
  pagination,
  panel,
  refinementList,
  stats,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  routing: true,
  insights: true,
});

const openOverlayButtons = Array.from(
  document.querySelectorAll<HTMLElement>('[data-action="open-overlay"]')
);
const closeOverlayButtons = Array.from(
  document.querySelectorAll<HTMLElement>('[data-action="close-overlay"]')
);

function openFilters() {
  document.body.classList.add('filtering');
}

function closeFilters() {
  document.body.classList.remove('filtering');
}

search.addWidgets([
  EXPERIMENTAL_autocomplete({
    container: '#autocomplete',
    detachedMediaQuery: '(max-width: 1024px)',
    placeholder: 'Search for products',
    indices: [
      {
        indexName: 'instant_search',
        templates: {
          header: (_, { html }) => html`
            <span class="ais-AutocompleteIndexHeaderTitle">Products</span>
            <span class="ais-AutocompleteIndexHeaderLine" />
          `,
          item: ({ item, onSelect }, { html }) => html`
            <div onClick=${onSelect}>${item.name}</div>
          `,
        },
        getURL: (item) => `/products.html?pid=${item.objectID}`,
      },
    ],
    showRecent: {
      templates: {
        header: (_, { html }) => html`
          <span class="ais-AutocompleteIndexHeaderTitle">Recent Searches</span>
          <span class="ais-AutocompleteIndexHeaderLine" />
        `,
      },
    },
    showSuggestions: {
      indexName: 'instant_search_demo_query_suggestions',
      templates: {
        header: (_, { html }) => html`
          <span class="ais-AutocompleteIndexHeaderTitle">Suggestions</span>
          <span class="ais-AutocompleteIndexHeaderLine" />
        `,
      },
    },
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
  panel({
    templates: { header: 'brand' },
  })(refinementList)({
    container: '#brand-list-mobile',
    attribute: 'brand',
  }),
  stats({
    container: '[data-widget="results-number-mobile"]',
    templates: {
      text({ nbHits }, { html }) {
        return html`<strong>${nbHits.toLocaleString()}</strong> results`;
      },
    },
  }),
  clearRefinements({
    container: '[data-widget="clear-filters-mobile"]',
    templates: {
      resetLabel: 'Reset filters',
    },
  }),
  stats({
    container: '[data-widget="save-filters-mobile"]',
    templates: {
      text({ nbHits }, { html }) {
        return html`
          <button class="button button-primary" type="button">
            See ${nbHits.toLocaleString()} results
          </button>
        `;
      },
    },
  }),
  pagination({
    container: '#pagination',
  }),
  chat({
    container: '#chat',
    agentId: 'eedef238-5468-470d-bc37-f99fa741bd25',
    templates: {
      item: (item, { html }) => html`
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
      `,
    },
  }),
]);

openOverlayButtons.forEach((button) => {
  button.addEventListener('click', openFilters);
});

closeOverlayButtons.forEach((button) => {
  button.addEventListener('click', closeFilters);
});

search.start();
