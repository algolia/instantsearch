import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Configure, InstantSearch, useSearchBox } from 'react-instantsearch-core';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { CurrentRefinements } from './src/CurrentRefinements';
import { Filters } from './src/Filters';
import { Highlight } from './src/Highlight';
import { InfiniteHits } from './src/InfiniteHits';
import { createInsightsClient } from './src/insights';
import { NoResults, NoResultsBoundary } from './src/NoResults';
import { ProductDetail } from './src/ProductDetail';
import { Rating } from './src/Rating';
import { addRecentSearch, getRecentSearches } from './src/recentSearches';
import { TrendingItems } from './src/Recommend';
import {
  createAsyncStorageRouter,
  hydrateRouteState,
} from './src/router';
import { SearchBox } from './src/SearchBox';
import { Snippet } from './src/Snippet';
import { SortBy } from './src/SortBy';
import { Stats } from './src/Stats';
import { Suggestions } from './src/Suggestions';
import { ProductHit } from './types/ProductHit';

import type { Router, UiState } from 'instantsearch.js';

const APP_ID = 'latency';
const API_KEY = '6be0576ff61c053d5f9a3225e2a90f76';
const USER_TOKEN = 'react-native-demo-user';

const searchClient = algoliasearch(APP_ID, API_KEY);

export default function App() {
  const [routing, setRouting] = useState<{ router: Router<UiState> } | null>(
    null
  );
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [insightsClient] = useState(() =>
    createInsightsClient({
      appId: APP_ID,
      apiKey: API_KEY,
      initialUserToken: USER_TOKEN,
    })
  );

  // The custom router's `read()` is synchronous, so route state must be
  // hydrated from AsyncStorage before InstantSearch mounts.
  useEffect(() => {
    let isMounted = true;

    Promise.all([hydrateRouteState<UiState>(), getRecentSearches()]).then(
      ([initialRouteState, recents]) => {
        if (!isMounted) {
          return;
        }
        setRouting({ router: createAsyncStorageRouter({ initialRouteState }) });
        setRecentSearches(recents);
      }
    );

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <StatusBar style="light" />
        <View style={styles.container}>
          {routing ? (
            <InstantSearch
              searchClient={searchClient}
              indexName="instant_search"
              routing={routing}
              insights={{
                insightsClient,
                insightsInitParams: { useCookie: false, userToken: USER_TOKEN },
              }}
              future={{ preserveSharedStateOnUnmount: true }}
            >
              <Configure
                attributesToSnippet={['description:20']}
                snippetEllipsisText="…"
                hitsPerPage={12}
              />
              <SearchScreen
                recentSearches={recentSearches}
                onRecentSearchesChange={setRecentSearches}
              />
            </InstantSearch>
          ) : (
            <View style={styles.loading}>
              <ActivityIndicator color="#252b33" />
            </View>
          )}
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

type SearchScreenProps = {
  recentSearches: string[];
  onRecentSearchesChange: (recents: string[]) => void;
};

function SearchScreen({
  recentSearches,
  onRecentSearchesChange,
}: SearchScreenProps) {
  const listRef = useRef<FlatList<ProductHit>>(null);
  const { query, refine } = useSearchBox();
  const [isFocused, setFocused] = useState(false);
  const [isFiltersOpen, setFiltersOpen] = useState(false);
  const [selectedHit, setSelectedHit] = useState<ProductHit | null>(null);

  function scrollToTop() {
    listRef.current?.scrollToOffset({ animated: false, offset: 0 });
  }

  async function applyQuery(nextQuery: string) {
    refine(nextQuery);
    setFocused(false);
    Keyboard.dismiss();
    scrollToTop();
    const next = await addRecentSearch(nextQuery);
    onRecentSearchesChange(next);
  }

  return (
    <View style={styles.screen}>
      <SearchBox
        onChange={scrollToTop}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />

      {isFocused ? (
        <Suggestions
          query={query}
          recentSearches={recentSearches}
          onSelect={applyQuery}
        />
      ) : (
        <>
          <View style={styles.toolbar}>
            <Filters
              isModalOpen={isFiltersOpen}
              onToggleModal={() => setFiltersOpen((isOpen) => !isOpen)}
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
          <CurrentRefinements onChange={scrollToTop} />
          <Stats />
          <NoResultsBoundary fallback={<NoResults />}>
            <InfiniteHits
              ref={listRef}
              hitComponent={Hit}
              onHitPress={setSelectedHit}
              ListHeaderComponent={<TrendingItems onSelect={setSelectedHit} />}
            />
          </NoResultsBoundary>
        </>
      )}

      <ProductDetail
        hit={selectedHit}
        onClose={() => setSelectedHit(null)}
        onSelectHit={setSelectedHit}
      />
    </View>
  );
}

type HitProps = {
  hit: ProductHit;
};

function Hit({ hit }: HitProps) {
  return (
    <View style={styles.hit}>
      <Image style={styles.hitImage} source={{ uri: hit.image }} />
      <View style={styles.hitInfo}>
        <Text style={styles.hitCategory}>{hit.categories[0]}</Text>
        <Text style={styles.hitName} numberOfLines={1}>
          <Highlight hit={hit} attribute="name" />
        </Text>
        <Text style={styles.hitDescription} numberOfLines={2}>
          <Snippet hit={hit} attribute="description" />
        </Text>
        <View style={styles.hitFooter}>
          <Text style={styles.hitPrice}>${hit.price}</Text>
          <Rating value={Math.round(hit.rating)} />
        </View>
      </View>
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
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screen: {
    flex: 1,
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
  hit: {
    flexDirection: 'row',
  },
  hitImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginRight: 14,
  },
  hitInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  hitCategory: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#888',
    marginBottom: 2,
  },
  hitName: {
    fontSize: 15,
    fontWeight: '600',
  },
  hitDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#666',
  },
  hitFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  hitPrice: {
    fontSize: 15,
    fontWeight: '700',
  },
});
