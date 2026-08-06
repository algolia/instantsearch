import React from 'react';
import {
  useRefinementList,
  UseRefinementListProps,
} from 'react-instantsearch-core';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type RefinementListProps = UseRefinementListProps & {
  searchable?: boolean;
  searchablePlaceholder?: string;
  onChange?: () => void;
};

export function RefinementList({
  searchable = false,
  searchablePlaceholder = 'Search…',
  onChange,
  ...props
}: RefinementListProps) {
  const {
    items,
    refine,
    searchForItems,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList(props);

  return (
    <View>
      {searchable && (
        <TextInput
          style={styles.search}
          placeholder={searchablePlaceholder}
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={(text) => searchForItems(text)}
        />
      )}

      {items.map((item) => (
        <TouchableOpacity
          key={item.value}
          style={styles.item}
          onPress={() => {
            refine(item.value);
            onChange?.();
          }}
        >
          <View style={styles.labelRow}>
            <View
              style={[styles.checkbox, item.isRefined && styles.checkboxOn]}
            >
              {item.isRefined && <Text style={styles.checkboxMark}>✓</Text>}
            </View>
            <Text
              style={[styles.label, item.isRefined && styles.labelRefined]}
            >
              {item.label}
            </Text>
          </View>
          <View style={styles.count}>
            <Text style={styles.countText}>{item.count}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {canToggleShowMore && (
        <TouchableOpacity onPress={toggleShowMore}>
          <Text style={styles.showMore}>
            {isShowingMore ? 'Show less' : 'Show more'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: {
    height: 40,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f4f4f4',
    borderRadius: 4,
    fontSize: 14,
  },
  item: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: {
    backgroundColor: '#252b33',
    borderColor: '#252b33',
  },
  checkboxMark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  label: {
    fontSize: 15,
    flexShrink: 1,
  },
  labelRefined: {
    fontWeight: '700',
  },
  count: {
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginLeft: 8,
  },
  countText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
  },
  showMore: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#252b33',
  },
});
