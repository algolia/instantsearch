import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar } from 'react-native';
import algoliasearch from 'algoliasearch';
import { InstantSearch } from 'react-instantsearch-native';
import SearchBox from './src/SearchBox';
import InfiniteHits from './src/InfiniteHits';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#252b33',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

const App = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <InstantSearch searchClient={searchClient} indexName="instant_search">
          <SearchBox />
          <InfiniteHits />
        </InstantSearch>
      </View>
    </SafeAreaView>
  );
};

export default App;
