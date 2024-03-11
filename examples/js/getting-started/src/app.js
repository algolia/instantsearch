import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  hits,
  index,
  searchBox,
  refinementList,
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

const itemComponent = (hit, { html, components }) => html`
  <article>
    <h1>${components.ReverseHighlight({ hit, attribute: 'query' })}</h1>
    <p>${components.Highlight({ hit, attribute: 'description' })}</p>
  </article>
`;

search.addWidgets([
  index({
    indexName: 'instant_search_demo_query_suggestions',
    separate: true,
  }).addWidgets([
    searchBox({
      container: '#searchbox',
    }),
    hits({
      container: '#hits',
      templates: {
        item: (hit, { html, components }) => html`
          ${components.ReverseHighlight({ hit, attribute: 'query' })}
        `,
      },
    }),
  ]),
  refinementList({ container: '#filters', attribute: 'brand' }),
  hits({
    container: '#hits2',
    templates: {
      item: itemComponent,
    },
  }),
]);

search.start();
