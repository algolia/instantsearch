import React from 'react';
import {
  useClearRefinements,
  useInstantSearch,
} from 'react-instantsearch-core';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function NoResults() {
  const { results } = useInstantSearch();
  const { canRefine: canClear, refine: clear } = useClearRefinements();

  const hasRefinements = results.getRefinements().length > 0;
  const description = hasRefinements
    ? 'Try to reset your applied filters.'
    : 'Please try another query.';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Sorry, we can&apos;t find any matches to your query!
      </Text>
      <Text style={styles.description}>{description}</Text>
      {canClear && (
        <TouchableOpacity style={styles.button} onPress={() => clear()}>
          <Text style={styles.buttonText}>Clear filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function NoResultsBoundary({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  const { results } = useInstantSearch();

  // `__isArtificial` is set on the initial render before any results come
  // back, so we avoid flashing the empty state during the first query.
  if (!results.__isArtificial && results.nbHits === 0) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: '#252b33',
    borderRadius: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
