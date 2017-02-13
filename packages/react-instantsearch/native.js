import algoliasearch from 'algoliasearch/reactnative';
import createInstantSearch from './src/core/createInstantSearch';
import createMultiIndexContext from './src/core/createMultiIndexContext';
import {View} from 'react-native';
const InstantSearch = createInstantSearch(algoliasearch, {
  Root: View,
});
export {InstantSearch};
const MultiIndexContext = createMultiIndexContext({
  Root: View,
});
export {MultiIndexContext};
export {default as Configure} from './src/widgets/Configure.js';
