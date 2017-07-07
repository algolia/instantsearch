import { createInstantSearch } from './src/core/createInstantSearchServer';
import algoliasearch from 'algoliasearch/lite';

const cis = function() {
  return createInstantSearch(algoliasearch);
};

export { cis as createInstantSearch };
