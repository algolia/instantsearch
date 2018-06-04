import algoliasearch from 'algoliasearch/lite';
import { createInstantSearch } from 'react-instantsearch-core';

const InstantSearch = createInstantSearch(algoliasearch, {
  Root: 'div',
  props: {
    className: 'ais-InstantSearch__root',
  },
});

export default InstantSearch;
