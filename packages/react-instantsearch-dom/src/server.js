import algoliasearch from 'algoliasearch/lite';
import createInstantSearchServer from './core/createInstantSearchServer';

export const createInstantSearch = () =>
  createInstantSearchServer(algoliasearch);
