import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { InstantSearch } from 'react-instantsearch-core';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { Filters } from './src/Filters';
import { Highlight } from './src/Highlight';
import { InfiniteHits } from './src/InfiniteHits';
import { SearchBox } from './src/SearchBox';
import { SortBy } from './src/SortBy';
import { Stats } from './src/Stats';
import { ProductHit } from './types/ProductHit';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

export default function App() {
  const listRef = useRef<FlatList<ProductHit>>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  function scrollToTop() {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <InstantSearch
            searchClient={searchClient}
            indexName="instant_search"
            future={{ preserveSharedStateOnUnmount: true }}
          >
            <SearchBox onChange={scrollToTop} />
            <View style={styles.toolbar}>
              <Filters
                isModalOpen={isModalOpen}
                onToggleModal={() => setModalOpen((isOpen) => !isOpen)}
                onChange={scrollToTop}
              />
              <SortBy
                items={[
                  { label: 'Featured', value: 'instant_search' },
                  { label: 'Price ↑', value: 'instant_search_price_asc' },
                  { label: 'Price ↓', value: 'instant_search_price_desc' },
                ]}
                onChange={scrollToTop}
              />
            </View>
            <Stats />
            <InfiniteHits ref={listRef} hitComponent={Hit} />
          </InstantSearch>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

type HitProps = {
  hit: ProductHit;
};

function Hit({ hit }: HitProps) {
  return (
    <View>
      <Text style={styles.hitName}>
        <Highlight hit={hit} attribute="name" />
      </Text>
      <Text style={styles.hitMeta}>
        {hit.brand} · ${hit.price}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#252b33',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  hitName: {
    fontSize: 15,
  },
  hitMeta: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
});
