import React from 'react';
import { useSortBy, UseSortByProps } from 'react-instantsearch-core';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SortByProps = UseSortByProps & {
  onChange?: () => void;
};

export function SortBy({ onChange, ...props }: SortByProps) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === currentRefinement;

        return (
          <TouchableOpacity
            key={option.value}
            style={[styles.pill, isSelected && styles.pillSelected]}
            onPress={() => {
              refine(option.value);
              onChange?.();
            }}
          >
            <Text
              style={[styles.pillText, isSelected && styles.pillTextSelected]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    marginLeft: 6,
  },
  pillSelected: {
    backgroundColor: '#252b33',
    borderColor: '#252b33',
  },
  pillText: {
    fontSize: 14,
    color: '#252b33',
  },
  pillTextSelected: {
    color: '#ffffff',
  },
});
