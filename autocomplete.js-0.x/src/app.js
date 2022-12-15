import algoliasearch from 'algoliasearch';
import autocomplete from 'autocomplete.js';

const client = algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76');
const index = client.initIndex('instant_search_demo_query_suggestions');

autocomplete(
  '#searchBox input[type=search]',
  {
    hint: false,
    debug: process.env.NODE_ENV === 'development',
  },
  [
    {
      source: autocomplete.sources.hits(index, { hitsPerPage: 5 }),
      displayKey: 'query',
      templates: {
        suggestion(suggestion) {
          return suggestion._highlightResult.query.value;
        },
      },
    },
  ]
).on('autocomplete:selected', (event, suggestion, dataset) => {
  // eslint-disable-next-line no-console
  console.log({ suggestion, dataset });
});
