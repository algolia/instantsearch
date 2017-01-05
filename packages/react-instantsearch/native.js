import algoliasearch from 'algoliasearch/reactnative';
import createInstantSearch from './src/core/createInstantSearch';
/* eslint-disable import/no-unresolved */
import {View} from 'react-native';
/* eslint-enable import/no-unresolved */
const InstantSearch = createInstantSearch(algoliasearch, {
  Root: View,
});
export {InstantSearch};
