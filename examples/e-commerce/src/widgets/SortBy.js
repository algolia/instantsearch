import { sortBy as sortByWidget } from 'instantsearch.js/es/widgets';

const sortBy = sortByWidget({
  container: '#sort-by',
  attribute: 'price',
  items: [
    {
      label: 'Sort by featured',
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

export default sortBy;
