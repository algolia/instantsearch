import { compositionClient } from '@algolia/composition';
import instantsearch from 'instantsearch.js';
import {
  configure,
  EXPERIMENTAL_autocomplete,
  hits,
  pagination,
} from 'instantsearch.js/es/widgets';

import 'instantsearch.css/themes/satellite.css';

const searchClient = compositionClient(
  '9HILZG6EJK',
  '65b3e0bb064c4172c4810fb2459bebd1'
);

const compositionID = 'comp1774447423386___products';

const search = instantsearch({
  // @ts-expect-error compositionClient return type doesn't fully match SearchClient yet
  searchClient,
  compositionID,
  insights: true,
});

search.addWidgets([
  configure({ hitsPerPage: 8 }),
  EXPERIMENTAL_autocomplete({
    container: '#autocomplete',
    placeholder: 'Search for products',
    feeds: [
      {
        feedID: 'products',
        templates: {
          header: (_, { html }) => html`
            <span class="ais-AutocompleteIndexHeaderTitle">Products</span>
            <span class="ais-AutocompleteIndexHeaderLine" />
          `,
          item: ({ item, onSelect }, { html }) => html`
            <div onClick=${onSelect}>${(item as any).title}</div>
          `,
        },
      },
      {
        feedID: 'Fashion',
        templates: {
          header: (_, { html }) => html`
            <span class="ais-AutocompleteIndexHeaderTitle">Fashion</span>
            <span class="ais-AutocompleteIndexHeaderLine" />
          `,
          item: ({ item, onSelect }, { html }) => html`
            <div onClick=${onSelect}>${(item as any).name}</div>
          `,
        },
      },
      {
        feedID: 'Amazon',
        templates: {
          header: (_, { html }) => html`
            <span class="ais-AutocompleteIndexHeaderTitle">Amazon</span>
            <span class="ais-AutocompleteIndexHeaderLine" />
          `,
          item: ({ item, onSelect }, { html }) => html`
            <div onClick=${onSelect}>${(item as any).product_title}</div>
          `,
        },
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
  }),
  hits({
    container: '#hits',
    templates: {
      item: (hit, { html, components }) => html`
        <article>
          <h1>${components.Highlight({ hit, attribute: 'title' })}</h1>
          <p>${(hit as any).author?.join?.(', ')}</p>
        </article>
      `,
    },
  }),
  pagination({
    container: '#pagination',
  }),
]);

search.start();
