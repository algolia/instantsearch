import { EXPERIMENTAL_autocomplete } from 'instantsearch.js/es/widgets';

export const searchBox = EXPERIMENTAL_autocomplete({
  container: '[data-widget="searchbox"]',
  indices: [
    {
      indexName: 'instant_search_demo_query_suggestions',
      searchParameters: {
        hitsPerPage: 3,
      },
      templates: {
        item: ({ item }, { html, components }) =>
          html`${components.ReverseHighlight({
            attribute: 'query',
            hit: item,
          })}`,
      },
      getQuery: (item) => item.query,
    },
  ],
});
