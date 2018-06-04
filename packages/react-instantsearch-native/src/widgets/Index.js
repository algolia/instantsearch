import { View } from 'react-native';
import { createIndex } from 'react-instantsearch-core';

const Index = createIndex({
  Root: View,
});

export default Index;
