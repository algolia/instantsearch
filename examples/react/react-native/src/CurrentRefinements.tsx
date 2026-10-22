import React from 'react';
import {
  useCurrentRefinements,
  UseCurrentRefinementsProps,
} from 'react-instantsearch-core';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

type CurrentRefinementsProps = UseCurrentRefinementsProps & {
  onChange?: () => void;
};

export function CurrentRefinements({
  onChange,
  ...props
}: CurrentRefinementsProps) {
  const { items, refine } = useCurrentRefinements(props);

  if (items.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {items.map((item) =>
        item.refinements.map((refinement) => (
          <TouchableOpacity
            key={[item.indexName, item.attribute, refinement.label].join('/')}
            style={styles.chip}
            onPress={() => {
              refine(refinement);
              onChange?.();
            }}
          >
            <Text style={styles.chipLabel}>{refinement.label}</Text>
            <Text style={styles.chipClose}>✕</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    maxHeight: 48,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef0f4',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  chipLabel: {
    fontSize: 13,
    color: '#252b33',
  },
  chipClose: {
    fontSize: 11,
    color: '#888',
    marginLeft: 6,
  },
});
