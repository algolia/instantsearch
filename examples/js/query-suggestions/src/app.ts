import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  EXPERIMENTAL_autocomplete,
  chat,
  hits,
  pagination,
  panel,
  refinementList,
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

search.addWidgets([
  EXPERIMENTAL_autocomplete({
    container: '#autocomplete',
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
    showQuerySuggestions: {
      indexName: 'instant_search_demo_query_suggestions',
      searchParameters: {
        hitsPerPage: 2,
      },
      templates: {
        header: (_, { html }) => html`
          <span class="ais-AutocompleteIndexHeaderTitle">Suggestions</span>
          <span class="ais-AutocompleteIndexHeaderLine" />
        `,
      },
    },
    showPromptSuggestions: {
      indexName: 'instant_search_prompt_suggestions',
      searchParameters: {
        hitsPerPage: 2,
      },
      templates: {
        header: (_, { html }) => html`
          <span class="ais-AutocompleteIndexHeaderTitle">Ask AI</span>
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
  pagination({
    container: '#pagination',
  }),
  chat({
    container: '#chat',
    agentId: 'eedef238-5468-470d-bc37-f99fa741bd25',
  }),
]);

search.start();
