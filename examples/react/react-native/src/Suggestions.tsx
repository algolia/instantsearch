import React from 'react';
import { Configure, Index, useHits } from 'react-instantsearch-core';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SUGGESTIONS_INDEX = 'instant_search_demo_query_suggestions';

type SuggestionHit = {
  objectID: string;
  query: string;
};

function SuggestionHits({ onSelect }: { onSelect: (query: string) => void }) {
  const { items } = useHits<SuggestionHit>();

  if (items.length === 0) {
    return null;
  }

  return (
    <View>
      <Text style={styles.sectionTitle}>Suggestions</Text>
      {items.map((item) => (
        <TouchableOpacity
          key={item.objectID}
          style={styles.row}
          onPress={() => onSelect(item.query)}
        >
          <Text style={styles.rowIcon}>⌕</Text>
          <Text style={styles.rowText}>{item.query}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

type SuggestionsProps = {
  query: string;
  recentSearches: string[];
  onSelect: (query: string) => void;
};

// Query suggestions ride along in the same multi-index request as the main
// search via a nested `<Index>` — no second InstantSearch instance or manual
// client call needed. Recent searches are persisted separately in AsyncStorage.
export function Suggestions({
  query,
  recentSearches,
  onSelect,
}: SuggestionsProps) {
  const isEmptyQuery = query.trim() === '';

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.content}
    >
      {isEmptyQuery && recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent searches</Text>
          {recentSearches.map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.row}
              onPress={() => onSelect(item)}
            >
              <Text style={styles.rowIcon}>↺</Text>
              <Text style={styles.rowText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Index indexName={SUGGESTIONS_INDEX}>
        <Configure hitsPerPage={6} />
        <SuggestionHits onSelect={onSelect} />
      </Index>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingVertical: 8,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 4,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#888',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f2f2f2',
  },
  rowIcon: {
    fontSize: 16,
    color: '#888',
    marginRight: 12,
    width: 18,
    textAlign: 'center',
  },
  rowText: {
    fontSize: 15,
    flexShrink: 1,
  },
});
