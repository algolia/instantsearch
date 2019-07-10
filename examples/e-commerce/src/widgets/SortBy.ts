import { sortBy as sortByWidget } from 'instantsearch.js/es/widgets';

export const sortBy = sortByWidget({
  container: '[data-widget="sort-by"]',
  attribute: 'price',
  items: [
    {
      label: 'Featured',
      value: 'instant_search',
    },
    {
      label: 'Price ascending',
      value: 'instant_search_price_asc',
    },
    {
      label: 'Price descending',
      value: 'instant_search_price_desc',
    },
  ],
});
