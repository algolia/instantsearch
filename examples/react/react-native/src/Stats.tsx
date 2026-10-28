import React from 'react';
import { useStats } from 'react-instantsearch-core';
import { StyleSheet, Text, View } from 'react-native';

export function Stats() {
  const { nbHits, processingTimeMS } = useStats();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {nbHits.toLocaleString()} results in {processingTimeMS}ms
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: 12,
    color: '#666',
  },
});
