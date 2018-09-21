import algoliasearch from 'algoliasearch/lite';
import { instantsearch } from '../index';
import './index.css';

const search = instantsearch({
  indexName: 'instant_search',
  searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
});

search.addWidgets([
  // Shared
  instantsearch.widgets.configure({
    hitsPerPage: 50,
  }),
  instantsearch.widgets.searchBox({
    container: '#search-box',
  }),

  // Index one
  instantsearch.widgets.index({ name: 'instant_search' }).addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: 4,
    }),
    instantsearch.widgets.refinementList({
      container: '#brand',
      attributeName: 'brand',
      limit: 5,
    }),
    instantsearch.widgets.hits({
      container: '#instant-search-hits',
      templates: {
        item: `
          <article>
            <h1>{{{_highlightResult.name.value}}}</h1>
            <p>{{{_highlightResult.description.value}}}</p>
          </article>
        `,
      },
    }),
    // instantsearch.widgets.pagination({
    //   container: '#instant-search-pagination',
    // }),
  ]),

  // Index two
  instantsearch.widgets.index({ name: 'bestbuy' }).addWidgets([
    instantsearch.widgets.configure({
      hitsPerPage: 4,
    }),
    instantsearch.widgets.refinementList({
      container: '#manufacturer',
      attributeName: 'manufacturer',
      limit: 5,
    }),
    instantsearch.widgets.hits({
      container: '#best-buy-hits',
      templates: {
        item: `
          <article>
            <h1>{{{_highlightResult.name.value}}}</h1>
            <p>{{{_highlightResult.shortDescription.value}}}</p>
          </article>
        `,
      },
    }),
    // instantsearch.widgets.pagination({
    //   container: '#best-buy-pagination',
    // }),
  ]),
]);

search.start();
