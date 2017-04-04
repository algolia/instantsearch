import algoliasearch from 'algoliasearch/reactnative';
import createInstantSearch from './src/core/createInstantSearch';
import createIndex from './src/core/createIndex';
import { View } from 'react-native';
const InstantSearch = createInstantSearch(algoliasearch, {
  Root: View,
});
export { InstantSearch };
const Index = createIndex({
  Root: View,
});
export { Index };
export { default as Configure } from './src/widgets/Configure.js';
