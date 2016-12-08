import algoliasearch from 'algoliasearch/reactnative';
import createInstantSearch from './src/core/createInstantSearch';

const InstantSearch = createInstantSearch(algoliasearch, {
  Root: 'View',
});
export {InstantSearch};
